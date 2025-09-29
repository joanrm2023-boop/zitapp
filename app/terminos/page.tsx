'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Calendar, Shield, Users, CreditCard } from 'lucide-react'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
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
              Términos y Condiciones
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Estos términos rigen el uso de Zitapp, nuestra plataforma de gestión de reservas en línea.
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

          {/* Contenido de términos */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Sección 1: Aceptación */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">1. Aceptación de los Términos</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>
                  Al registrarte y usar Zitapp, confirmas que has leído, entendido y aceptas estos términos y condiciones. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
                </p>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre 
                  cambios importantes por correo electrónico.
                </p>
              </div>
            </section>

            {/* Sección 2: Descripción del Servicio */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">2. Descripción del Servicio</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>
                  Zitapp es una plataforma SaaS que permite a negocios de servicios (barberías, spas, veterinarias, canchas de fútbol) 
                  gestionar sus reservas en línea, incluyendo:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sistema de reservas online para clientes</li>
                  <li>Gestión de profesionales y servicios</li>
                  <li>Dashboard administrativo con estadísticas</li>
                  <li>Sistema de pagos integrado</li>
                  <li>Notificaciones automáticas</li>
                </ul>
                <p>
                  El servicio se proporciona "tal como está" y nos esforzamos por mantener un 99.9% de disponibilidad, 
                  aunque no podemos garantizar un servicio ininterrumpido.
                </p>
              </div>
            </section>

            {/* Sección 3: Registro y Cuentas */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">3. Registro y Cuentas de Usuario</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>
                  Para usar Zitapp, debes crear una cuenta proporcionando información precisa y actualizada. 
                  Eres responsable de:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mantener la confidencialidad de tu contraseña</li>
                  <li>Todas las actividades que ocurran bajo tu cuenta</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado</li>
                  <li>Proporcionar información veraz sobre tu negocio</li>
                </ul>
                <p>
                  Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos o 
                  proporcionen información falsa.
                </p>
              </div>
            </section>

            {/* Sección 4: Planes y Pagos */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">4. Planes y Pagos</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>
                  Ofrecemos diferentes planes de suscripción con características específicas:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Período de prueba:</strong> 15 días gratuitos para nuevos usuarios</li>
                  <li><strong>Plan Básico:</strong> Hasta 1 profesional</li>
                  <li><strong>Plan Pro:</strong> Hasta 4 profesionales</li>
                  <li><strong>Plan Premium:</strong> Hasta 10 profesionales</li>
                </ul>
                <p>
                  Los pagos se procesan mensualmente. Al no renovar tu suscripción, tu cuenta será suspendida 
                  pero conservaremos tus datos por 30 días adicionales.
                </p>
                <p>
                  <strong>Política de reembolsos:</strong> No ofrecemos reembolsos una vez que eliges un plan pagado, 
                    ya que proporcionamos un período de prueba gratuito de 15 días para que evalúes 
                    completamente el servicio antes de comprometerte con un pago.
                </p>
              </div>
            </section>

            {/* Sección 5: Uso Aceptable */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">5. Uso Aceptable</h2>
              </div>
              <div className="text-gray-700 space-y-4 pl-9">
                <p>Al usar Zitapp, te comprometes a NO:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Usar el servicio para actividades ilegales o fraudulentas</li>
                  <li>Intentar acceder sin autorización a otros sistemas</li>
                  <li>Enviar spam o contenido malicioso</li>
                  <li>Interferir con el funcionamiento normal del servicio</li>
                  <li>Usar el servicio para competir directamente con Zitapp</li>
                  <li>Compartir tu cuenta con terceros no autorizados</li>
                </ul>
                <p>
                  El incumplimiento de estas reglas puede resultar en la suspensión inmediata de tu cuenta.
                </p>
              </div>
            </section>

            {/* Sección 6: Propiedad Intelectual */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Zitapp y todo su contenido (código, diseño, logos, textos) son propiedad de Zitapp y están 
                  protegidos por leyes de derechos de autor. Tu uso del servicio no te otorga derechos de 
                  propiedad sobre el mismo.
                </p>
                <p>
                  Los datos que ingreses (información de clientes, servicios, etc.) siguen siendo tuyos. 
                  Nos concedes una licencia limitada para procesarlos y proporcionarte el servicio.
                </p>
              </div>
            </section>

            {/* Sección 7: Limitación de Responsabilidad */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Zitapp se proporciona "tal como está". En la máxima medida permitida por la ley, no seremos 
                  responsables por:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pérdidas de datos o ingresos</li>
                  <li>Interrupciones del servicio</li>
                  <li>Daños indirectos o consecuenciales</li>
                  <li>Acciones de terceros</li>
                </ul>
                <p>
                  Nuestra responsabilidad total no excederá el monto pagado por tu suscripción en los últimos 12 meses.
                </p>
              </div>
            </section>

            {/* Sección 8: Terminación */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Terminación del Servicio</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Puedes cancelar tu cuenta en cualquier momento desde tu panel de control. Nosotros podemos 
                  terminar tu acceso si violas estos términos, con o sin previo aviso.
                </p>
                <p>
                  Al terminar el servicio, tu acceso se suspenderá inmediatamente, pero conservaremos tus datos 
                  por 30 días para permitir reactivación o exportación.
                </p>
              </div>
            </section>

            {/* Sección 9: Contacto */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contacto y Soporte</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Para preguntas sobre estos términos o el servicio, puedes contactarnos a través 
                  de la sección "Ayuda" en tu dashboard de Zitapp.
                </p>
                <p>
                  Responderemos a todas las consultas dentro de 24 horas en días hábiles.
                </p>
              </div>
            </section>
            
            {/* Sección 10: Planes y Pagos */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-3"> Suspensión por falta de pago</h3>
              <div className="text-gray-700 space-y-3 pl-4">
                <p>
                  Tu cuenta será suspendida inmediatamente tras el vencimiento de tu suscripción. 
                  Después de 60 días consecutivos sin reactivar tu suscripción, tu cuenta será 
                  marcada como cancelada definitivamente.
                </p>
                <p>
                  Durante el período de suspensión, conservaremos tus datos de forma segura. 
                  Una vez marcada como cancelada, la reactivación requerirá contacto directo 
                  con nuestro equipo de soporte.
                </p>
              </div>
            </section>

            {/* Nota final */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 text-center">
                Estos términos y condiciones son efectivos a partir del {new Date().toLocaleDateString('es-ES')} y 
                se rigen por las leyes de Colombia.
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
              href="/politica-privacidad"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Ver Política de Privacidad
            </Link>
            <Link 
              href="/registro"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Crear mi cuenta
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}