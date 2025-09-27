import { Calendar, Users, BarChart3, Smartphone, Check, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

export default function Home() {
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
              Prueba gratuita por 15 días
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              La agenda digital que tu
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Negocio necesita</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automatiza tus reservas, gestiona tus clientes y haz crecer tu negocio con la plataforma más fácil de usar del mercado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/registro"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Comenzar ahora gratis
              </a>
              
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Configuración en 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tu barbería
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde reservas online hasta reportes de ventas, Zitapp te ayuda a profesionalizar tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reservas Online 24/7</h3>
              <p className="text-gray-600">
                Tus clientes pueden agendar citas desde cualquier lugar, a cualquier hora. Sistema inteligente de reservas con confirmaciones automáticas.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Administrar Profesionales</h3>
              <p className="text-gray-600">
                Agrega, edita o elimina profesionales. Asigna servicios específicos y controla horarios individuales de cada miembro del equipo.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Monitorear Ventas</h3>
              <p className="text-gray-600">
                Dashboard completo con métricas en tiempo real. Ve ingresos diarios, servicios más vendidos y rendimiento por profesional.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Configurar Horarios</h3>
              <p className="text-gray-600">
                Define horarios de apertura, días no laborables y intervalos entre citas. Configuración flexible para cada día de la semana.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestionar Servicios</h3>
              <p className="text-gray-600">
                Agrega, edita precios o elimina servicios en tiempo real. Mantén tu catálogo actualizado y optimiza tus ofertas.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ver Todas las Reservas</h3>
              <p className="text-gray-600">
                Panel centralizado para ver, confirmar o cancelar reservas. Filtra por fecha, profesional o estado de la cita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Management Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Control total de tu barbería desde un solo lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zitapp te da todas las herramientas que necesitas para administrar profesionalmente tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard completo de gestión</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mt-1">
                    <BarChart3 size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Monitoreo de ventas en tiempo real</h4>
                    <p className="text-gray-600 text-sm">Ve tus ingresos del día, semana o mes. Identifica tendencias y optimiza tu negocio.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mt-1">
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gestión completa de profesionales</h4>
                    <p className="text-gray-600 text-sm">Agrega, edita o elimina profesionales. Asigna servicios y controla horarios individuales.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mt-1">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Control total de reservas</h4>
                    <p className="text-gray-600 text-sm">Visualiza, confirma o cancela citas. Filtra por fecha, profesional o estado.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mt-1">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Configuración flexible de horarios</h4>
                    <p className="text-gray-600 text-sm">Define días laborables, horarios de apertura e intervalos entre citas.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mt-1">
                    <BarChart3 size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Administración de servicios</h4>
                    <p className="text-gray-600 text-sm">Agrega nuevos servicios, actualiza precios o elimina los que no ofreces.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600">89%</div>
                  <div className="text-sm text-gray-600">Menos citas perdidas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">+40%</div>
                  <div className="text-sm text-gray-600">Aumento en ventas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-purple-600">5min</div>
                  <div className="text-sm text-gray-600">Tiempo de setup</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">Reservas online</div>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Resultados comprobados</h4>
                <p className="text-gray-600 text-sm">
                  Las barberías que usan Zitapp reportan menos tiempo administrativo y más ingresos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Aumenta tus ventas en tu Barberia hasta un 40% con reservas online
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Las barberías que usan Zitapp reportan menos citas perdidas, mayor ocupación y clientes más satisfechos.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Reduce las citas perdidas en un 60%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Automatiza confirmaciones por email</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Clientes pueden reagendar sin llamarte</span>
                </div>
              </div>
            </div>
            
            {/* ESPACIO PARA IMAGEN DE BARBERÍA */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                {/* Aquí irá tu imagen de barbería */}
                <img 
                  src="barberia.png" 
                  alt="Barbero profesional gestionando citas con Zitapp" 
                  className="rounded-xl w-full h-auto object-cover mb-6"
                />
                
            
                <p className="text-gray-600 text-sm">
                  Compártelo en redes sociales, WhatsApp o ponlo en tu local. Tus clientes lo amarán.
                </p>
              </div>
            </div>
          </div>

          {/* Nueva sección para SPA */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20">
            {/* ESPACIO PARA IMAGEN DE SPA */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                {/* Aquí irá tu imagen de spa */}
                <img 
                  src="/spa.png" 
                  alt="Spa profesional con servicios de masajes y manicura" 
                  className="rounded-xl w-full h-auto object-cover mb-6"
                />
    
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfecto también para Spas y centros de belleza
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Los centros de belleza que usan Zitapp optimizan sus horarios y ofrecen una experiencia premium a sus clientes.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Gestiona tratamientos </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Organiza múltiples terapeutas y especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Clientes pueden elegir su terapeuta preferido</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nueva sección para PELUQUERÍA CANINA */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfecto para Veterinarias y peluquerías caninas
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Las peluquerías caninas que usan Zitapp organizan mejor sus citas y brindan un servicio más profesional a las mascotas y sus dueños.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Agenda baños, cortes y tratamientos estéticos</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-700">Los dueños pueden agendar desde casa sin estrés</span>
                </div>
              </div>
            </div>

            {/* ESPACIO PARA IMAGEN DE PELUQUERÍA CANINA */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                {/* Aquí irá tu imagen de peluquería canina */}
                <img 
                  src="/veterianaria.png" 
                  alt="Profesional de peluquería canina bañando y cortando pelo a mascota" 
                  className="rounded-xl w-full h-auto object-cover mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Para Peluquerías Caninas</h3>
                
                <p className="text-gray-600 text-sm">
                  Los dueños pueden agendar baños y cortes fácilmente, especificando raza y servicios necesarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium mb-6">
              "Desde que uso Zitapp, mis clientes están más contentos y yo tengo más tiempo para enfocarme en cortar cabello. Las reservas se manejan solas."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JM</span>
              </div>
              <div>
                <p className="font-semibold">Juan Manuel</p>
                <p className="text-blue-200">Barbería El Clásico, Bogotá</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Planes que se adaptan a tu negocio
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Desde profesionales independientes hasta grandes cadenas
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-2">Básico</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">$28,000<span className="text-lg text-gray-500">/mes</span></div>
              <p className="text-gray-600 mb-4">Perfecto para empezar</p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  1 profesional
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Reservas online
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Reportes básicos
                </li>
              </ul>
            </div>

            <div className="border-2 border-blue-500 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">$49,000<span className="text-lg text-gray-500">/mes</span></div>
              <p className="text-gray-600 mb-4">Para equipos pequeños</p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Hasta 4 profesionales
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Todo del plan Básico
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Reportes avanzados
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">$69,000<span className="text-lg text-gray-500">/mes</span></div>
              <p className="text-gray-600 mb-4">Para empresas grandes</p>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Hasta 10 profesionales
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Todo del plan Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Soporte prioritario
                </li>
              </ul>
            </div>
          </div>
          
          <a 
            href="/planes-nuevos" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Ver todos los planes
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para modernizar tu barbería?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a cientos de barberías que ya usan Zitapp para crecer su negocio
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/registro"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Comenzar prueba gratuita
              </a>
              <a 
                href="https://wa.me/573001334528?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20Zitapp%20para%20mi%20barbería"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Hablar con un experto
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-white/80">
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <span>Datos seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>Setup en 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone size={20} />
                <span>100% móvil</span>
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
            
            {/* Redes sociales */}
            <div className="flex items-center gap-4 mt-6">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/573001334528?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20Zitapp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/AQUI_VA_TU_FACEBOOK"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/AQUI_VA_TU_INSTAGRAM"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="/planes" className="hover:text-white transition-colors">Precios</a></div>
                <div><a href="/Funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></div>
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
                <div><a href="/Sobre-nosotros" className="hover:text-white transition-colors">Sobre nosotros</a></div>
                <div><a href="/terminos" className="hover:text-white transition-colors">Términos</a></div>
                <div><a href="/politica-privacidad" className="hover:text-white transition-colors">Politica de Privacidad</a></div>
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