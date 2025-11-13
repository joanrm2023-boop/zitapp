'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar, ChevronDown, Users, Clock, CheckCircle, Search, Filter, DollarSign, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

export default function ReservasCanchaPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [expandedCanchaIds, setExpandedCanchaIds] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCanchaId, setFiltroCanchaId] = useState<string>('todas');
  const [cliente, setCliente] = useState<any>(null);
  const [porcentajeComision, setPorcentajeComision] = useState<number>(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener datos del cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, modo_demo')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) {
        console.error('No se encontró el cliente');
        setLoading(false);
        return;
      }

      setCliente(clienteData);
      const idCliente = clienteData.id_cliente;

      // Cargar porcentaje de comisión
      const { data: datosPago } = await supabase
        .from('datos_pago_clientes')
        .select('porcentaje_comision')
        .eq('id_cliente', idCliente)
        .single();

      if (datosPago) {
        setPorcentajeComision(datosPago.porcentaje_comision);
      }

      // Cargar canchas activas del cliente
      const { data: canchasData } = await supabase
        .from('canchas')
        .select('*')
        .eq('id_cliente', idCliente)
        .eq('activo', true);

      setCanchas(canchasData || []);

      // Cargar SOLO reservas confirmadas (pagadas)
      const { data: reservasData } = await supabase
        .from('reservas_cancha')
        .select('*')
        .eq('id_cliente', idCliente)
        .eq('estado_pago', 'confirmado');

      setReservas(reservasData || []);

      // Cargar transacciones para obtener montos
      const { data: transaccionesData } = await supabase
        .from('transacciones_canchas')
        .select('*')
        .eq('id_cliente', idCliente)
        .eq('estado', 'aprobado');

      setTransacciones(transaccionesData || []);

      setLoading(false);
    };

    obtenerDatos();
  }, []);

  const toggleCancha = (id: string) => {
    setExpandedCanchaIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const fechaSeleccionadaStr = fechaSeleccionada.toLocaleDateString('sv-SE');

  // Calcular estadísticas
  const resumen = (() => {
    const delDia = reservas.filter(r => r.fecha === fechaSeleccionadaStr);
    const montoTotalAnticipo = transacciones
      .filter(t => reservas.some(r => r.id === t.id_reserva && r.fecha === fechaSeleccionadaStr))
      .reduce((sum, t) => sum + (parseFloat(t.monto_anticipo) || 0), 0);
    const montoPendiente = transacciones
      .filter(t => reservas.some(r => r.id === t.id_reserva && r.fecha === fechaSeleccionadaStr))
      .reduce((sum, t) => sum + (parseFloat(t.monto_pendiente) || 0), 0);

    return {
      total: delDia.length,
      montoAnticipo: montoTotalAnticipo,
      montoPendiente: montoPendiente,
    };
  })();

  // Obtener monto de una reserva específica
  const obtenerMontos = (idReserva: number) => {
    const transaccion = transacciones.find(t => t.id_reserva === idReserva);
    return {
      anticipo: transaccion?.monto_anticipo || 0,
      pendiente: transaccion?.monto_pendiente || 0,
      precioHora: transaccion?.precio_hora || 0
    };
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
        Reservas de Canchas
      </h1>

      {/* 🎭 Indicador de modo demo */}
      {cliente?.modo_demo && (
        <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <div>
              <p className="text-sm font-semibold text-orange-800">
                Modo Demostración Activo
              </p>
              <p className="text-xs text-orange-600">
                Mostrando todas las reservas confirmadas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Reservas del Día</p>
              <p className="text-2xl font-bold">{resumen.total}</p>
            </div>
            <Calendar className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Anticipo Recibido</p>
              <p className="text-2xl font-bold">${resumen.montoAnticipo.toLocaleString('es-CO')}</p>
            </div>
            <CheckCircle className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Por Cobrar en Sitio</p>
              <p className="text-2xl font-bold">${resumen.montoPendiente.toLocaleString('es-CO')}</p>
            </div>
            <DollarSign className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {/* Selector de fecha y controles */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Seleccionar fecha:</label>
            <div className="relative">
              <Calendar
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
                size={18}
              />
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date) => setFechaSeleccionada(date)}
                dateFormat="yyyy-MM-dd"
                locale="es"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() - 86400000))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition text-blue-600 font-medium"
            >
              ⇦ <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center">
              <p className="font-semibold text-gray-800">
                {fechaSeleccionada.toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>

            <button
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() + 86400000))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition text-blue-600 font-medium"
            >
              <span className="hidden sm:inline">Siguiente</span> ⇨
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Filtrar por cancha:</label>
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <select
                  value={filtroCanchaId}
                  onChange={(e) => setFiltroCanchaId(e.target.value)}
                  className="pl-7 pr-8 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white appearance-none"
                >
                  <option value="todas">Todas las canchas</option>
                  {canchas.map(cancha => (
                    <option key={cancha.id_cancha} value={cancha.id_cancha}>
                      {cancha.nombre_cancha}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Buscar cliente:</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <input
                  type="text"
                  placeholder="Nombre o teléfono"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-7 pr-2 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando reservas...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {canchas.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No hay canchas registradas.</p>
            </div>
          ) : (
            canchas
              .filter(cancha => filtroCanchaId === 'todas' || cancha.id_cancha === filtroCanchaId)
              .map((cancha) => {
                const reservasDeCancha = reservas
                  .filter(
                    (r) =>
                      r.id_cancha === cancha.id_cancha &&
                      r.fecha === fechaSeleccionadaStr &&
                      (`${r.nombre} ${r.telefono}`.toLowerCase().includes(busqueda.toLowerCase()))
                  )
                  .sort((a, b) => {
                    const horaA = a.hora ?? '';
                    const horaB = b.hora ?? '';
                    return horaA.localeCompare(horaB);
                  });

                const estaExpandido = expandedCanchaIds.includes(cancha.id_cancha);

                return (
                  <motion.div
                    key={cancha.id_cancha}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleCancha(cancha.id_cancha)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {cancha.imagen_url ? (
                            <img
                              src={cancha.imagen_url}
                              alt={cancha.nombre_cancha}
                              className="w-12 h-12 object-cover rounded-lg border-2 border-blue-500"
                            />
                          ) : (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full">
                              <MapPin className="text-white" size={18} />
                            </div>
                          )}
                          <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                              {cancha.nombre_cancha}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {reservasDeCancha.length} reserva{reservasDeCancha.length !== 1 ? 's' : ''} confirmada{reservasDeCancha.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              💰 ${cancha.precio_hora?.toLocaleString('es-CO')} / hora
                            </p>
                          </div>
                        </div>
                        <motion.span
                          animate={{ rotate: estaExpandido ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-500"
                        >
                          <ChevronDown size={20} />
                        </motion.span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {estaExpandido && (
                        <motion.div
                          key="contenido"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-gray-200"
                        >
                          {reservasDeCancha.length === 0 ? (
                            <div className="p-6 text-center text-gray-600">
                              <Calendar className="mx-auto mb-3 text-gray-400" size={32} />
                              <p>No hay reservas confirmadas para este día.</p>
                            </div>
                          ) : (
                            <div className="p-4 space-y-3">
                              {reservasDeCancha.map((reserva) => {
                                const montos = obtenerMontos(reserva.id);
                                return (
                                  <div
                                    key={reserva.id}
                                    className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 text-base">
                                          {reserva.nombre}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                          <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {reserva.hora}
                                          </span>
                                          {reserva.telefono && (
                                            <span className="flex items-center gap-1">
                                              📱 {reserva.telefono}
                                            </span>
                                          )}
                                        </div>
                                        {reserva.correo && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            ✉️ {reserva.correo}
                                          </p>
                                        )}
                                        {reserva.identificacion && (
                                          <p className="text-sm text-gray-600">
                                            🆔 {reserva.identificacion}
                                          </p>
                                        )}
                                        {reserva.nota && (
                                          <p className="text-gray-600 text-sm mt-2 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                            📝 {reserva.nota}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Información de pagos */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                      <div className="bg-green-50 p-2 rounded border-l-2 border-green-400">
                                        <p className="text-xs text-green-600 font-medium">Anticipo pagado:</p>
                                        <p className="text-green-700 font-bold">${montos.anticipo.toLocaleString('es-CO')}</p>
                                      </div>
                                      <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-400">
                                        <p className="text-xs text-orange-600 font-medium">Pendiente en sitio:</p>
                                        <p className="text-orange-700 font-bold">${montos.pendiente.toLocaleString('es-CO')}</p>
                                      </div>
                                    </div>

                                    {/* Badge de estado */}
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                        ✅ Confirmada y Pagada
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
          )}
        </div>
      )}
    </motion.div>
  );
}

