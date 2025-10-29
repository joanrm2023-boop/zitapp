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

    console.log('=== PROCESANDO WEBHOOK TRANSACCIÓN ===');
    console.log('Reference:', reference);
    console.log('Status:', status);
    console.log('Transacción encontrada:', {
      id: transaccion.id,
      user_id: transaccion.user_id,
      plan_id: transaccion.plan_id,
      user_email: transaccion.user_email,
      notificaciones_incluidas: transaccion.notificaciones_incluidas
    });

    // Verificar que tenemos user_id
    let userId = transaccion.user_id;
    
    // Si no tenemos user_id, buscarlo por email
    if (!userId && transaccion.user_email) {
      console.log('User ID no encontrado, buscando por email:', transaccion.user_email);
      
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('correo', transaccion.user_email)
        .single();

      if (!clienteError && cliente) {
        userId = cliente.id_cliente;
        console.log('User ID encontrado por email:', userId);
        
        // Actualizar la transacción con el user_id correcto
        await supabase
          .from('transacciones_pendientes')
          .update({ user_id: userId })
          .eq('id', transaccion.id);
      } else {
        console.error('No se pudo encontrar cliente por email:', transaccion.user_email);
      }
    }

    // Actualizar estado de la transacción
    const updateData: any = {
      status: status,
      completed_at: new Date().toISOString()
    };

    // Si ahora tenemos user_id, incluirlo en la actualización
    if (userId) {
      updateData.user_id = userId;
    }

    await supabase
      .from('transacciones_pendientes')
      .update(updateData)
      .eq('wompi_reference', reference);

    console.log('Estado de transacción actualizado:', status);

    // Si el pago fue aprobado, activar la suscripción
    if (status === 'APPROVED' && userId) {
      console.log('Pago aprobado, activando suscripción para user:', userId);
      await activateSubscription(userId, transaccion.plan_id, transaccion.notificaciones_incluidas);
    } else if (status === 'APPROVED' && !userId) {
      console.error('Pago aprobado pero no se pudo determinar el user_id');
    }

    console.log('=== FIN PROCESAMIENTO WEBHOOK ===');

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
      // Calcular fecha de vencimiento (30 días desde hoy, solo fecha)
      const hoy = new Date();
      const fechaVencimiento = new Date(hoy);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
      const fechaVencimientoFinal = fechaVencimiento.toISOString().split('T')[0]; // ✅ Solo fecha

      // Activar suscripción cuando se crea exitosamente
      await supabase
        .from('clientes')
        .update({
          suscripcion_activa: true,
          estado_suscripcion: 'activa',
          fecha_vencimiento_plan: fechaVencimientoFinal, // ✅ CAMBIO AQUÍ
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
        // Calcular nueva fecha de vencimiento (30 días desde hoy, solo fecha)
        const hoy = new Date();
        const fechaVencimiento = new Date(hoy);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        const fechaVencimientoFinal = fechaVencimiento.toISOString().split('T')[0]; // ✅ Solo fecha

        await supabase
          .from('clientes')
          .update({
            suscripcion_activa: true,
            estado_suscripcion: 'activa',
            fecha_vencimiento_plan: fechaVencimientoFinal, // ✅ CAMBIO AQUÍ
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

async function activateSubscription(userId: string, planId: string, notificacionesIncluidas: boolean = false) {
  try {
    console.log('=== ACTIVANDO SUSCRIPCIÓN ===');
    console.log('User ID:', userId);
    console.log('Plan ID:', planId);
    console.log('Notificaciones incluidas:', notificacionesIncluidas);

    // Obtener datos del cliente para renovación aditiva
    const { data: clienteInfo, error: clienteError } = await supabase
      .from('clientes')
      .select('fecha_vencimiento_plan, estado_suscripcion')
      .eq('id_cliente', userId)
      .single();

    console.log('Estado de suscripción:', clienteInfo?.estado_suscripcion);
    console.log('Fecha de vencimiento actual del cliente:', clienteInfo?.fecha_vencimiento_plan);

    // Obtener fecha actual (solo fecha, sin hora)
    const hoyStr = new Date().toISOString().split('T')[0]; // '2025-10-29'

    let fechaVencimientoStr;

    if (clienteInfo?.fecha_vencimiento_plan && clienteInfo?.estado_suscripcion !== 'trial') {
      // Cliente con suscripción pagada previa
      const fechaVencActual = clienteInfo.fecha_vencimiento_plan; // Ya es DATE: '2025-10-30'
      
      // Comparar solo fechas (sin horas)
      if (fechaVencActual < hoyStr) {
        // Ya venció, empezar desde hoy
        console.log('Suscripción pagada ya vencida, iniciando desde hoy');
        fechaVencimientoStr = hoyStr;
      } else {
        // Aún vigente, mantener fecha actual para sumar días
        console.log('Renovación de suscripción pagada, manteniendo días restantes');
        fechaVencimientoStr = fechaVencActual;
      }
    } else {
      // Primera compra o fin de trial, iniciar desde hoy
      console.log('Primera compra o fin de trial, iniciando desde hoy');
      fechaVencimientoStr = hoyStr;
    }

    // Agregar 30 días
    const fechaVencimiento = new Date(fechaVencimientoStr + 'T00:00:00');
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    // Convertir a formato DATE (solo fecha, sin hora)
    const fechaVencimientoFinal = fechaVencimiento.toISOString().split('T')[0]; // '2025-11-28'

    console.log('Nueva fecha de vencimiento calculada:', fechaVencimientoFinal);

    // Actualizar el cliente para activar su suscripción
    const { error } = await supabase
      .from('clientes')
      .update({
        suscripcion_activa: true,
        estado_suscripcion: 'activa',
        fecha_vencimiento_plan: fechaVencimientoFinal,
        activo: 'Activo',
        plan: planId,
        notificaciones_activas: notificacionesIncluidas,
        fecha_cambio_estado: new Date().toISOString()
      })
      .eq('id_cliente', userId);

    if (error) {
      console.error('Error activating subscription:', JSON.stringify(error, null, 2));
    } else {
      console.log('Subscription activated successfully for user:', userId);
      
      // Verificar la activación
      const { data: clienteVerificacion, error: verError } = await supabase
        .from('clientes')
        .select('activo, suscripcion_activa, estado_suscripcion, plan, notificaciones_activas, fecha_vencimiento_plan')
        .eq('id_cliente', userId)
        .single();
      
      if (!verError && clienteVerificacion) {
        console.log('=== VERIFICACIÓN ACTIVACIÓN ===');
        console.log('Estado:', clienteVerificacion.activo);
        console.log('Suscripción activa:', clienteVerificacion.suscripcion_activa);
        console.log('Estado suscripción:', clienteVerificacion.estado_suscripcion);
        console.log('Plan:', clienteVerificacion.plan);
        console.log('Notificaciones activas:', clienteVerificacion.notificaciones_activas);
        console.log('Fecha vencimiento:', clienteVerificacion.fecha_vencimiento_plan);
        console.log('=== FIN VERIFICACIÓN ===');
      }
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