'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, User, BarChart3, TrendingUp, Download } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
registerLocale('es', es);

// Interfaces para tipado
interface Barbero {
  id_barbero: string;
  nombre_barbero: string;
}

interface ReservaConBarbero {
  id: string;
  id_ser: string;
  hora: string;
  fecha: string;
  id_barbero: string;
  barberos?: {
    nombre_barbero: string;
  } | null;
}

interface VentaConsolidada {
  id: string;
  servicio: string;
  barbero: string;
  precio: number;
  cantidad: number;
  total: number;
  fechas: string[];
  horas: string[];
}

// Nueva interface para agrupar por barbero
interface VentasPorBarbero {
  nombreBarbero: string;
  idBarbero: string;
  ventas: VentaConsolidada[];
  totalBarbero: number;
  serviciosBarbero: number;
}

interface Estadisticas {
  totalVentas: number;
  serviciosRealizados: number;
  promedioVenta: number;
  servicioMasVendido: string;
}

export default function VentasPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [vistaActual, setVistaActual] = useState<'dia' | 'rango'>('dia');
  const [ventas, setVentas] = useState<VentaConsolidada[]>([]);
  const [ventasPorBarbero, setVentasPorBarbero] = useState<VentasPorBarbero[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Array<{id_ser: string, ser_nombre: string}>>([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalVentas: 0,
    serviciosRealizados: 0,
    promedioVenta: 0,
    servicioMasVendido: ''
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar barberos y servicios al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id_cliente')
          .eq('user_id', user.id)
          .single();

        if (!clienteData) return;

        console.log('ID Cliente actual:', clienteData.id_cliente); // Para debug

        // Cargar barberos
        const { data: barberosData } = await supabase
          .from('barberos')
          .select('id_barbero, nombre_barbero')
          .eq('id_cliente', clienteData.id_cliente)
          .eq('activo', true)
          .neq('estado', 'eliminado'); // ← solo activos (no eliminados)

        setBarberos(barberosData || []);
        console.log('Barberos cargados para cliente:', barberosData); // Para debug

        // Cargar servicios - VERSIÓN SIMPLE CON FILTRO
        const { data: todosLosServicios } = await supabase
          .from('servicios')
          .select('id_ser, ser_nombre, ser_estado')
          .eq('id_cliente', clienteData.id_cliente);

        // Filtrar manualmente por estado activo
        const serviciosActivos = todosLosServicios?.filter(servicio => servicio.ser_estado === 'activo') || [];
        
        setServicios(serviciosActivos);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    const cargarVentas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Error de autenticación');
          setLoading(false);
          return;
        }

        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('id_cliente')
          .eq('user_id', user.id)
          .single();

        if (clienteError || !clienteData) {
          setError('Error al obtener información del cliente');
          setLoading(false);
          return;
        }

        const idCliente = clienteData.id_cliente;
        
        // Construir query base - usando sintaxis más simple sin relación
        let query = supabase
          .from('reservas')
          .select(`
            id, 
            id_ser, 
            hora, 
            fecha,
            id_barbero
          `)
          .eq('id_cliente', idCliente)
          .eq('estado', 'cumplida')
          .not('id_ser', 'is', null);

        // Aplicar filtros de fecha según la vista
        if (vistaActual === 'dia') {
          const fechaStr = fechaSeleccionada.toLocaleDateString('sv-SE');
          query = query.eq('fecha', fechaStr);
        } else {
          const fechaInicioStr = fechaInicio.toLocaleDateString('sv-SE');
          const fechaFinStr = fechaFin.toLocaleDateString('sv-SE');
          query = query.gte('fecha', fechaInicioStr).lte('fecha', fechaFinStr);
        }

        // Aplicar filtro de barbero
        if (barberoSeleccionado !== 'todos') {
          query = query.eq('id_barbero', barberoSeleccionado);
        }

        // Aplicar filtro de servicio
        if (servicioSeleccionado !== 'todos') {
          query = query.eq('id_ser', servicioSeleccionado);
        }

        const { data: reservasCumplidas, error: reservasError } = await query;

        if (reservasError) {
          setError(`Error al consultar reservas: ${reservasError.message}`);
          setLoading(false);
          return;
        }

        if (!reservasCumplidas || reservasCumplidas.length === 0) {
          setVentas([]);
          setVentasPorBarbero([]);
          setEstadisticas({
            totalVentas: 0,
            serviciosRealizados: 0,
            promedioVenta: 0,
            servicioMasVendido: ''
          });
          setLoading(false);
          return;
        }

        // Obtener servicios
        const { data: serviciosData, error: serviciosError } = await supabase
          .from('servicios')
          .select('id_ser, ser_nombre, ser_precio')
          .eq('id_cliente', idCliente);

        if (serviciosError) {
          setError(`Error al obtener servicios: ${serviciosError.message}`);
          setLoading(false);
          return;
        }

        // Aplicar filtro de servicio si está seleccionado
        let serviciosFiltrados = serviciosData;
        if (servicioSeleccionado !== 'todos') {
          serviciosFiltrados = serviciosData?.filter(s => s.id_ser === servicioSeleccionado);
          // También filtrar las reservas por el servicio seleccionado
          const reservasFiltradas = reservasCumplidas.filter(r => r.id_ser === servicioSeleccionado);
          if (reservasFiltradas.length === 0) {
            setVentas([]);
            setVentasPorBarbero([]);
            setEstadisticas({
              totalVentas: 0,
              serviciosRealizados: 0,
              promedioVenta: 0,
              servicioMasVendido: ''
            });
            setLoading(false);
            return;
          }
        }

        // Obtener información de barberos para las reservas encontradas
        const barberosIds = [...new Set(reservasCumplidas.map(r => r.id_barbero))];
        const { data: barberosReservasData, error: barberosReservasError } = await supabase
          .from('barberos')
          .select('id_barbero, nombre_barbero')
          .in('id_barbero', barberosIds);

        if (barberosReservasError) {
          setError(`Error al obtener barberos: ${barberosReservasError.message}`);
          setLoading(false);
          return;
        }

        // Crear mapa de barberos para fácil acceso
        const barberosMap = barberosReservasData?.reduce((acc, barbero) => {
          acc[barbero.id_barbero] = barbero.nombre_barbero;
          return acc;
        }, {} as Record<string, string>) || {};

        // Consolidar ventas
        const ventasConsolidadas: Record<string, VentaConsolidada> = {};
        let totalIngresos = 0;
        let totalServicios = 0;
        const conteoServicios: Record<string, number> = {};

        // Las reservas ya están filtradas por la query de Supabase
        reservasCumplidas.forEach((reserva) => {
          const servicio = serviciosData?.find(s => s.id_ser === reserva.id_ser);
          if (!servicio) return;

          const clave = `${servicio.id_ser}_${reserva.id_barbero}`;
          const nombreBarbero = barberosMap[reserva.id_barbero] || 'Sin barbero';
          
          if (!ventasConsolidadas[clave]) {
            ventasConsolidadas[clave] = {
              id: clave,
              servicio: servicio.ser_nombre,
              barbero: nombreBarbero,
              precio: servicio.ser_precio,
              cantidad: 1,
              total: servicio.ser_precio,
              fechas: vistaActual === 'rango' ? [reserva.fecha] : [],
              horas: vistaActual === 'dia' ? [reserva.hora] : []
            };
          } else {
            ventasConsolidadas[clave].cantidad += 1;
            ventasConsolidadas[clave].total += servicio.ser_precio;
            if (vistaActual === 'rango') {
              ventasConsolidadas[clave].fechas.push(reserva.fecha);
            } else {
              ventasConsolidadas[clave].horas.push(reserva.hora);
            }
          }

          totalIngresos += servicio.ser_precio;
          totalServicios += 1;
          conteoServicios[servicio.ser_nombre] = (conteoServicios[servicio.ser_nombre] || 0) + 1;
        });

        const ventasArray = Object.values(ventasConsolidadas);

        // Agrupar ventas por barbero
        const ventasAgrupadasPorBarbero: Record<string, VentasPorBarbero> = {};
        
        ventasArray.forEach((venta) => {
          if (!ventasAgrupadasPorBarbero[venta.barbero]) {
            ventasAgrupadasPorBarbero[venta.barbero] = {
              nombreBarbero: venta.barbero,
              idBarbero: Object.keys(barberosMap).find(id => barberosMap[id] === venta.barbero) || '',
              ventas: [],
              totalBarbero: 0,
              serviciosBarbero: 0
            };
          }
          
          ventasAgrupadasPorBarbero[venta.barbero].ventas.push(venta);
          ventasAgrupadasPorBarbero[venta.barbero].totalBarbero += venta.total;
          ventasAgrupadasPorBarbero[venta.barbero].serviciosBarbero += venta.cantidad;
        });

        // Ordenar barberos alfabéticamente y sus servicios por nombre
        const ventasPorBarberoOrdenadas = Object.values(ventasAgrupadasPorBarbero)
          .sort((a, b) => a.nombreBarbero.localeCompare(b.nombreBarbero))
          .map(grupo => ({
            ...grupo,
            ventas: grupo.ventas.sort((a, b) => a.servicio.localeCompare(b.servicio))
          }));

        // Calcular estadísticas
        const servicioMasVendido = Object.keys(conteoServicios).length > 0 
          ? Object.keys(conteoServicios).reduce((a, b) => 
              conteoServicios[a] > conteoServicios[b] ? a : b
            )
          : '';

        setVentas(ventasArray);
        setVentasPorBarbero(ventasPorBarberoOrdenadas);
        setEstadisticas({
          totalVentas: totalIngresos,
          serviciosRealizados: totalServicios,
          promedioVenta: totalServicios > 0 ? totalIngresos / totalServicios : 0,
          servicioMasVendido
        });
        
      } catch (err) {
        console.error('Error inesperado:', err);
        setError('Error inesperado al cargar las ventas');
      } finally {
        setLoading(false);
      }
    };

    cargarVentas();
  }, [fechaSeleccionada, fechaInicio, fechaFin, vistaActual, barberoSeleccionado, servicioSeleccionado]);

  const exportarCSV = () => {
    if (ventas.length === 0) return;

    const headers = ['Barbero', 'Servicio', 'Precio', 'Cantidad', 'Total'];
    const csvContent = [
      headers.join(','),
      ...ventas.map(venta => [
        `"${venta.barbero}"`,
        `"${venta.servicio}"`,
        venta.precio,
        venta.cantidad,
        venta.total
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${vistaActual === 'dia' ? fechaSeleccionada.toISOString().split('T')[0] : 'rango'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
         Ventas
      </h1>

      {/* Selector de Vista */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setVistaActual('dia')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              vistaActual === 'dia' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Vista por Día
          </button>
          <button
            onClick={() => setVistaActual('rango')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              vistaActual === 'rango' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Rango de Fechas
          </button>
        </div>
      </div>

      {/* Controles de Filtros */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border space-y-4">
          
          {/* Filtros de Fecha */}
          {vistaActual === 'dia' ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">📅 Fecha:</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
                <DatePicker
                  selected={fechaSeleccionada}
                  onChange={(date: Date | null) => date && setFechaSeleccionada(date)}
                  dateFormat="yyyy-MM-dd"
                  locale="es"
                  className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">📅 Fecha Inicio:</label>
                <DatePicker
                  selected={fechaInicio}
                  onChange={(date: Date | null) => date && setFechaInicio(date)}
                  dateFormat="yyyy-MM-dd"
                  locale="es"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">📅 Fecha Fin:</label>
                <DatePicker
                  selected={fechaFin}
                  onChange={(date: Date | null) => date && setFechaFin(date)}
                  dateFormat="yyyy-MM-dd"
                  locale="es"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
                />
              </div>
            </div>
          )}

          {/* Filtros de Profesional y Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtro de Profesional */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">💼 Profesional:</label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <select
                  value={barberoSeleccionado}
                  onChange={(e) => setBarberoSeleccionado(e.target.value)}
                  className="pl-7 pr-8 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white appearance-none"
                >
                  <option value="todos">Todos</option>
                  {barberos.map((barbero) => (
                    <option key={barbero.id_barbero} value={barbero.id_barbero}>
                      {barbero.nombre_barbero}
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

            {/* Filtro de Servicio */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">✂️ Servicio:</label>
              <div className="relative">
                <BarChart3 className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <select
                  value={servicioSeleccionado}
                  onChange={(e) => setServicioSeleccionado(e.target.value)}
                  className="pl-7 pr-8 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white appearance-none"
                >
                  <option value="todos">Todos</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id_ser} value={servicio.id_ser}>
                      {servicio.ser_nombre}
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
          </div>
        </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Ventas</p>
              <p className="text-2xl font-bold">${estadisticas.totalVentas.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Servicios</p>
              <p className="text-2xl font-bold">{estadisticas.serviciosRealizados}</p>
            </div>
            <BarChart3 className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Promedio</p>
              <p className="text-2xl font-bold">${Math.round(estadisticas.promedioVenta).toLocaleString()}</p>
            </div>
            <Calendar className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Más Vendido</p>
              <p className="text-sm font-bold truncate">{estadisticas.servicioMasVendido || 'N/A'}</p>
            </div>
            <User className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando ventas...</p>
        </div>
      ) : ventasPorBarbero.length === 0 && !error ? (
        <div className="text-center py-8 text-gray-600">
          <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
          <p>No hay ventas registradas para los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          {/* Vista agrupada por barberos */}
          <div className="space-y-6">
            {ventasPorBarbero.map((grupoBarbero) => (
              <motion.div 
                key={grupoBarbero.idBarbero}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden"
              >
                {/* Header del barbero */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <User className="text-blue-100" size={24} />
                      <div>
                        <h3 className="text-xl font-bold">{grupoBarbero.nombreBarbero}</h3>
                        <p className="text-blue-100 text-sm">
                          {grupoBarbero.serviciosBarbero} servicio{grupoBarbero.serviciosBarbero !== 1 ? 's' : ''} realizados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${grupoBarbero.totalBarbero.toLocaleString()}
                      </p>
                      <p className="text-blue-100 text-sm">
                        Total del profesional
                      </p>
                    </div>
                  </div>
                </div>

                {/* Servicios del barbero */}
                <div className="p-4 space-y-3">
                  {grupoBarbero.ventas.map((venta, index) => (
                    <motion.div 
                      key={venta.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800 text-lg">{venta.servicio}</h4>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {venta.cantidad} servicio{venta.cantidad !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <span>💰</span>
                              <span>Precio unitario: ${venta.precio.toLocaleString()}</span>
                            </div>
                            {vistaActual === 'dia' && venta.horas.length > 0 && (
                              <div className="flex items-center gap-1 md:col-span-2">
                                <span>🕒</span>
                                <span>Hora{venta.cantidad > 1 ? 's' : ''}: {venta.horas.sort().join(', ')}</span>
                              </div>
                            )}
                            {vistaActual === 'rango' && venta.fechas.length > 0 && (
                              <div className="flex items-center gap-1 md:col-span-2">
                                <span>📅</span>
                                <span>Fechas: {[...new Set(venta.fechas)].sort().join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            ${venta.total.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Subtotal
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resumen Final */}
          <div className="mt-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  💰 Resumen {vistaActual === 'dia' ? 'del Día' : 'del Período'}
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {vistaActual === 'dia' 
                    ? fechaSeleccionada.toLocaleDateString('es-CO', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })
                    : `${fechaInicio.toLocaleDateString('es-CO')} - ${fechaFin.toLocaleDateString('es-CO')}`
                  }
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {estadisticas.serviciosRealizados} servicio{estadisticas.serviciosRealizados !== 1 ? 's' : ''} realizado{estadisticas.serviciosRealizados !== 1 ? 's' : ''}
                  {barberoSeleccionado !== 'todos' && (
                    <span> por {barberos.find(b => b.id_barbero === barberoSeleccionado)?.nombre_barbero}</span>
                  )}
                  {servicioSeleccionado !== 'todos' && (
                    <span> del servicio "{servicios.find(s => s.id_ser === servicioSeleccionado)?.ser_nombre}"</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-800">
                  ${estadisticas.totalVentas.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  Promedio: ${Math.round(estadisticas.promedioVenta).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}


