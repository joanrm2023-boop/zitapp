// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, reserva, cliente } = body;

    // Validar datos requeridos
    if (!tipo || !reserva || !cliente) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // 🆕 NUEVO: Verificar si el cliente tiene notificaciones activas
    try {
      console.log('🔍 Verificando notificaciones activas para cliente:', cliente.id_cliente || 'ID no disponible');
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('notificaciones_activas, nombre')
        .eq('id_cliente', cliente.id_cliente)
        .single();

      if (clienteError) {
        console.error('Error consultando cliente:', clienteError);
        return NextResponse.json(
          { error: 'Error verificando permisos de notificaciones' },
          { status: 500 }
        );
      }

      if (!clienteData?.notificaciones_activas) {
        console.log('❌ Cliente no tiene notificaciones activas:', clienteData?.nombre);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Notificaciones no activas para este cliente',
            notificacionesActivas: false
          },
          { status: 200 }
        );
      }

      console.log('✅ Cliente tiene notificaciones activas:', clienteData.nombre);
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
      return NextResponse.json(
        { error: 'Error verificando permisos de notificaciones' },
        { status: 500 }
      );
    }

    let subject = '';
    let htmlContent = '';

    if (tipo === 'confirmacion') {
      subject = `✅ Confirmación de cita - ${cliente.nombre}`;
      htmlContent = generarEmailConfirmacion(reserva, cliente);
    } else if (tipo === 'recordatorio') {
      subject = `⏰ Recordatorio de cita mañana - ${cliente.nombre}`;
      htmlContent = generarEmailRecordatorio(reserva, cliente);
    } else {
      return NextResponse.json(
        { error: 'Tipo de email no válido' },
        { status: 400 }
      );
    }

    console.log('📧 Enviando email de', tipo, 'para', reserva.correo);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
      to: [reserva.correo],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return NextResponse.json(
        { error: 'Error enviando email' },
        { status: 500 }
      );
    }

    console.log('✅ Email enviado exitosamente:', data?.id);

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: 'Email enviado exitosamente',
      notificacionesActivas: true
    });

  } catch (error) {
    console.error('Error en API send-email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Template para email de confirmación
function generarEmailConfirmacion(reserva: any, cliente: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f7f9fc; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .success-icon { width: 60px; height: 60px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
          .success-icon::after { content: "✅"; }
          .info-card { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; margin-bottom: 0; }
          .info-label { font-weight: 600; color: #374151; }
          .info-value { color: #1f2937; font-weight: 500; }
          .highlight { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .btn:hover { background: #2563eb; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 8px; }
            .header { padding: 20px 15px; }
            .content { padding: 20px 15px; }
            .info-row { flex-direction: column; }
            .info-label { margin-bottom: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Cita Confirmada!</h1>
            <p>Tu reserva ha sido agendada exitosamente</p>
          </div>
          
          <div class="content">
            <div class="success-icon"></div>
            
            <h2 style="text-align: center; margin-bottom: 20px; color: #1f2937;">
              Hola ${reserva.nombre}
            </h2>
            
            <p style="text-align: center; margin-bottom: 30px; color: #6b7280; font-size: 16px;">
              Tu cita en <strong style="font-size: 18px; color: #1f2937;">${cliente.nombre}</strong> ha sido confirmada. Aquí están los detalles:
            </p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📅 Fecha:</span>
                <span class="info-value highlight">${new Date(reserva.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏰ Hora:</span>
                <span class="info-value highlight">${reserva.hora}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Profesional:</span>
                <span class="info-value">${reserva.barbero_nombre || 'Por asignar'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🏪 Establecimiento:</span>
                <span class="info-value">${cliente.nombre}</span>
              </div>
              ${reserva.nota ? `
              <div class="info-row">
                <span class="info-label">📝 Nota:</span>
                <span class="info-value">${reserva.nota}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-bottom: 10px;">📋 Importante:</h3>
              <ul style="color: #92400e; margin-left: 20px;">
                <li>Te recomendamos llegar 5 minutos antes de tu hora programada</li>
                <li>Si necesitas cancelar o reprogramar, contacta directamente al establecimiento</li>
              </ul>
            </div>
            
            ${cliente.direccion ? `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-bottom: 10px;">📍 Ubicación:</h3>
              <p style="color: #0369a1;">${cliente.direccion}</p>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente por Zitapp</p>
            <p style="margin-top: 10px;">
              © ${new Date().getFullYear()} Zitapp - Sistema de Reservas Inteligentes
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template para email de recordatorio
function generarEmailRecordatorio(reserva: any, cliente: any) {
  const fechaCita = new Date(reserva.fecha);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Cita</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f7f9fc; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .reminder-icon { width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
          .reminder-icon::after { content: "⏰"; font-size: 30px; }
          .info-card { background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #fbbf24; }
          .info-row:last-child { border-bottom: none; margin-bottom: 0; }
          .info-label { font-weight: 600; color: #92400e; }
          .info-value { color: #92400e; font-weight: 500; }
          .highlight { background: #fbbf24; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 8px; }
            .header { padding: 20px 15px; }
            .content { padding: 20px 15px; }
            .info-row { flex-direction: column; }
            .info-label { margin-bottom: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Recordatorio de Cita</h1>
            <p>Tu cita es mañana</p>
          </div>
          
          <div class="content">
            <div class="reminder-icon"></div>
            
            <h2 style="text-align: center; margin-bottom: 20px; color: #1f2937;">
              Hola ${reserva.nombre}
            </h2>
            
            <p style="text-align: center; margin-bottom: 30px; color: #6b7280; font-size: 16px;">
              Te recordamos que tienes una cita programada para <strong>mañana</strong> en <strong>${cliente.nombre}</strong>
            </p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">📅 Fecha:</span>
                <span class="info-value highlight">MAÑANA - ${fechaCita.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏰ Hora:</span>
                <span class="info-value highlight">${reserva.hora}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Profesional:</span>
                <span class="info-value">${reserva.barbero_nombre || 'Por asignar'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🏪 Establecimiento:</span>
                <span class="info-value">${cliente.nombre}</span>
              </div>
            </div>
            
            <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">💡 Recordatorios importantes:</h3>
              <ul style="color: #1e40af; margin-left: 20px;">
                <li>Llega 5 minutos antes de tu hora programada</li>
                <li>Trae tu documento de identidad</li>
                <li>Si necesitas cancelar, hazlo con anticipación</li>
              </ul>
            </div>
            
            ${cliente.direccion ? `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-bottom: 10px;">📍 Ubicación:</h3>
              <p style="color: #0369a1;">${cliente.direccion}</p>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Este email fue enviado automáticamente por Zitapp</p>
            <p style="margin-top: 10px;">
              © ${new Date().getFullYear()} Zitapp - Sistema de Reservas Inteligentes
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}