// app/api/activate-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ACTIVANDO USUARIO ===');
    
    const { email, planId, planNombre } = await request.json();
    
    console.log('Datos recibidos:', { email, planId, planNombre });

    // Validar que tenemos el email
    if (!email) {
      console.log('ERROR: Email requerido');
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('correo', email)
      .single();

    if (clienteError || !cliente) {
      console.log('ERROR: Cliente no encontrado:', email);
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    console.log('Cliente encontrado:', cliente.nombre);

    // 🆕 NUEVO: Buscar si pagó por notificaciones en la transacción
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

    // Calcular fecha de vencimiento (30 días desde hoy)
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const fechaVencimientoISO = fechaVencimiento.toISOString();

    // Activar el usuario - incluyendo notificaciones si las pagó
    const updateData = { 
      activo: 'Activo',
      plan: planId || 'basico',
      suscripcion_activa: true,
      estado_suscripcion: 'activa',
      fecha_cambio_estado: new Date().toISOString(),
      fecha_vencimiento_plan: fechaVencimientoISO,
      notificaciones_activas: notificacionesIncluidas // 🆕 NUEVO CAMPO
    };

    console.log('Datos a actualizar:', updateData);

    const { error: updateError } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('correo', email);

    if (updateError) {
      console.error('Error activando cliente:', updateError);
      return NextResponse.json({ error: 'Error activando cliente' }, { status: 500 });
    }

    console.log('Cliente activado exitosamente:', email);
    console.log('Plan asignado:', planId);
    console.log('Estado suscripción cambiado a: activa');
    console.log('Notificaciones activas:', notificacionesIncluidas);
    console.log('Fecha de vencimiento:', fechaVencimientoISO);

    // Marcar transacción como completada si existe
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
      notificacionesActivas: notificacionesIncluidas // 🆕 NUEVO EN RESPUESTA
    });

  } catch (error) {
    console.error('Error en activate-user:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}