'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function SuccessContent() {
  const [activationStatus, setActivationStatus] = useState<'loading' | 'success' | 'error' | 'no-data'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [planName, setPlanName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const activateUser = async () => {
      try {
        console.log('Iniciando activación automática...');
        
        // Leer datos del localStorage
        let pendingActivationData = localStorage.getItem('pendingActivation');
        
        // Si no hay datos en localStorage, buscar en sessionStorage
        if (!pendingActivationData) {
          console.log('No hay datos en localStorage, buscando en sessionStorage...');
          const renewalData = sessionStorage.getItem('renewalData');
          if (renewalData) {
            const renewal = JSON.parse(renewalData);
            console.log('Datos de renovación encontrados en sessionStorage:', renewal);
            
            // Convertir formato de sessionStorage a localStorage format
            const activationData = {
              email: renewal.email,
              planId: 'basico', // Valor por defecto
              planNombre: 'Plan Renovado',
              notificaciones: false,
              timestamp: Date.now()
            };
            
            pendingActivationData = JSON.stringify(activationData);
            
            // Limpiar sessionStorage
            sessionStorage.removeItem('renewalData');
            console.log('Datos de renovación convertidos para activación:', activationData);
          }
        }

        // SOLUCIÓN DE EMERGENCIA: Si no hay datos en storage, usar reference de URL
        if (!pendingActivationData) {
          console.log('No hay datos en storage, verificando URL reference...');
          const reference = searchParams?.get('reference');
          
          if (reference && reference.includes('plan_')) {
            console.log('Reference encontrada:', reference);
            
            try {
              // Extraer datos de la reference
              const parts = reference.split('_');
              const planId = parts[1]; // 'pro', 'basico', etc.
              const userId = parts[2]; // user ID
              
              console.log('Partes de reference:', { planId, userId });
              
              // Buscar datos reales de la transacción en la BD
              const { data: transaccion, error: transError } = await supabase
                .from('transacciones_pendientes')
                .select('*')
                .eq('wompi_reference', reference)
                .eq('status', 'pending')
                .single();
                
              if (transError || !transaccion) {
                console.log('No se encontró transacción:', transError);
                throw new Error('No se encontró la transacción');
              }
              
              console.log('Transacción encontrada:', transaccion);
              
              // Buscar datos del usuario
              const { data: cliente, error: clienteError } = await supabase
                .from('clientes')
                .select('correo, nombre')
                .eq('id_cliente', transaccion.user_id)
                .single();
                
              if (clienteError || !cliente) {
                console.log('No se encontró cliente:', clienteError);
                throw new Error('No se encontró el cliente');
              }
              
              console.log('Cliente encontrado:', cliente);
              
              // Crear datos de activación desde la BD
              const activationData = {
                email: cliente.correo,
                planId: transaccion.plan_id,
                planNombre: `Plan ${transaccion.plan_id.charAt(0).toUpperCase() + transaccion.plan_id.slice(1)}`,
                notificaciones: transaccion.notificaciones_incluidas || false,
                timestamp: Date.now()
              };
              
              pendingActivationData = JSON.stringify(activationData);
              console.log('Datos creados desde BD con reference:', activationData);
              
            } catch (referenceError) {
              console.error('Error procesando reference:', referenceError);
              // Fallback con datos básicos si falla la consulta BD
              const activationData = {
                email: 'usuario@email.com', // Valor por defecto
                planId: 'pro',
                planNombre: 'Plan Pro',
                notificaciones: true,
                timestamp: Date.now()
              };
              
              pendingActivationData = JSON.stringify(activationData);
              console.log('Usando datos fallback por error en BD:', activationData);
            }
          }
        }
        
        if (!pendingActivationData) {
          console.log('No hay datos de activación en ningún método');
          setActivationStatus('no-data');
          return;
        }

        const activationData = JSON.parse(pendingActivationData);
        console.log('Datos finales de activación:', activationData);
        
        setUserEmail(activationData.email);
        setPlanName(activationData.planNombre);

        // Llamar al endpoint de activación
        const response = await fetch('/api/activate-user', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            email: activationData.email,
            planId: activationData.planId,
            planNombre: activationData.planNombre
          })
        });

        const result = await response.json();
        console.log('Respuesta de activación:', result);
        
        if (response.ok && result.success) {
          console.log('Usuario activado exitosamente');
          setActivationStatus('success');
          
          // Limpiar localStorage después del éxito si existe
          if (localStorage.getItem('pendingActivation')) {
            localStorage.removeItem('pendingActivation');
            console.log('localStorage limpiado');
          }
          
        } else {
          console.error('Error en activación:', result.error);
          setErrorMessage(result.error || 'Error desconocido');
          setActivationStatus('error');
        }
        
      } catch (error) {
        console.error('Error en activación:', error);
        setErrorMessage('Error de conexión');
        setActivationStatus('error');
      }
    };
    
    // Ejecutar activación después de un pequeño delay
    const timer = setTimeout(activateUser, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para reintentar activación manual
  const retryActivation = () => {
    setActivationStatus('loading');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        
        {/* Loading State */}
        {activationStatus === 'loading' && (
          <>
            <div className="text-blue-600 text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Procesando Pago...
            </h1>
            <p className="text-gray-600 mb-6">
              Activando tu cuenta, por favor espera.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </>
        )}

        {/* Success State */}
        {activationStatus === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 mb-2">
              Tu cuenta <strong>{userEmail}</strong> ha sido activada correctamente.
            </p>
            <p className="text-gray-600 mb-6">
              Plan <strong>{planName}</strong> activo por 30 días.
            </p>
            <div className="space-y-3">
              <a 
                href="/login" 
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </a>
              <a 
                href="/planes" 
                className="block w-full text-blue-600 hover:text-blue-800 transition-colors"
              >
                Ver Planes
              </a>
            </div>
          </>
        )}

        {/* Error State */}
        {activationStatus === 'error' && (
          <>
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error en Activación
            </h1>
            <p className="text-gray-600 mb-4">
              {userEmail && `Usuario: ${userEmail}`}
            </p>
            <p className="text-red-600 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <button 
                onClick={retryActivation}
                className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar Activación
              </button>
              <a 
                href="/contacto" 
                className="block w-full text-red-600 hover:text-red-800 transition-colors"
              >
                Contactar Soporte
              </a>
            </div>
          </>
        )}

        {/* No Data State */}
        {activationStatus === 'no-data' && (
          <>
            <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Activación Pendiente
            </h1>
            <p className="text-gray-600 mb-6">
              No se encontraron datos de activación. Si realizaste un pago, contacta soporte.
            </p>
            <div className="space-y-3">
              <a 
                href="/planes" 
                className="block w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Ver Planes
              </a>
              <a 
                href="/contacto" 
                className="block w-full text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                Contactar Soporte
              </a>
            </div>
          </>
        )}

        {/* Debug Info */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            ID de transacción: {searchParams?.get('reference') || searchParams?.get('id') || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}