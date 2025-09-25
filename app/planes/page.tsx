'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Users, Crown, Zap, ArrowLeft, X, User, Mail, Phone, Bell, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import React from "react";

// Definimos los planes base
const planes = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: 28000,
    profesionales: '1 profesional',
    maxProfesionales: 1,
    descripcion: 'Perfecto para emprendedores y profesionales independientes',
    populares: false,
    icono: 'Users',
    caracteristicas: [
      'Dashboard completo con métricas',
      'Gestión de servicios (agregar/eliminar)',
      'Sistema de reservas inteligente',
      'Historial de ventas completo',
      'Enlaces de reserva personalizados',
      'Configuración de horarios flexible',
      'Soporte por email'
    ],
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: 49000,
    profesionales: '2-4 profesionales',
    maxProfesionales: 4,
    descripcion: 'Ideal para equipos pequeños y clínicas',
    populares: true,
    ahorro: 'Ahorra hasta 56%',
    icono: 'Star',
    caracteristicas: [
      'Todo lo del plan Básico',
      'Gestión de múltiples profesionales',
      'Asignación automática de citas',
      'Reportes de ventas por profesional',
      'Control de horarios individuales',
      'Dashboard multi-usuario',
      'Estadísticas avanzadas por equipo',
      'Soporte prioritario'
    ],
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    id: 'premium',
    nombre: 'Premium',
    precio: 69000,
    profesionales: '5-10 profesionales',
    maxProfesionales: 10,
    descripción: 'Para empresas grandes y centros médicos',
    populares: false,
    ahorro: 'Ahorra hasta 75%',
    icono: 'Crown',
    caracteristicas: [
      'Todo lo del plan Pro',
      'Gestión empresarial completa',
      'Roles y permisos avanzados',
      'Reportes ejecutivos detallados',
      'Análisis de rendimiento por profesional',
      'API para integraciones personalizadas',
      'Backup automático diario',
      'Soporte dedicado 24/7'
    ],
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200'
  }
];

// Addon de notificaciones - ahora es dinámico según el plan
const getAddonNotificaciones = (planId: string) => {
  const precios: Record<string, number> = {
    'basico': 8000,
    'pro': 12000,
    'premium': 18000
  };

  return {
    nombre: 'Notificaciones Automáticas',
    precio: precios[planId] || 8000,
    descripcion: 'Emails profesionales automáticos para mejorar la experiencia de tus clientes',
    caracteristicas: [
      'Email de confirmación automático al agendar',
      'Templates profesionales personalizados',
      'Entrega instantánea y confiable',
      'Reducción de no-shows',
      'Mejora la imagen profesional'
    ]
  };
};

// Mapeo de iconos
const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
};

interface DatosUsuario {
  email: string;
  nombre: string;
  telefono?: string;
}

export default function PlanesPage() {
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null);
  const [notificacionesSeleccionadas, setNotificacionesSeleccionadas] = useState<Record<string, boolean>>({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [planElegido, setPlanElegido] = useState<any>(null);
  const [datosUsuario, setDatosUsuario] = useState<DatosUsuario>({
    email: '',
    nombre: '',
    telefono: ''
  });
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [estadoUsuario, setEstadoUsuario] = useState<string | null>(null);
  const [datosRenovacion, setDatosRenovacion] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nuevo useEffect para detectar estado del usuario
  useEffect(() => {
    const detectarEstadoUsuario = async () => {
      try {
        // 1. Verificar datos de renovación en localStorage (desde dashboard)
        const renovacionData = localStorage.getItem('renovacionData');
        if (renovacionData) {
          const datos = JSON.parse(renovacionData);
          console.log('Datos de renovación encontrados:', datos);
          setDatosRenovacion(datos);
          setEstadoUsuario('vencido');
          localStorage.removeItem('renovacionData');
          return;
        }

        // 2. Verificar si hay usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setEstadoUsuario('nuevo');
          return;
        }

        // 3. Obtener información completa del cliente autenticado
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('nombre, correo, activo, suscripcion_activa, fecha_vencimiento_plan, estado_suscripcion')
          .eq('user_id', user.id)
          .single();

        if (error || !cliente) {
          console.log('Cliente no encontrado:', error);
          setEstadoUsuario('nuevo');
          return;
        }

        console.log('Estado del cliente encontrado:', cliente);

        // 4. Evaluar estado basado en datos del cliente
        const hoy = new Date();
        const fechaVencimiento = new Date(cliente.fecha_vencimiento_plan);
        const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        if (cliente.activo === 'Activo' && cliente.suscripcion_activa && diasRestantes > 5) {
          setEstadoUsuario('activo');
        } else if (diasRestantes <= 5 && diasRestantes > 0) {
          setEstadoUsuario('proximo');
          setDatosRenovacion({
            email: cliente.correo,
            nombre: cliente.nombre,
            esRenovacion: true
          });
        } else {
          setEstadoUsuario('vencido');
          setDatosRenovacion({
            email: cliente.correo,
            nombre: cliente.nombre,
            esRenovacion: true
          });
        }

      } catch (error) {
        console.error('Error detectando estado del usuario:', error);
        setEstadoUsuario('nuevo');
      }
    };

    if (mounted) {
      detectarEstadoUsuario();
    }
  }, [mounted]);

  // Función para obtener el banner apropiado según el estado
  const obtenerBannerEstado = () => {
    switch (estadoUsuario) {
      case 'vencido':
        return {
          color: 'bg-red-500',
          icono: '⚠️',
          titulo: 'Suscripción Vencida',
          mensaje: 'Tu suscripción ha expirado. Renueva ahora para seguir usando Zitapp.',
          mostrar: true
        };
      case 'proximo':
        return {
          color: 'bg-yellow-500',
          icono: '⏰',
          titulo: 'Renovación Próxima',
          mensaje: 'Tu suscripción vence pronto. Renueva ahora sin interrupciones.',
          mostrar: true
        };
      case 'activo':
        return {
          color: 'bg-green-500',
          icono: '✅',
          titulo: 'Suscripción Activa',
          mensaje: 'Tu suscripción está activa. ¿Quieres cambiar de plan?',
          mostrar: true
        };
      default:
        return { mostrar: false };
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const calcularPrecioPorProfesional = (precio: number, maxProfesionales: number) => {
    const precioPorProfesional = precio / maxProfesionales;
    return formatearPrecio(precioPorProfesional);
  };

  const calcularPrecioTotal = (planId: string) => {
    const plan = planes.find(p => p.id === planId);
    if (!plan) return 0;
    
    const precioBase = plan.precio;
    const addonNotificaciones = getAddonNotificaciones(planId);
    const precioNotificaciones = notificacionesSeleccionadas[planId] ? addonNotificaciones.precio : 0;
    return precioBase + precioNotificaciones;
  };

  const toggleNotificaciones = (planId: string) => {
    setNotificacionesSeleccionadas(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const handleSeleccionarPlan = async (planId: string) => {
    console.log('Plan seleccionado:', planId);
    console.log('Estado usuario:', estadoUsuario);
    console.log('Datos renovación:', datosRenovacion);
    
    // Validar términos y condiciones
    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    
    const plan = planes.find(p => p.id === planId);
    if (!plan) return;

    const planConNotificaciones = {
      ...plan,
      notificaciones: notificacionesSeleccionadas[planId] || false,
      precioTotal: calcularPrecioTotal(planId)
    };

    setPlanElegido(planConNotificaciones);
    
    // Verificar si hay usuario autenticado
    const { data } = await supabase.auth.getSession();
    
    if (data.session && datosRenovacion) {
      
      console.log('=== DATOS QUE SE PASARÁN A PROCESAR PAGO ===');
      console.log('datosRenovacion completo:', datosRenovacion);
      console.log('Email que se usará:', datosRenovacion.email);
      console.log('Nombre que se usará:', datosRenovacion.nombre);
      console.log('¿Email está vacío?', !datosRenovacion.email);
      console.log('¿Nombre está vacío?', !datosRenovacion.nombre);
      
      await procesarPago(planId, planConNotificaciones, {
        email: datosRenovacion.email,
        nombre: datosRenovacion.nombre,
        telefono: ''
      });
      
    } else if (data.session) {
      // Usuario logueado sin datos de renovación - obtener de BD
      try {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();

        if (cliente) {
          await procesarPago(planId, planConNotificaciones, {
            email: cliente.correo,
            nombre: cliente.nombre,
            telefono: cliente.telefono || ''
          });
        }
      } catch (error) {
        console.error('Error obteniendo datos del cliente:', error);
        setMostrarModal(true);
      }
    } else {
      // Usuario no autenticado - mostrar modal
      setMostrarModal(true);
    }
  };

  const procesarPago = async (planId: string, plan: any, userData: DatosUsuario) => {
    setProcesandoPago(true);
    setPlanSeleccionado(planId);

    try {
      console.log('Procesando pago con datos:', userData);
      console.log('Plan con notificaciones:', plan);

      // Guardar datos del usuario en localStorage para la activación posterior
      localStorage.setItem('pendingActivation', JSON.stringify({
        email: userData.email,
        nombre: userData.nombre,
        planId: planId,
        planNombre: plan.nombre,
        notificaciones: plan.notificaciones,
        timestamp: Date.now()
      }));
      console.log('Datos guardados en localStorage para activación');

      // Obtener userId
      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch (error) {
        console.log('Error obteniendo usuario');
      }

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          precio: plan.precioTotal,
          nombrePlan: plan.nombre + (plan.notificaciones ? ' + Notificaciones' : ''),
          userData: userData,
          userId: userId,
          notificaciones: plan.notificaciones
        }),
      });

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data completa:', data);
      console.log('Payment link recibido:', data.payment_link);

      if (response.ok && data.payment_link) {
        console.log('Redirigiendo a Wompi:', data.payment_link);
        window.location.href = data.payment_link;
      } else {
        console.error('Error response:', data);
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : JSON.stringify(data.error) || 'Error al procesar el pago';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago: ' + (error as Error).message);
      localStorage.removeItem('pendingActivation');
    } finally {
      setProcesandoPago(false);
      setPlanSeleccionado(null);
      setMostrarModal(false);
    }
  };

  const handleSubmitDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!datosUsuario.email || !datosUsuario.nombre) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    await procesarPago(planElegido.id, planElegido, datosUsuario);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          Volver
        </motion.button>

        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={16} />
            15 días de prueba gratuita
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Elige el plan perfecto para tu
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> negocio</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escala tu negocio con Zitapp. Desde profesionales independientes hasta equipos grandes,
            tenemos el plan ideal para ti.
          </p>
        </motion.div>

        {/* Banner de estado del usuario */}
        {estadoUsuario && obtenerBannerEstado().mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${obtenerBannerEstado().color} text-white p-4 rounded-xl mb-8 text-center shadow-lg`}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{obtenerBannerEstado().icono}</span>
              <div>
                <h3 className="font-bold text-lg">{obtenerBannerEstado().titulo}</h3>
                <p className="text-white/90">{obtenerBannerEstado().mensaje}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planes.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-visible border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.populares
                  ? 'border-purple-300 ring-4 ring-purple-100'
                  : plan.borderColor
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Badge Popular */}
              {plan.populares && (
                <motion.div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Más Popular
                  </div>
                </motion.div>
              )}

              {/* Header del plan */}
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/90">
                    {iconMap[plan.icono]}
                  </div>
                  {plan.ahorro && (
                    <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                      {plan.ahorro}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.nombre}</h3>
                <p className="text-white/90 text-sm mb-4">{plan.descripcion}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatearPrecio(calcularPrecioTotal(plan.id))}</span>
                  <span className="text-white/80">/mes</span>
                </div>

                <div className="text-white/90 text-sm mt-1">
                  {plan.profesionales}
                </div>

                {plan.maxProfesionales > 1 && (
                  <div className="text-white/80 text-xs mt-2">
                    Desde {calcularPrecioPorProfesional(calcularPrecioTotal(plan.id), plan.maxProfesionales)} por profesional
                  </div>
                )}
              </div>

              {/* Contenido del plan */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.caracteristicas.map((caracteristica, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mt-0.5`}>
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">{caracteristica}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Addon de Notificaciones */}
                <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {notificacionesSeleccionadas[plan.id] ? (
                        <Bell className="w-5 h-5 text-blue-500" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900">Notificaciones Automáticas</span>
                    </div>
                    <button
                      onClick={() => toggleNotificaciones(plan.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notificacionesSeleccionadas[plan.id] ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificacionesSeleccionadas[plan.id] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Emails profesionales automáticos</span>
                    <span className="font-bold text-blue-600">+{formatearPrecio(getAddonNotificaciones(plan.id).precio)}/mes</span>
                  </div>
                  
                  <div className="space-y-2">
                    <ul className="text-xs text-gray-600 space-y-1">
                      {getAddonNotificaciones(plan.id).caracteristicas.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check size={12} className={notificacionesSeleccionadas[plan.id] ? "text-blue-500" : "text-gray-400"} />
                          <span className={notificacionesSeleccionadas[plan.id] ? "text-gray-700" : "text-gray-500"}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {!notificacionesSeleccionadas[plan.id] && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">
                          💡 Activa para enviar confirmaciones automáticas a tus clientes
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Términos y Condiciones */}
                {mounted && (
                  <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id={`terminos-${plan.id}`}
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                      required
                    />
                    <label htmlFor={`terminos-${plan.id}`} className="text-xs text-gray-700 leading-relaxed cursor-pointer">
                      Acepto los{' '}
                      <Link 
                        href="/terminos" 
                        className="text-purple-600 hover:text-purple-800 font-semibold underline hover:no-underline transition-all duration-200"
                        target="_blank"
                      >
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link 
                        href="/politica-privacidad" 
                        className="text-purple-600 hover:text-purple-800 font-semibold underline hover:no-underline transition-all duration-200"
                        target="_blank"
                      >
                        política de privacidad
                      </Link>
                    </label>
                  </div>
                )}

                <motion.button
                    onClick={() => handleSeleccionarPlan(plan.id)}
                    disabled={procesandoPago || !aceptaTerminos}
                    title={!aceptaTerminos ? "Debes aceptar los términos y condiciones para continuar" : ""}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.populares
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={{ scale: procesandoPago ? 1 : 1.02 }}
                    whileTap={{ scale: procesandoPago ? 1 : 0.98 }}
                    aria-label={`Seleccionar plan ${plan.nombre}`}
                  >
                    {planSeleccionado === plan.id ? 'Procesando...' : 'Elegir Plan'}
                  </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal para capturar datos del usuario */}
        {mostrarModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Finalizar Suscripción
                </h3>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {planElegido && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-purple-600">
                      {iconMap[planElegido.icono]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{planElegido.nombre}</h4>
                      <p className="text-gray-600 text-sm">{planElegido.profesionales}</p>
                      {planElegido.notificaciones && (
                        <div className="flex items-center gap-1 mt-1">
                          <Bell className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-blue-600">+ Notificaciones</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-purple-600">
                      {formatearPrecio(planElegido.precioTotal)}
                    </span>
                    <span className="text-gray-600">/mes</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitDatos} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={datosUsuario.email}
                    onChange={(e) => setDatosUsuario({...datosUsuario, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User size={16} />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={datosUsuario.nombre}
                    onChange={(e) => setDatosUsuario({...datosUsuario, nombre: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={datosUsuario.telefono}
                    onChange={(e) => setDatosUsuario({...datosUsuario, telefono: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                {/* Términos y Condiciones */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="terminos-planes"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                    required
                  />
                  <label htmlFor="terminos-planes" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    Al proceder con el pago, acepto los{' '}
                    <Link 
                      href="/terminos" 
                      className="text-purple-600 hover:text-purple-800 font-semibold underline hover:no-underline transition-all duration-200"
                      target="_blank"
                    >
                      términos y condiciones
                    </Link>{' '}
                    y la{' '}
                    <Link 
                      href="/politica-privacidad" 
                      className="text-purple-600 hover:text-purple-800 font-semibold underline hover:no-underline transition-all duration-200"
                      target="_blank"
                    >
                      política de privacidad
                    </Link>{' '}
                    de Zitapp.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={procesandoPago || !aceptaTerminos}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesandoPago ? 'Procesando...' : 'Continuar al Pago'}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al continuar, serás redirigido a nuestra pasarela de pagos segura
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* FAQ básico */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Tienes preguntas?</h3>
          <p className="text-gray-600 mb-6">
            Nuestro equipo está aquí para ayudarte a elegir el plan perfecto
          </p>
          <button 
            onClick={() => window.open('https://wa.me/573152720293?text=Hola,%20tengo%20una%20pregunta%20sobre%20los%20planes%20de%20Zitapp', '_blank')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
            </svg>
            Contactar a Soporte
          </button>
        </motion.div>
      </div>

        {/* Sección de garantía */}
        <motion.div
          className="text-center mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Garantía de satisfacción
            </h3>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Prueba Zitapp sin compromiso durante 15 días. Si no estás completamente satisfecho,
            cancela en cualquier momento. Sin preguntas, sin complicaciones.
          </p>
        </motion.div>

        
    </div>
  );
}