'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Users, Crown, Zap, ArrowLeft, Mail, Globe, Shield, Award, Clock, Smartphone, Building, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from "react";

// Definimos los planes base (solo para mostrar información)
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
      'Soporte'
    ],
    color: 'from-blue-500 to-blue-600',
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
      'Dashboard completo con métricas',
      'Gestión de servicios (agregar/eliminar)',
      'Sistema de reservas inteligente',
      'Historial de ventas completo',
      'Enlaces de reserva personalizados',
      'Configuración de horarios flexible',
      'Soporte'
    ],
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    id: 'premium',
    nombre: 'Premium',
    precio: 69000,
    profesionales: '5-10 profesionales',
    maxProfesionales: 10,
    descripcion: 'Para empresas grandes y centros médicos',
    populares: false,
    ahorro: 'Ahorra hasta 75%',
    icono: 'Crown',
    caracteristicas: [
      'Dashboard completo con métricas',
      'Gestión de servicios (agregar/eliminar)',
      'Sistema de reservas inteligente',
      'Historial de ventas completo',
      'Enlaces de reserva personalizados',
      'Configuración de horarios flexible',
      'Soporte'
    ],
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-200'
  }
];

// Addon de notificaciones - precios por plan
const getAddonNotificaciones = (planId: string) => {
  const precios: Record<string, number> = {
    'basico': 8000,
    'pro': 16000,
    'premium': 25000
  };

  return {
    precio: precios[planId] || 8000
  };
};

// Mapeo de iconos
const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
};

export default function PlanesNuevosPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </motion.button>

        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={16} />
            15 días de prueba gratuita - Sin tarjeta de crédito
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Conoce nuestros planes para hacer crecer tu
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> negocio</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Desde profesionales independientes hasta equipos grandes, Zitapp se adapta a tu negocio. 
            Comienza tu prueba gratuita y descubre por qué cientos de negocios confían en nosotros.
          </p>

          <motion.div
            className="inline-flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Sin configuración técnica</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Listo en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700">Soporte incluido</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
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
                  <span className="text-4xl font-bold">{formatearPrecio(plan.precio)}</span>
                  <span className="text-white/80">/mes</span>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-4 border border-white/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-lg">{plan.profesionales}</span>
                  </div>
                  <div className="text-white/80 text-xs text-center">
                    {plan.maxProfesionales === 1 ? 'Ideal para independientes' : 
                    plan.maxProfesionales <= 4 ? 'Perfecto para equipos pequeños' : 
                    'Diseñado para empresas grandes'}
                  </div>
                </div>

                {plan.maxProfesionales > 1 && (
                  <div className="bg-white/15 rounded-lg p-2 mt-3">
                    <div className="text-white/90 text-xs font-medium text-center">
                      💰 Solo {calcularPrecioPorProfesional(plan.precio, plan.maxProfesionales)} por profesional
                    </div>
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

                {/* Información completa sobre notificaciones */}
                    <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-blue-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-900">Emails profesionales automáticos</span>
                        <span className="font-bold text-blue-600">
                        +{formatearPrecio(getAddonNotificaciones(plan.id).precio)}/mes
                        </span>
                    </div>
                    
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                        <Check size={12} className="text-blue-500" />
                        <span>Email de confirmación automático al agendar</span>
                        </li>
                        <li className="flex items-center gap-2">
                        <Check size={12} className="text-blue-500" />
                        <span>Templates profesionales personalizados</span>
                        </li>
                        <li className="flex items-center gap-2">
                        <Check size={12} className="text-blue-500" />
                        <span>Entrega instantánea y confiable</span>
                        </li>
                        <li className="flex items-center gap-2">
                        <Check size={12} className="text-blue-500" />
                        <span>Mejora la imagen profesional</span>
                        </li>
                    </ul>
                    
                    <div className="mt-2 p-2 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">
                        Addon opcional: Agrega notificaciones profesionales a tu plan
                        </p>
                    </div>
                    </div>

                
              </div>
            </motion.div>
          ))}
        </div>

        {/* Por qué elegir Zitapp */}
        <motion.div
          className="mb-20 bg-white rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Zitapp para tu negocio?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más que una agenda digital, somos tu socio para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Móvil</h3>
              <p className="text-gray-600 text-sm">
                Funciona perfecto en cualquier dispositivo. Tus clientes pueden reservar desde su teléfono.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup en 5 minutos</h3>
              <p className="text-gray-600 text-sm">
                Sin complicaciones técnicas. Configura tu negocio en minutos, no en días.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aumenta ventas</h3>
              <p className="text-gray-600 text-sm">
                Reduce citas perdidas hasta 60% y aumenta tus ingresos con reservas 24/7.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-orange-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos seguros</h3>
              <p className="text-gray-600 text-sm">
                Tus datos y los de tus clientes están protegidos con los más altos estándares de seguridad.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Expandido */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Resolvemos tus dudas antes de que comiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Es difícil de configurar?
              </h3>
              <p className="text-gray-600">
                Para nada. Solo necesitas ingresar tu información básica y ya tienes tu agenda funcionando. 
                Sin instalaciones, sin configuraciones técnicas complicadas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Mis datos están seguros?
              </h3>
              <p className="text-gray-600">
                Absolutamente. Usamos los mismos estándares de seguridad que los bancos. 
                Tus datos están encriptados y respaldados automáticamente.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Puedo cancelar cuando quiera?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar en cualquier momento sin penalizaciones. 
                Tu cuenta se mantiene activa hasta el final del período pagado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué incluye el período de prueba?
              </h3>
              <p className="text-gray-600">
                15 días completos con todas las funcionalidades del plan que elijas. 
                Sin límites, sin restricciones. Es como si fueras cliente de pago.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Necesito saber de tecnología?
              </h3>
              <p className="text-gray-600">
                No necesitas conocimientos técnicos. Zitapp está diseñado para ser 
                intuitivo. Si sabes usar WhatsApp, sabes usar Zitapp.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué tipo de negocios funcionan?
              </h3>
              <p className="text-gray-600">
                Barberías, spas, salones de belleza, veterinarias, consultorios, 
                centros de estética, peluquerías caninas y cualquier negocio que maneje citas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Principal */}
        <motion.div
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para modernizar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comienza tu prueba gratuita de 15 días. Sin tarjeta de crédito, sin compromisos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={() => router.push('/registro')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Comenzar período de prueba
            </motion.button>
            
            <button 
              onClick={() => window.open('https://wa.me/573001334528?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20Zitapp%20para%20mi%20negocio', '_blank')}
              className="border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
              </svg>
              Hablar con un especialista
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>Datos seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Setup en 5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} />
              <span>Soporte incluido</span>
            </div>
          </div>
        </motion.div>

        {/* Garantía */}
        <motion.div
          className="text-center mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Garantía de satisfacción total
            </h3>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Si en tus primeros 15 días no ves resultados o no te gusta Zitapp, 
            simplemente no pagues nada. Sin preguntas, sin complicaciones, sin letra pequeña.
          </p>
        </motion.div>
      </div>
    </div>
  );
}