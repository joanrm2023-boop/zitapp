import { Shield, Lock, Eye, Users, FileText, Mail, Phone, Calendar } from 'lucide-react';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Zitapp</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </a>
             
              
              <a href="/planes-nuevos" className="text-gray-600 hover:text-gray-900 transition-colors">
                Planes
              </a>
              <a href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Iniciar Sesión
              </a>
              <a 
                href="/registro" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comenzar Gratis
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Tu privacidad es nuestra prioridad. Aquí te explicamos cómo protegemos tu información.
            </p>
            <p className="text-sm text-gray-500">
              Última actualización: Diciembre 2024
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Introducción */}
            <div className="mb-12">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen Ejecutivo</h2>
                <p className="text-gray-700 mb-4">
                  En Zitapp, protegemos tu información personal y la de tus clientes con los más altos estándares de seguridad. Solo recopilamos la información necesaria para brindarte nuestro servicio y nunca la compartimos con terceros sin tu consentimiento.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Lock className="text-green-500" size={20} />
                    <span className="text-sm font-medium text-gray-700">Datos encriptados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="text-green-500" size={20} />
                    <span className="text-sm font-medium text-gray-700">Servidores seguros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="text-green-500" size={20} />
                    <span className="text-sm font-medium text-gray-700">Sin venta de datos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Información que Recopilamos */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Información que Recopilamos</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="text-blue-500" size={20} />
                    Información del Negocio
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Nombre del negocio y datos de contacto</li>
                    <li>• Dirección física del establecimiento</li>
                    <li>• Información de servicios y precios</li>
                    <li>• Datos de profesionales que trabajen contigo</li>
                    <li>• Logo e imágenes del negocio</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="text-green-500" size={20} />
                    Información de Reservas
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Datos básicos de clientes (nombre, teléfono, email)</li>
                    <li>• Historial de citas y servicios solicitados</li>
                    <li>• Preferencias de horarios y profesionales</li>
                    <li>• Comentarios y calificaciones (cuando aplique)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="text-purple-500" size={20} />
                    Información de Cuenta
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Email y contraseña de acceso</li>
                    <li>• Datos de facturación y método de pago</li>
                    <li>• Configuraciones de notificaciones</li>
                    <li>• Registros de actividad en la plataforma</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Cómo Usamos tu Información */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="text-green-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Cómo Usamos tu Información</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Para brindarte el servicio</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Gestionar tu cuenta y configuraciones</li>
                    <li>• Procesar reservas y pagos</li>
                    <li>• Enviar confirmaciones y recordatorios</li>
                    <li>• Generar reportes de tu negocio</li>
                  </ul>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Para mejorar Zitapp</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Analizar uso de funcionalidades</li>
                    <li>• Identificar errores y mejoras</li>
                    <li>• Desarrollar nuevas características</li>
                    <li>• Optimizar rendimiento</li>
                  </ul>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Para comunicarnos contigo</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Soporte técnico y ayuda</li>
                    <li>• Actualizaciones importantes</li>
                    <li>• Consejos para usar mejor Zitapp</li>
                    <li>• Información sobre nuevas funciones</li>
                  </ul>
                </div>

                <div className="border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Para cumplir obligaciones legales</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Facturación y reportes fiscales</li>
                    <li>• Cumplimiento de normativas</li>
                    <li>• Prevención de fraude</li>
                    <li>• Seguridad de la plataforma</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Protección de Datos */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-purple-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Cómo Protegemos tu Información</h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medidas de Seguridad Técnicas</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Encriptación</h4>
                    <p className="text-gray-600 text-sm">Todos los datos se transmiten y almacenan con encriptación SSL/TLS de grado bancario.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Servidores Seguros</h4>
                    <p className="text-gray-600 text-sm">Utilizamos proveedores de nube certificados con centros de datos protegidos 24/7.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Acceso Limitado</h4>
                    <p className="text-gray-600 text-sm">Solo personal autorizado tiene acceso a los datos, bajo estrictas políticas de seguridad.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Monitoreo Continuo</h4>
                    <p className="text-gray-600 text-sm">Sistemas de detección y prevención de intrusos funcionando las 24 horas.</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Importante: Responsabilidad Compartida</h4>
                <p className="text-gray-700">
                  Aunque protegemos tu información con los más altos estándares, también es importante que uses contraseñas seguras y no compartas tu información de acceso con terceros.
                </p>
              </div>
            </div>

            {/* 4. Compartir Información */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-red-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Cuándo Compartimos tu Información</h2>
              </div>

              <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">⛔ Nunca Compartimos Para:</h3>
                <ul className="space-y-2 text-red-700">
                  <li>• Vender bases de datos a terceros</li>
                  <li>• Marketing de otras empresas</li>
                  <li>• Publicidad no relacionada con Zitapp</li>
                  <li>• Análisis externos sin tu consentimiento</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Solo Compartimos Cuando:</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-800">Con tu autorización explícita</h4>
                    <p className="text-green-700 text-sm">Cuando nos des permiso específico para compartir cierta información.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Para procesar pagos</h4>
                    <p className="text-green-700 text-sm">Con procesadores de pago certificados para manejar transacciones de forma segura.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Por obligación legal</h4>
                    <p className="text-green-700 text-sm">Cuando autoridades competentes lo requieran mediante orden judicial.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Para proteger derechos</h4>
                    <p className="text-green-700 text-sm">En casos de fraude, abuso o violación de términos de servicio.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Tus Derechos */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="text-indigo-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Tus Derechos sobre tu Información</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho de Acceso</h3>
                  <p className="text-gray-600 mb-3">Puedes solicitar una copia de toda la información personal que tenemos sobre ti.</p>
                  <p className="text-sm text-blue-600 font-medium">Disponible en tu dashboard</p>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho de Rectificación</h3>
                  <p className="text-gray-600 mb-3">Puedes actualizar o corregir cualquier información incorrecta en cualquier momento.</p>
                  <p className="text-sm text-blue-600 font-medium">Edita desde tu cuenta</p>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho de Portabilidad</h3>
                  <p className="text-gray-600 mb-3">Puedes exportar tus datos para usarlos en otra plataforma si decides cambiar.</p>
                  <p className="text-sm text-blue-600 font-medium">Exportación disponible</p>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho de Eliminación</h3>
                  <p className="text-gray-600 mb-3">Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados.</p>
                  <p className="text-sm text-blue-600 font-medium">Contacta con soporte</p>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">¿Cómo ejercer tus derechos?</h4>
                <p className="text-blue-700 mb-3">
                  Puedes ejercer cualquiera de estos derechos contactándonos por WhatsApp o email. Responderemos en un plazo máximo de 72 horas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="https://wa.me/573001334528?text=Hola,%20quiero%20ejercer%20mis%20derechos%20sobre%20mis%20datos%20personales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Phone size={16} />
                    WhatsApp
                  </a>
                  <a 
                    href="mailto:privacidad@zitapp.com"
                    className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                
                  </a>
                </div>
              </div>
            </div>

            {/* 6. Contacto */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Phone className="text-orange-600" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Contacto y Preguntas</h2>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg">
                <p className="text-gray-700 mb-6">
                  Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, no dudes en contactarnos:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Para consultas sobre privacidad:</h4>
                    <div className="space-y-2">
                      <a 
                        href="https://wa.me/573001334528?text=Hola,%20tengo%20preguntas%20sobre%20la%20política%20de%20privacidad%20de%20Zitapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Phone size={16} />
                        WhatsApp: +57 300 133 4528
                      </a>
                      <a 
                        href="mailto:privacidad@zitapp.com"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Mail size={16} />
                        Email: privacidad@zitapp.com
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Horarios de atención:</h4>
                    <div className="space-y-1 text-gray-600">
                      <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                      <p>Sábados: 9:00 AM - 2:00 PM</p>
                      <p>Domingos: Solo emergencias</p>
                      <p className="text-sm text-gray-500 mt-2">Zona horaria: GMT-5 (Colombia)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Última Actualización */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Actualizaciones de esta Política</h3>
                <p className="text-blue-700 mb-3">
                  Esta política puede ser actualizada ocasionalmente para reflejar cambios en nuestros servicios o en las regulaciones aplicables.
                </p>
                <p className="text-blue-700 mb-3">
                  <strong>Última actualización:</strong> Diciembre 2024
                </p>
                <p className="text-sm text-blue-600">
                  Te notificaremos por email sobre cualquier cambio significativo en esta política.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="text-xl font-bold">Zitapp</span>
              </div>
              <p className="text-gray-400">
                La plataforma de reservas más fácil de usar para barberías y salones de belleza.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="/planes" className="hover:text-white transition-colors">Precios</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="https://wa.me/573001334528?text=Hola,%20necesito%20ayuda%20con%20Zitapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a></div>
                <div><a href="https://wa.me/573001334528?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20uso%20de%20Zitapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Centro de ayuda</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="/nosotros" className="hover:text-white transition-colors">Sobre nosotros</a></div>
                <div><a href="/terminos" className="hover:text-white transition-colors">Términos</a></div>
                <div><a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Zitapp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}