'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from 'lucide-react'

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/registro" 
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            Volver al registro
          </Link>
          <img src="/logo_Zitapp.png" alt="Zitapp" className="h-12" />
        </div>
      </motion.header>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Título principal */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Política de Privacidad
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              En Zitapp, proteger tu privacidad y la de tus clientes es nuestra prioridad. 
              Te explicamos cómo recopilamos, usamos y protegemos la información.
            </motion.p>
            <motion.p 
              className="text-sm text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </motion.p>
          </div>

          {/* Contenido de política */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Sección 1: Información que Recopilamos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">1. Información que Recopilamos</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <h3 className="text-lg font-semibold text-gray-800">Información de tu Negocio:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombre del negocio y tipo de establecimiento</li>
                  <li>Correo electrónico y datos de contacto</li>
                  <li>Información de servicios y profesionales</li>
                  <li>Configuraciones de horarios y disponibilidad</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Información de los Clientes de tu Negocio:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombres y números de teléfono para reservas</li>
                  <li>Historial de citas y servicios utilizados</li>
                  <li>Preferencias de horarios y profesionales</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Información Técnica:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dirección IP y datos de navegación</li>
                  <li>Información del dispositivo y navegador</li>
                  <li>Cookies para mejorar la experiencia</li>
                  <li>Logs de actividad en la plataforma</li>
                </ul>
              </div>
            </section>

            {/* Sección 2: Cómo Usamos la Información */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">2. Cómo Usamos tu Información</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <h3 className="text-lg font-semibold text-gray-800">Para Proporcionar el Servicio:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gestionar tu cuenta y suscripción</li>
                  <li>Procesar reservas y pagos</li>
                  <li>Enviar notificaciones de citas</li>
                  <li>Generar reportes y estadísticas</li>
                  <li>Brindar soporte técnico</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Para Mejorar Zitapp:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analizar el uso de la plataforma</li>
                  <li>Desarrollar nuevas funcionalidades</li>
                  <li>Detectar y prevenir fraudes</li>
                  <li>Optimizar el rendimiento del sistema</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Comunicaciones:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Enviar actualizaciones importantes del servicio</li>
                  <li>Notificar sobre cambios en términos o precios</li>
                  <li>Responder a consultas de soporte</li>
                  <li>Enviar consejos para optimizar tu negocio (opcional)</li>
                </ul>
              </div>
            </section>

            {/* Sección 3: Protección de Datos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">3. Cómo Protegemos tu Información</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <h3 className="text-lg font-semibold text-gray-800">Medidas de Seguridad Técnicas:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encriptación SSL/TLS para todas las transmisiones</li>
                  <li>Bases de datos encriptadas y respaldadas diariamente</li>
                  <li>Autenticación de dos factores disponible</li>
                  <li>Monitoreo continuo de seguridad</li>
                  <li>Servidores seguros con acceso restringido</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Medidas Organizacionales:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceso limitado solo al personal autorizado</li>
                  <li>Capacitación regular en seguridad y privacidad</li>
                  <li>Auditorías periódicas de seguridad</li>
                  <li>Políticas estrictas de manejo de datos</li>
                </ul>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-800 font-medium">
                    🔒 <strong>Compromiso:</strong> Nunca vendemos, alquilamos o compartimos tu información 
                    personal con terceros para fines comerciales.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 4: Compartir Información */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">4. Cuándo Compartimos Información</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>Solo compartimos tu información en circunstancias muy limitadas:</p>
                
                <h3 className="text-lg font-semibold text-gray-800">Proveedores de Servicios Autorizados:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Procesadores de pago:</strong> Para procesar suscripciones y pagos de forma segura</li>
                  <li><strong>Servicios de email:</strong> Para enviar notificaciones y comunicaciones</li>
                  <li><strong>Hosting en la nube:</strong> Para almacenar datos de forma segura</li>
                  <li><strong>Herramientas de análisis:</strong> Para mejorar el rendimiento (datos anonimizados)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6">Requisitos Legales:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cuando sea requerido por ley o autoridades competentes</li>
                  <li>Para proteger nuestros derechos legales</li>
                  <li>En caso de investigaciones de fraude o actividades ilegales</li>
                </ul>

                <p className="font-medium text-gray-800 mt-4">
                  Todos nuestros proveedores firman acuerdos de confidencialidad y cumplen con estándares 
                  estrictos de protección de datos.
                </p>
              </div>
            </section>

            {/* Sección 5: Tus Derechos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">5. Tus Derechos sobre tus Datos</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>Tienes control total sobre tu información. Puedes:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">📥 Acceder</h4>
                    <p className="text-sm">Solicitar acceso a toda la información que tenemos sobre tu cuenta.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">✏️ Rectificar</h4>
                    <p className="text-sm">Corregir o actualizar cualquier información incorrecta.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">🗑️ Eliminar</h4>
                    <p className="text-sm">Solicitar la eliminación de tu cuenta y todos los datos asociados.</p>
                  </div>
                  
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800">
                    <strong>Para ejercer cualquiera de estos derechos,</strong> puedes contactarnos a través 
                    de la sección de ayuda en tu dashboard de Zitapp.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 6: Retención de Datos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">6. Retención de Datos</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <h3 className="text-lg font-semibold text-gray-800">Mientras tu cuenta esté activa:</h3>
                <p>Conservamos todos los datos necesarios para proporcionar el servicio.</p>

                <h3 className="text-lg font-semibold text-gray-800 mt-4">Después de cancelar tu cuenta:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>30 días:</strong> Período de gracia para reactivación (datos completos)</li>
                  <li><strong>90 días adicionales:</strong> Datos de respaldo para recuperación</li>
                  <li><strong>7 años:</strong> Información fiscal y de pagos (requerimiento legal)</li>
                </ul>

                <p className="font-medium text-gray-800 mt-4">
                  Puedes solicitar eliminación inmediata contactando a soporte, excepto datos que debamos 
                  conservar por obligaciones legales.
                </p>
              </div>
            </section>

            {/* Sección 7: Cookies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">7. Cookies y Tecnologías Similares</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>Usamos cookies para mejorar tu experiencia:</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">🔧 Cookies Esenciales (obligatorias)</h4>
                    <p className="text-sm ml-4">Necesarias para el funcionamiento básico de la plataforma, como mantener tu sesión iniciada.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">📊 Cookies de Análisis (opcionales)</h4>
                    <p className="text-sm ml-4">Nos ayudan a entender cómo usas Zitapp para mejorar el servicio.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">⚙️ Cookies de Preferencias (opcionales)</h4>
                    <p className="text-sm ml-4">Recuerdan tus configuraciones personalizadas y preferencias de idioma.</p>
                  </div>
                </div>

                <p className="text-sm bg-gray-50 p-3 rounded border-l-4 border-green-500 mt-4">
                  Puedes gestionar tus preferencias de cookies en cualquier momento desde la configuración 
                  de tu navegador o contactando a nuestro equipo.
                </p>
              </div>
            </section>

            {/* Sección 8: Transferencias Internacionales */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Transferencias Internacionales</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Nuestros servidores están ubicados en centros de datos seguros. Si tus datos se transfieren 
                  fuera de Colombia, nos aseguramos de que cumplan con estándares internacionales de protección 
                  de datos equivalentes.
                </p>
                <p>
                  Todos nuestros proveedores de servicios en la nube están certificados bajo marcos de 
                  cumplimiento reconocidos internacionalmente como SOC 2, ISO 27001, y otros.
                </p>
              </div>
            </section>

            {/* Sección 9: Menores de Edad */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Protección de Menores</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Zitapp está dirigido a negocios y propietarios mayores de 18 años. No recopilamos 
                  intencionalmente información personal de menores de 13 años.
                </p>
                <p>
                  Si un padre o tutor descubre que su hijo ha proporcionado información personal, 
                  puede contactarnos a través del dashboard para que eliminemos esa información inmediatamente.
                </p>
              </div>
            </section>

            {/* Nota final */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 text-center">
                Esta política de privacidad es efectiva a partir del {new Date().toLocaleDateString('es-ES')} y 
                cumple con las leyes de protección de datos de Colombia y estándares internacionales.
              </p>
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div 
            className="flex gap-4 justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              href="/terminos"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Ver Términos y Condiciones
            </Link>
            <Link 
              href="/registro"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Crear mi cuenta
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}