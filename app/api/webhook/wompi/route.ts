// app/api/webhook/wompi/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

const WOMPI_SECRET = process.env.WOMPI_SECRET; // Obtienes esto del dashboard de Wompi

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verificar la autenticidad del webhook (opcional pero recomendado)
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Procesar diferentes tipos de eventos
    switch (event.event) {
      case 'transaction.updated':
        await handleTransactionUpdate(event.data);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
        
      case 'subscription.payment_succeeded':
        await handleSubscriptionPayment(event.data);
        break;
        
      case 'subscription.payment_failed':
        await handleSubscriptionPaymentFailed(event.data);
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleTransactionUpdate(transaction: any) {
  try {
    const { reference, status, amount_in_cents } = transaction;
    
    // Buscar la transacción en nuestra base de datos
    const { data: transaccion, error: transError } = await supabase
      .from('transacciones_pendientes')
      .select('*')
      .eq('wompi_reference', reference)
      .single();

    if (transError || !transaccion) {
      console.error('Transaction not found:', reference);
      return;
    }

    // Actualizar estado de la transacción
    await supabase
      .from('transacciones_pendientes')
      .update({
        status: status,
        completed_at: new Date().toISOString()
      })
      .eq('wompi_reference', reference);

    // Si el pago fue aprobado, activar la suscripción
    if (status === 'APPROVED') {
      await activateSubscription(transaccion.user_id, transaccion.plan_id);
    }

  } catch (error) {
    console.error('Error handling transaction update:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const { customer_email, plan_id, status } = subscription;
    
    // Buscar cliente por email
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id_cliente')
      .eq('correo', customer_email)
      .single();

    if (cliente && status === 'ACTIVE') {
      // Calcular fecha de vencimiento (1 mes desde ahora)
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

      // Activar suscripción cuando se crea exitosamente
      await supabase
        .from('clientes')
        .update({
          suscripcion_activa: true,
          estado_suscripcion: 'activa',
          fecha_vencimiento_plan: fechaVencimiento.toISOString(),
          activo: 'Activo',
          plan: plan_id,
          fecha_cambio_estado: new Date().toISOString()
        })
        .eq('id_cliente', cliente.id_cliente);
        
      console.log('Subscription created and activated for user:', cliente.id_cliente);
    }
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionPayment(subscription: any) {
  try {
    // Para pagos recurrentes mensuales
    const { customer_email, amount_in_cents, status } = subscription;
    
    if (status === 'APPROVED') {
      // Buscar cliente por email y mantener activa su suscripción
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('correo', customer_email)
        .single();

      if (cliente) {
        // Calcular nueva fecha de vencimiento (1 mes desde ahora)
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

        await supabase
          .from('clientes')
          .update({
            suscripcion_activa: true,
            estado_suscripcion: 'activa',
            fecha_vencimiento_plan: fechaVencimiento.toISOString(),
            activo: 'Activo',
            fecha_cambio_estado: new Date().toISOString()
          })
          .eq('id_cliente', cliente.id_cliente);
      }
    }
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

async function handleSubscriptionPaymentFailed(subscription: any) {
  try {
    const { customer_email } = subscription;
    
    // Buscar cliente y marcarlo como inactivo por falta de pago
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id_cliente')
      .eq('correo', customer_email)
      .single();

    if (cliente) {
      await supabase
        .from('clientes')
        .update({
          suscripcion_activa: false,
          estado_suscripcion: 'vencida',
          activo: 'Inactivo por pago',
          fecha_cambio_estado: new Date().toISOString()
        })
        .eq('id_cliente', cliente.id_cliente);
    }
  } catch (error) {
    console.error('Error handling subscription payment failure:', error);
  }
}

async function activateSubscription(userId: string, planId: string) {
  try {
    // Calcular fecha de vencimiento (1 mes desde ahora)
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

    // Actualizar el cliente para activar su suscripción
    const { error } = await supabase
      .from('clientes')
      .update({
        suscripcion_activa: true,
        estado_suscripcion: 'activa',
        fecha_vencimiento_plan: fechaVencimiento.toISOString(),
        activo: 'Activo',
        plan: planId,
        fecha_cambio_estado: new Date().toISOString()
      })
      .eq('id_cliente', userId);

    if (error) {
      console.error('Error activating subscription:', error);
    } else {
      console.log('Subscription activated for user:', userId);
    }
  } catch (error) {
    console.error('Error in activateSubscription:', error);
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
    // En ambiente de pruebas, skip la verificación si no hay secret
    if (!WOMPI_SECRET || WOMPI_SECRET === 'temp_secret') {
      console.log('Webhook verification skipped - development mode');
      return true;
    }
    
    if (!signature) return false;
    
    const expectedSignature = crypto
      .createHmac('sha256', WOMPI_SECRET)
      .update(body)
      .digest('hex');
      
    return signature === expectedSignature;
  }