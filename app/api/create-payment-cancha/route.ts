// app/api/create-payment-cancha/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 🔑 Claves Wompi
// PRODUCCIÓN (descomentar cuando estés listo):
// const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!;
// const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY!;
// const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET!;

// PRUEBAS (comentar en producción):
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY_CANCHA!;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY_CANCHA!;
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET_CANCHA!;

interface ReservaData {
  id_cancha: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_cliente: string;
  identificacion_cliente: string;
  telefono_cliente: string;
  email_cliente: string;
  precio_hora: number;
  porcentaje_anticipo: number;
  monto_anticipo: number;
  monto_pendiente: number;
  cliente_id: string;
}

export async function POST(request: NextRequest) {
  try {
    
    
    // 1️⃣ Obtener datos de la reserva
    const reservaData: ReservaData = await request.json();
    
    const {
      id_cancha,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      nombre_cliente,
      identificacion_cliente,
      telefono_cliente,
      email_cliente,
      precio_hora,
      porcentaje_anticipo,
      monto_anticipo,
      monto_pendiente,
      cliente_id
    } = reservaData;

    // 2️⃣ Generar reference única
    const timestamp = Date.now();
    const reference = `cancha_${id_cancha}_${timestamp}`;

    // 3️⃣ Crear registro en reservas_cancha (estado pendiente)
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas_cancha')
      .insert({
        id_cancha,
        id_cliente: cliente_id,
        fecha: fecha_reserva,
        hora: hora_inicio,  // Solo guardamos hora_inicio
        nombre: nombre_cliente,
        identificacion: identificacion_cliente, // ⚠️ REQUERIDO - necesitas agregarlo
        correo: email_cliente,
        telefono: telefono_cliente,
        nota: `Reserva de ${hora_inicio} a ${hora_fin}`,
        estado_pago: 'pendiente'
      })
      .select()
      .single();

    if (reservaError) {
      console.error('❌ Error creando reserva:', reservaError);
      return NextResponse.json(
        { error: 'Error al crear reserva', details: reservaError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Obtener datos del cliente para comisión
    const { data: datosPago, error: datosPagoError } = await supabase
      .from('datos_pago_clientes')
      .select('porcentaje_comision')
      .eq('id_cliente', cliente_id)
      .single();

    const comisionPlataforma = datosPago?.porcentaje_comision || 15;

    // 5️⃣ Crear registro en transacciones_canchas
    const { data: transaccion, error: transaccionError } = await supabase
      .from('transacciones_canchas')
      .insert({
        id_reserva: reserva.id,
        id_cliente: cliente_id,
        id_cancha,
        referencia_wompi: reference,
        precio_hora: precio_hora,
        monto_anticipo,
        monto_pendiente,
        comision_plataforma: comisionPlataforma,
        estado: 'pendiente',
        metodo_pago: 'wompi',
        correo_cliente: email_cliente,
        telefono_cliente: telefono_cliente
      })
      .select()
      .single();

    if (transaccionError) {
      console.error('❌ Error creando transacción:', transaccionError);
      
      // Rollback: eliminar reserva creada
      await supabase
        .from('reservas_cancha')
        .delete()
        .eq('id', reserva.id);

      return NextResponse.json(
        { error: 'Error al crear transacción', details: transaccionError.message },
        { status: 500 }
      );
    }

    // 6️⃣ Crear Payment Link en Wompi
    const wompiData = {
      name: `Reserva Cancha - ${nombre_cliente}`,
      description: `Anticipo reserva ${fecha_reserva} de ${hora_inicio} a ${hora_fin}`,
      single_use: true,
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: Math.round(monto_anticipo * 100), // Convertir a centavos
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/reserva-exitosa?reference=${reference}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      reference: reference,
      customer_data: {
        email: email_cliente,
        full_name: nombre_cliente,
        phone_number: telefono_cliente
      }
    };

    console.log('📤 Creando Payment Link en Wompi:', wompiData);

    const wompiResponse = await fetch('https://sandbox.wompi.co/v1/payment_links', {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wompiData),
    });

    if (!wompiResponse.ok) {
      const errorText = await wompiResponse.text();
      console.error('❌ Error de Wompi:', errorText);
      
      // Rollback: eliminar transacción y reserva
      await supabase.from('transacciones_canchas').delete().eq('id', transaccion.id);
      await supabase.from('reservas_cancha').delete().eq('id', reserva.id);

      return NextResponse.json(
        { error: 'Error al crear link de pago', details: errorText },
        { status: 500 }
      );
    }

    const paymentLink = await wompiResponse.json();
    console.log('✅ Payment Link creado:', paymentLink);

    // 7️⃣ Actualizar transacción con ID de Wompi
    await supabase
      .from('transacciones_canchas')
      .update({
        wompi_transaction_id: paymentLink.data.id,
        payment_link: paymentLink.data.permalink
      })
      .eq('id', transaccion.id);

    // 8️⃣ Devolver link de pago
    return NextResponse.json({
      success: true,
      payment_link: paymentLink.data.permalink,
      reserva_id: reserva.id,
      transaccion_id: transaccion.id,
      reference: reference,
      monto_anticipo: monto_anticipo,
      expires_at: wompiData.expires_at
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json(
      { error: 'Error procesando pago', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 🔍 GET: Consultar estado de una transacción
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference requerida' },
        { status: 400 }
      );
    }

    
    const { data: transaccion, error } = await supabase
      .from('transacciones_canchas')
      .select(`
        *,
        reservas_cancha (*)
      `)
      .eq('referencia_wompi', reference)
      .single();

    if (error || !transaccion) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaccion,
      reserva: transaccion.reservas_cancha
    });

  } catch (error) {
    console.error('❌ Error consultando transacción:', error);
    return NextResponse.json(
      { error: 'Error consultando transacción' },
      { status: 500 }
    );
  }
}