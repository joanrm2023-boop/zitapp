import { Calendar, Users, BarChart3, Smartphone, Check, Star, ArrowRight, Zap, Shield, Clock, Heart, Target, Lightbulb, Award } from 'lucide-react';

export default function SobreNosotros() {
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
              <a href="/funcionalidades" className="text-gray-600 hover:text-gray-900 transition-colors">
                Funcionalidades
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
              <Heart size={16} />
              Nuestra historia
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sobre
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Zitapp</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nacimos para ayudar a pequeños negocios a profesionalizarse con tecnología simple y poderosa
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="text-blue-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Todo comenzó con una simple observación
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">El problema que vimos</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Visitábamos barberías, spas y veterinarias donde aún se manejaban las citas con agendas de papel, llamadas telefónicas constantes y mucha frustración tanto para los dueños como para los clientes.
                  </p>
                  <p>
                    Los dueños perdían tiempo valioso atendiendo el teléfono, se les olvidaban las citas, y muchos clientes se frustraban al no poder agendar fuera del horario comercial.
                  </p>
                  <p>
                    Nos dimos cuenta de que estos negocios necesitaban una solución diseñada específicamente para ellos: simple, poderosa y asequible.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl">
                <h4 className="font-bold text-gray-900 mb-4">Los desafíos que encontramos:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">60% de citas se perdían por olvidos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Clientes llamaban fuera de horario</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Doble reservas por errores manuales</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Tiempo perdido en tareas administrativas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra Misión */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nuestra Misión
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Empoderar a pequeños negocios de servicios con tecnología que realmente funciona para ellos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Simplicidad</h3>
                <p className="text-gray-600">
                  Creamos herramientas tan fáciles de usar que cualquier persona puede dominarlas en minutos, sin necesidad de capacitación técnica.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cercanía</h3>
                <p className="text-gray-600">
                  Entendemos las necesidades específicas de cada sector y ofrecemos soporte personalizado en español cuando lo necesites.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resultados</h3>
                <p className="text-gray-600">
                  No solo automatizamos reservas, ayudamos a nuestros usuarios a aumentar sus ventas y mejorar la satisfacción de sus clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Los valores que nos guían
              </h2>
              <p className="text-xl text-gray-600">
                Cada decisión que tomamos está basada en estos principios fundamentales
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 p-6 bg-blue-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Apoyo a pequeños negocios</h3>
                  <p className="text-gray-600">
                    Creemos firmemente que los pequeños negocios son el corazón de nuestras comunidades. Por eso diseñamos Zitapp específicamente para ayudarlos a competir con herramientas profesionales a precios justos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-green-50 rounded-2xl">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparencia total</h3>
                  <p className="text-gray-600">
                    Sin costos ocultos, sin trucos, sin letra pequeña. Lo que ves es lo que pagas. Nuestros precios son claros y nuestras funcionalidades están completamente disponibles durante el período de prueba.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 p-6 bg-purple-50 rounded-2xl">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovación constante</h3>
                  <p className="text-gray-600">
                    Escuchamos activamente a nuestros usuarios y mejoramos continuamente la plataforma. Cada nueva funcionalidad surge de necesidades reales de negocios reales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Compromiso desde el día 1 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nuestro compromiso desde el día 1
              </h2>
              <p className="text-xl text-gray-600">
                Prometemos solo lo que podemos cumplir, y lo cumplimos desde el primer día
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">15 días completamente gratis</h3>
                <p className="text-gray-600">
                  Prueba todas las funcionalidades sin restricciones. Sin tarjeta de crédito, sin compromisos, sin letra pequeña.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Listo en 5 minutos</h3>
                <p className="text-gray-600">
                  Configuración súper simple. Agrega tus servicios, profesionales y ¡listo! Tu sistema de citas estará funcionando.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte personal</h3>
                <p className="text-gray-600">
                  Te ayudamos por WhatsApp en español. Respuestas rápidas de personas reales que entienden tu negocio.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Por qué puedes confiar en nosotros?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Porque hemos diseñado Zitapp pensando en negocios reales, con necesidades reales. No somos una gran corporación; somos emprendedores que entienden lo que significa construir un negocio desde cero.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                  <Check className="text-green-500" size={20} />
                  <span className="font-medium text-gray-700">Sin costos ocultos</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                  <Check className="text-green-500" size={20} />
                  <span className="font-medium text-gray-700">Precios justos</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                  <Check className="text-green-500" size={20} />
                  <span className="font-medium text-gray-700">Soporte en español</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Compromiso */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nuestro compromiso contigo
            </h2>
            <p className="text-xl mb-8 opacity-90">
              No importa si tienes una barbería pequeña o una cadena de spas, estamos aquí para ayudarte a crecer
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Soporte rápido</h3>
                <p className="opacity-90">Respondemos en menos de 2 horas en horario laboral</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Datos seguros</h3>
                <p className="opacity-90">Tu información está protegida con los más altos estándares</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Éxito garantizado</h3>
                <p className="opacity-90">Te acompañamos hasta que veas resultados reales en tu negocio</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/registro"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Únete a Zitapp hoy
              </a>
              <a 
                href="https://wa.me/573152720293?text=Hola,%20me%20gustaría%20conocer%20más%20sobre%20el%20equipo%20de%20Zitapp"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Conversa con nosotros
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