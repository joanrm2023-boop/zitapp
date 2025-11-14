// app/reserva-exitosa/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ReservaExitosaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservaData, setReservaData] = useState<any>(null);

  useEffect(() => {
    if (!reference) {
      setError('No se encontró referencia de pago');
      setLoading(false);
      return;
    }

    // 📥 Consultar estado de la transacción
    const fetchReserva = async () => {
      try {
        const response = await fetch(`/api/create-payment-cancha?reference=${reference}`);
        
        if (!response.ok) {
          throw new Error('No se pudo obtener información de la reserva');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error('Reserva no encontrada');
        }

        console.log('✅ Datos recibidos:', data);
        setReservaData(data);
        setLoading(false);

      } catch (err) {
        console.error('❌ Error cargando reserva:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    // Esperar 2 segundos para que el webhook procese
    setTimeout(() => {
      fetchReserva();
    }, 2000);

  }, [reference]);

  // 🔄 Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verificando pago...
          </h2>
          <p className="text-gray-600">
            Estamos confirmando tu reserva. Por favor espera un momento.
          </p>
        </div>
      </div>
    );
  }

  // ❌ Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al confirmar reserva
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Reserva exitosa
  const { reserva, transaccion } = reservaData;
  const estadoAprobado = transaccion?.estado === 'aprobado';
  
  // Calcular porcentaje de anticipo
  const porcentajeAnticipo = transaccion?.comision_plataforma || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header con ícono de éxito */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {estadoAprobado ? '¡Reserva Confirmada!' : 'Reserva en Proceso'}
          </h1>
          <p className="text-gray-600">
            {estadoAprobado 
              ? 'Tu pago ha sido procesado correctamente'
              : 'Tu reserva está siendo procesada'
            }
          </p>
        </div>

        {/* Detalles de la reserva */}
        <div className="border-t border-b border-gray-200 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cliente</p>
              <p className="font-semibold text-gray-800">{reserva?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Identificación</p>
              <p className="font-semibold text-gray-800">{reserva?.identificacion || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <p className="font-semibold text-gray-800">{transaccion?.telefono_cliente || reserva?.telefono || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Correo</p>
              <p className="font-semibold text-gray-800 text-sm">{transaccion?.correo_cliente || reserva?.correo || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha</p>
              <p className="font-semibold text-gray-800">
                {reserva?.fecha ? new Date(reserva.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Hora</p>
              <p className="font-semibold text-gray-800">{reserva?.hora || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Estado de Pago</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              estadoAprobado
                ? 'bg-green-100 text-green-800'
                : transaccion?.estado === 'pendiente'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {estadoAprobado ? '✓ Confirmada y Pagada' : transaccion?.estado === 'pendiente' ? '⏳ Pendiente' : '📋 Procesando'}
            </span>
          </div>

          {reserva?.nota && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Nota</p>
              <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{reserva.nota}</p>
            </div>
          )}
        </div>

        {/* Resumen de pago */}
        {transaccion && (
          <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3">💰 Resumen de Pago</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Precio por hora:</span>
                <span className="font-semibold text-gray-900">
                  ${parseFloat(transaccion.precio_hora).toLocaleString('es-CO')} COP
                </span>
              </div>
              
              <div className="flex justify-between text-green-700">
                <span>Anticipo pagado ({porcentajeAnticipo}%):</span>
                <span className="font-semibold">
                  ${parseFloat(transaccion.monto_anticipo).toLocaleString('es-CO')} COP
                </span>
              </div>
              
              <div className="flex justify-between border-t border-green-300 pt-2">
                <span className="text-gray-700 font-medium">Pendiente en sitio:</span>
                <span className="font-bold text-gray-900">
                  ${parseFloat(transaccion.monto_pendiente).toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <div className="mt-4 bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-600">
                <strong>📌 Recordatorio:</strong> Debes pagar{' '}
                <strong>${parseFloat(transaccion.monto_pendiente).toLocaleString('es-CO')} COP</strong>{' '}
                directamente en el sitio al momento de usar la cancha.
              </p>
            </div>
          </div>
        )}

        {/* Información de referencia */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Referencia de pago:</p>
          <p className="font-mono text-sm text-gray-700 break-all">{reference}</p>
          
          {transaccion?.wompi_transaction_id && (
            <>
              <p className="text-xs text-gray-500 mb-1 mt-2">ID Transacción Wompi:</p>
              <p className="font-mono text-xs text-gray-600 break-all">{transaccion.wompi_transaction_id}</p>
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            🖨️ Imprimir
          </button>
        </div>

        {/* Mensaje de confirmación */}
        {transaccion?.correo_cliente && (
          <p className="text-xs text-center text-gray-500 mt-6">
            Se ha enviado la confirmación a <strong>{transaccion.correo_cliente}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReservaExitosa() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    }>
      <ReservaExitosaContent />
    </Suspense>
  );
}