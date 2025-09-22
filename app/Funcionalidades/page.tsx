import { Calendar, Users, BarChart3, Smartphone, Check, Star, ArrowRight, Zap, Shield, Clock, Settings, Bell, CreditCard, MapPin, ChevronRight } from 'lucide-react';

export default function Funcionalidades() {
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
              <a href="/planes" className="text-gray-600 hover:text-gray-900 transition-colors">
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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap size={16} />
              Todas las herramientas que necesitas
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Funcionalidades
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> completas</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Descubre todas las herramientas profesionales que Zitapp pone a tu disposición para modernizar y hacer crecer tu negocio.
            </p>
          </div>
        </div>
      </section>

      {/* Gestión de Reservas */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gestión de Reservas Inteligente
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Sistema automatizado que funciona 24/7 para que nunca pierdas una cita
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Reservas 24/7</h3>
                <p className="text-gray-600 mb-4">
                  Tus clientes pueden agendar citas a cualquier hora, incluso cuando tu negocio está cerrado.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Sin límite de horarios
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Disponible desde cualquier dispositivo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Confirmación automática
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <Bell className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recordatorios Automáticos</h3>
                <p className="text-gray-600 mb-4">
                  Reduce las citas perdidas con recordatorios por email.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Recordatorio 24h antes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Recordatorio 2h antes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Confirmación de asistencia
                  </li>
                </ul>
              </div>

              
            </div>
          </div>
        </div>
      </section>

      {/* Administración de Negocio */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings className="text-orange-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Administración Profesional
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Controla cada aspecto de tu negocio desde un dashboard centralizado
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div>
                <div className="bg-white p-8 rounded-2xl shadow-sm mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Gestión de Profesionales</h3>
                      <p className="text-gray-600">Administra tu equipo completo</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-green-500" />
                      Agregar, editar o eliminar profesionales
                    </li>
                    
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-green-500" />
                      Configurar horarios
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-green-500" />
                      Control de días laborables
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Gestión de Servicios</h3>
                      <p className="text-gray-600">Catálogo dinámico y actualizable</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-blue-500" />
                      Agregar nuevos servicios fácilmente
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-blue-500" />
                      Actualizar precios en tiempo real
                    </li>
                    
                  </ul>
                </div>
              </div>

              <div>
                <div className="bg-white p-8 rounded-2xl shadow-sm mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Configuración de Horarios</h3>
                      <p className="text-gray-600">Flexibilidad total en tu agenda</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-purple-500" />
                      Horarios diferentes por día
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-purple-500" />
                      Intervalos personalizables entre citas
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-purple-500" />
                      Días no laborables
                    </li>
                    
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Mi Negocio</h3>
                      <p className="text-gray-600">Personaliza tu perfil profesional</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-red-500" />
                      Logo y fotos del negocio
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-red-500" />
                      Información de contacto
                    </li>
                    <li className="flex items-center gap-3">
                      <ChevronRight size={16} className="text-red-500" />
                      Dirección y ubicación
                    </li>
                    
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Clientes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Experiencia Premium para tus Clientes
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Una interfaz intuitiva que hace que agendar citas sea súper fácil
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Reserva en 3 pasos simples</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Elige tu servicio</h4>
                      <p className="text-gray-600">Catálogo completo con precios y duración</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Selecciona profesional y horario</h4>
                      <p className="text-gray-600">Ve disponibilidad en tiempo real</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Confirma tu reserva</h4>
                      <p className="text-gray-600">Recibe confirmación inmediata por email</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <div className="bg-white p-6 rounded-xl shadow-sm mb-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-2"></div>
                    <h4 className="font-semibold">Barbería El Clásico</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Corte clásico</span>
                      <span className="font-semibold">$25,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profesional: Juan</span>
                      <span className="text-green-600">Disponible</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">
                    Reservar ahora
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reportes y Analytics */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Reportes y Analytics Completos
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Toma decisiones inteligentes con datos en tiempo real sobre tu negocio
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <CreditCard className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Métricas de Ventas</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Ingresos diarios, semanales y mensuales
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Servicios más vendidos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    Promedio de ventas
                  </li>
                  
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rendimiento del Equipo</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-500" />
                    Citas por profesional
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-500" />
                    Ingresos generados por cada uno
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-500" />
                    Horarios más productivos
                  </li>
                  
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <Calendar className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Análisis de Reservas</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-purple-500" />
                    Ocupación por día y hora
                  </li>
                  
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-purple-500" />
                    Clientes frecuentes vs nuevos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-purple-500" />
                    Horarios pico y valle
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Versatilidad */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perfecto para Diferentes Tipos de Negocio
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Zitapp se adapta perfectamente a las necesidades específicas de cada sector
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">✂️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Barberías</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Cortes y arreglos de barba</li>
                  <li>• Múltiples barberos</li>
                  <li>• Servicios tradicionales y modernos</li>
                  <li>• Ambiente masculino especializado</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">💆‍♀️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Spas</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Masajes y tratamientos</li>
                  <li>• Manicura y pedicura</li>
                  <li>• Terapias de relajación</li>
                  <li>• Experiencia premium</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">🐕</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Veterinarias</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Consultas y vacunas</li>
                  <li>• Peluquería canina</li>
                  <li>• Múltiples veterinarios</li>
                  <li>• Cuidado integral de mascotas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para probar todas estas funcionalidades?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comienza tu prueba gratuita de 15 días y descubre cómo Zitapp puede transformar tu negocio
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/registro"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Comenzar prueba gratuita
              </a>
              <a 
                href="/demo"
                className="border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Ver demo en vivo
              </a>
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
                <div><a href="/funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></div>
                <div><a href="/demo" className="hover:text-white transition-colors">Demo</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="https://wa.me/573152720293?text=Hola,%20necesito%20ayuda%20con%20Zitapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a></div>
                <div><a href="https://wa.me/573152720293?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20uso%20de%20Zitapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Centro de ayuda</a></div>
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