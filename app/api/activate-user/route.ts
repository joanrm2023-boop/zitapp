// app/api/activate-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ACTIVANDO USUARIO ===');
    
    const { email, planId, planNombre, transactionId } = await request.json();
    
    console.log('Datos recibidos:', { email, planId, planNombre, transactionId });

    // Validar que tenemos el email
    if (!email) {
      console.log('ERROR: Email requerido');
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // === Validar con Wompi que el pago fue aprobado ===
    if (!transactionId) {
      console.log('No se proporcionó transactionId en la solicitud, no se puede verificar el pago.');
      return NextResponse.json(
        { error: 'Falta el transactionId, no se puede verificar el estado del pago.' },
        { status: 400 }
      );
    }

    try {
      console.log('Verificando pago en Wompi para transactionId:', transactionId);

      const wompiResponse = await fetch(`https://production.wompi.co/v1/transactions/${transactionId}`);
      const wompiData = await wompiResponse.json();

      const estadoPago = wompiData?.data?.status;
      console.log('Estado real del pago según Wompi:', estadoPago);

      if (estadoPago !== 'APPROVED') {
        console.log(`Pago no aprobado (estado: ${estadoPago}). Cancelando activación.`);
        return NextResponse.json(
          {
            success: false,
            message: `El pago no fue aprobado (estado actual: ${estadoPago}).`,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error al verificar el pago con Wompi:', error);
      return NextResponse.json(
        { success: false, message: 'Error al consultar el estado del pago en Wompi.' },
        { status: 500 }
      );
    }

    // Verificar que el usuario existe
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('correo', email)
      .single();

    if (clienteError || !cliente) {
      console.log('ERROR: Cliente no encontrado:', email);
      console.log('Error detalles:', JSON.stringify(clienteError, null, 2));
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    console.log('Cliente encontrado:', cliente.nombre);
    console.log('Estado actual del cliente:', cliente.activo);
    console.log('Suscripción actual:', cliente.suscripcion_activa);

    // Buscar si pagó por notificaciones en la transacción
    let notificacionesIncluidas = false;
    try {
      const { data: transaccion, error: transError } = await supabase
        .from('transacciones_pendientes')
        .select('notificaciones_incluidas')
        .eq('user_id', cliente.id_cliente)
        .eq('plan_id', planId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!transError && transaccion) {
        notificacionesIncluidas = transaccion.notificaciones_incluidas || false;
        console.log('Notificaciones incluidas en el pago:', notificacionesIncluidas);
      } else {
        console.log('No se encontró transacción o error:', transError);
      }
    } catch (error) {
      console.log('Error buscando transacción (continuando sin notificaciones):', error);
    }

    // Renovación inteligente
    console.log('Estado de suscripción actual:', cliente.estado_suscripcion);
    console.log('Fecha de vencimiento actual del cliente:', cliente.fecha_vencimiento_plan);

    let fechaVencimiento;
    if (cliente.fecha_vencimiento_plan && cliente.estado_suscripcion !== 'trial') {
      fechaVencimiento = new Date(cliente.fecha_vencimiento_plan);
      const hoy = new Date();
      
      if (fechaVencimiento < hoy) {
        console.log('Suscripción pagada ya vencida, iniciando desde hoy');
        fechaVencimiento = new Date();
      } else {
        console.log('Renovación de suscripción pagada, manteniendo días restantes');
      }
    } else {
      console.log('Primera compra o fin de trial, iniciando desde hoy');
      fechaVencimiento = new Date();
    }

    // Agregar 30 días
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const fechaVencimientoISO = fechaVencimiento.toISOString();

    console.log('Nueva fecha de vencimiento calculada:', fechaVencimientoISO);

    // Actualizar cliente
    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        plan: planId || 'basico',
        suscripcion_activa: true,
        fecha_cambio_estado: new Date().toISOString(),
        fecha_vencimiento_plan: fechaVencimientoISO,
        notificaciones_activas: notificacionesIncluidas,
        activo: 'Activo',
        estado_suscripcion: 'activa'
      })
      .eq('correo', email);

    if (updateError) {
      console.error('Error actualizando cliente:', JSON.stringify(updateError, null, 2));
      return NextResponse.json({ error: 'Error actualizando cliente' }, { status: 500 });
    }

    console.log('Cliente actualizado correctamente');

    // Verificar actualización
    const { data: clienteVerificacion, error: verificacionError } = await supabase
      .from('clientes')
      .select('activo, suscripcion_activa, estado_suscripcion, plan, fecha_vencimiento_plan, notificaciones_activas')
      .eq('correo', email)
      .single();

    if (verificacionError) {
      console.error('Error verificando actualización:', verificacionError);
    } else {
      console.log('=== VERIFICACIÓN POST-ACTUALIZACIÓN ===');
      console.log('Estado actual:', clienteVerificacion.activo);
      console.log('Suscripción activa:', clienteVerificacion.suscripcion_activa);
      console.log('Estado suscripción:', clienteVerificacion.estado_suscripcion);
      console.log('Plan:', clienteVerificacion.plan);
      console.log('Fecha vencimiento:', clienteVerificacion.fecha_vencimiento_plan);
      console.log('Notificaciones activas:', clienteVerificacion.notificaciones_activas);
      console.log('=== FIN VERIFICACIÓN ===');
    }

    console.log('Cliente activado exitosamente:', email);
    console.log('Plan asignado:', planId);
    console.log('Notificaciones activas:', notificacionesIncluidas);
    console.log('Fecha de vencimiento:', fechaVencimientoISO);

    // Marcar transacción como completada
    try {
      const { data: transaccionActualizada, error: transError } = await supabase
        .from('transacciones_pendientes')
        .update({
          status: 'APPROVED',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', cliente.id_cliente)
        .eq('plan_id', planId)
        .eq('status', 'pending')
        .select();

      if (transError) {
        console.log('Error actualizando transacción (continuando):', transError);
      } else if (transaccionActualizada && transaccionActualizada.length > 0) {
        console.log('Transacción marcada como APPROVED:', transaccionActualizada.length, 'registros');
      } else {
        console.log('No se encontró transacción pendiente para actualizar');
      }
    } catch (transError) {
      console.log('Error buscando/actualizando transacción (continuando):', transError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Usuario activado correctamente',
      fechaVencimiento: fechaVencimientoISO,
      estadoSuscripcion: 'activa',
      estadoCliente: clienteVerificacion?.activo || 'Activo',
      notificacionesActivas: notificacionesIncluidas,
      planAsignado: planId
    });

  } catch (error) {
    console.error('Error general en activate-user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
