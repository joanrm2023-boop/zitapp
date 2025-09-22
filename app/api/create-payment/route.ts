// app/api/create-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const WOMPI_PUBLIC_KEY = 'pub_test_xHSVWM0rB3WZk5kMKZoKIyo5ZUP51zvT';
const WOMPI_PRIVATE_KEY = 'prv_test_eFdW2YMHDJsFm1SZm9EAPu9qnbXyYuv3';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO API CREATE-PAYMENT ===');
    
    const { planId, precio, nombrePlan, userData, userId, notificaciones } = await request.json();
    
    console.log('Datos recibidos:', { planId, precio, nombrePlan, userData, userId, notificaciones });

    // Validar que tenemos los datos necesarios
    if (!planId || !precio || !nombrePlan || !userData) {
      console.log('ERROR: Faltan datos requeridos');
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    if (!userData.email || !userData.nombre) {
      console.log('ERROR: Faltan datos del usuario (email o nombre)');
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 });
    }

    // CAMBIO PRINCIPAL: userId ahora viene del frontend
    console.log('Usuario ID recibido:', userId || 'No autenticado');
    console.log('Notificaciones seleccionadas:', notificaciones || false);

    // Generar referencia única
    const timestamp = Date.now();
    const reference = userId 
      ? `plan_${planId}_${userId}_${timestamp}`
      : `plan_${planId}_guest_${timestamp}`;

    console.log('Referencia generada:', reference);

    // Crear payment link en Wompi
    const wompiPayload = {
      "acceptance_token": await getAcceptanceToken(),
      "name": "Test Plan",
      "description": "Test payment",
      "single_use": true,
      "collect_shipping": false,
      "amount_in_cents": precio * 100,
      "currency": "COP",
      "customer_email": userData.email,
      "reference": reference,
      "redirect_url": `${process.env.NEXT_PUBLIC_BASE_URL}/success?payment=success`,
    };

    console.log('Payload para Wompi:', wompiPayload);

    // Llamada a la API de Wompi para crear PAYMENT LINK
    console.log('Llamando a Wompi Payment Links...');
    const wompiResponse = await fetch('https://sandbox.wompi.co/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wompiPayload),
    });

    const wompiData = await wompiResponse.json();
    console.log('Respuesta de Wompi:', wompiData);

    if (wompiData.error || !wompiData.data) {
        console.log('ERROR en Wompi:', wompiData);
        return NextResponse.json({ 
          error: 'Error al crear pago en Wompi: ' + (wompiData.error?.reason || wompiData.error || 'Respuesta inválida') 
        }, { status: 500 });
      }

      // Debugging intensivo
      console.log('=== DEBUGGING LINK ===');
      console.log('wompiData tiene data?', !!wompiData.data);
      console.log('data tiene id?', !!wompiData.data?.id);
      console.log('ID directo:', wompiData.data?.id);
      console.log('Tipo de ID:', typeof wompiData.data?.id);

      const linkId = wompiData.data.id;
      console.log('linkId extraído:', linkId);

      const paymentLink = linkId ? `https://checkout.wompi.co/l/${linkId}` : null;
      console.log('Link construido:', paymentLink);
      console.log('=== FIN DEBUGGING ===');

      // Guardar referencia del pago en base de datos
      try {
        console.log('Guardando transacción en BD...');
        console.log('userId que se guardará:', userId);
        
        const transactionData = {
          user_id: userId,
          plan_id: planId,
          wompi_reference: reference,
          amount: precio,
          status: 'pending',
          notificaciones_incluidas: notificaciones || false,
          created_at: new Date().toISOString()
        };

        console.log('Datos de transacción a guardar:', transactionData);

        const { error: dbError } = await supabase
          .from('transacciones_pendientes')
          .insert(transactionData);

        if (dbError) {
          console.log('ERROR guardando en BD (continuando anyway):', dbError);
        } else {
          console.log('Transacción guardada en BD exitosamente con userId:', userId);
          console.log('Notificaciones addon guardado:', notificaciones);
        }
      } catch (dbError) {
        console.log('ERROR en BD (continuando anyway):', dbError);
      }

      console.log('Link final a devolver:', paymentLink);
      console.log('=== FIN API CREATE-PAYMENT (ÉXITO) ===');

      return NextResponse.json({ 
        payment_link: paymentLink,
        reference: reference,
        transaction_id: linkId
      });

  } catch (error) {
    console.error('=== ERROR GENERAL EN API ===');
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Error interno del servidor: ' + (error as Error).message }, { status: 500 });
  }
}

// Función para obtener acceptance token (requerido por Wompi)
async function getAcceptanceToken() {
  try {
    console.log('Obteniendo acceptance token...');
    const response = await fetch('https://sandbox.wompi.co/v1/merchants/' + WOMPI_PUBLIC_KEY, {
      headers: {
        'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`,
      },
    });
    
    const data = await response.json();
    console.log('Acceptance token obtenido:', data.data?.presigned_acceptance?.acceptance_token ? 'Sí' : 'No');
    return data.data.presigned_acceptance.acceptance_token;
  } catch (error) {
    console.error('Error getting acceptance token:', error);
    return null;
  }
}