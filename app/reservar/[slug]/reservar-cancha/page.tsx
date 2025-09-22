'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function ReservarCancha() {
  const { slug } = useParams();

  const [cliente, setCliente] = useState<any>(null);
  const [canchas, setCanchas] = useState([]);
  const [horas, setHoras] = useState<string[]>([]);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [nota, setNota] = useState('');

  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });

  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const mensajeRef = useRef(null);

  const [mostrarToast, setMostrarToast] = useState(false);
  const [textoToast, setTextoToast] = useState('');

  const lanzarToast = (mensaje: string) => {
    setTextoToast(mensaje);
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 2500);
  };

  useEffect(() => {
    if (mensajeRef.current) {
      (mensajeRef.current as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [mensaje]);

  useEffect(() => {
    const obtenerCliente = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setCliente(null);
      } else {
        setCliente(data);
      }

      setCargando(false);
    };

    obtenerCliente();
  }, [slug]);

  useEffect(() => {
    const obtenerCanchas = async () => {
      if (!cliente?.id_cliente) return;

      const { data } = await supabase
        .from('canchas')
        .select('*')
        .eq('id_cliente', cliente.id_cliente)
        .eq('activo', true);

      setCanchas(data || []);
    };

    obtenerCanchas();
  }, [cliente]);

  useEffect(() => {
    const cargarHoras = async () => {
      if (!cliente || !cliente.rango_horarios || !cliente.intervalo_citas) return;

      const fechaSeleccionada = new Date(fecha);
      const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const diaActual = diasSemana[fechaSeleccionada.getDay()];
      const claveNormalizada = diaActual.normalize('NFD').replace(/[̀-ͯ]/g, '');
      const claves = Object.keys(cliente.rango_horarios || {});
      const claveReal = claves.find(k => k.normalize('NFD').replace(/[̀-ͯ]/g, '') === claveNormalizada);
      const rangoDia = cliente.rango_horarios?.[claveReal];

      if (!rangoDia?.inicio || !rangoDia?.fin) return setHoras([]);

      const [inicioH, inicioM] = rangoDia.inicio.split(':').map(Number);
      const [finH, finM] = rangoDia.fin.split(':').map(Number);
      const intervalo = cliente.intervalo_citas;
      const start = inicioH * 60 + inicioM;
      const end = finH * 60 + finM;

      const horasGeneradas = [];
      for (let mins = start; mins < end; mins += intervalo) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        horasGeneradas.push(`${h}:${m}`);
      }

      const horasNoDisponiblesDia = cliente.horas_no_disponibles?.[claveReal] || [];
      const horasFiltradas = horasGeneradas.filter((hora) => !horasNoDisponiblesDia.includes(hora));
      setHoras(horasFiltradas);
    };

    cargarHoras();
  }, [cliente, fecha]);

  useEffect(() => {
    const verificarHorasOcupadas = async () => {
      if (!canchaSeleccionada || !fecha) return setHorasOcupadas([]);

      const { data, error } = await supabase
        .from('reservas_cancha')
        .select('hora')
        .eq('id_cancha', canchaSeleccionada)
        .eq('fecha', fecha);

      if (error) return console.error('Error cargando reservas:', error);
      const ocupadas = (data || []).map((res) => res.hora);
      setHorasOcupadas(ocupadas);
    };

    verificarHorasOcupadas();
  }, [canchaSeleccionada, fecha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !identificacion || !fecha || !horaSeleccionada || !canchaSeleccionada) {
      setEsError(true);
      setMensaje('Todos los campos obligatorios deben estar completos.');
      return;
    }

    if (!/^[0-9]+$/.test(identificacion)) {
      setEsError(true);
      setMensaje('❌ La identificación solo debe contener números.');
      return;
    }

    const fechaHoraReserva = new Date(`${fecha}T${horaSeleccionada}:00`);
    const ahora = new Date();

    const { data: reservasExistentes, error: errorVerificacion } = await supabase
      .from('reservas_cancha')
      .select('id, fecha, hora')
      .eq('identificacion', identificacion);

    if (errorVerificacion) {
      setEsError(true);
      setMensaje('❌ Error validando reservas anteriores.');
      return;
    }

    const yaReservado = reservasExistentes?.some((res) => {
      const resFechaHora = new Date(`${res.fecha}T${res.hora}:00`);
      return resFechaHora >= ahora;
    });

    if (yaReservado) {
      setEsError(true);
      setMensaje('❌ Ya existe una reserva activa con esta identificación.');
      return;
    }

    const { error } = await supabase.from('reservas_cancha').insert({
      nombre,
      identificacion,
      nota,
      fecha,
      hora: horaSeleccionada,
      id_cancha: canchaSeleccionada,
      id_cliente: cliente.id_cliente,
    });

    if (error) {
      setEsError(true);
      setMensaje('Error al registrar la reserva.');
      return;
    }

    setEsError(false);
    setMensaje('✅ Reserva realizada exitosamente');
    setNombre('');
    setIdentificacion('');
    setNota('');
    setHoraSeleccionada('');
    setCanchaSeleccionada('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex justify-center items-center py-8 px-4">
      <motion.div
        className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4 capitalize">
          Reserva en {cliente?.nombre || 'el negocio'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="text"
            placeholder="Identificación"
            value={identificacion}
            onChange={(e) => {
              const valor = e.target.value;
              if (/^[0-9]*$/.test(valor)) {
                setIdentificacion(valor);
              } else {
                lanzarToast('Solo se permiten números en la identificación');
              }
            }}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            placeholder="Nota (opcional)"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={3}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={canchaSeleccionada}
            onChange={(e) => setCanchaSeleccionada(e.target.value)}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecciona una cancha</option>
            {canchas.map((cancha: any) => (
              <option key={cancha.id_cancha} value={cancha.id_cancha}>
                {cancha.nombre_cancha}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Selecciona una hora:</label>
            {horas.length === 0 ? (
              <p className="text-sm text-red-500">Este negocio no tiene horarios configurados correctamente.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {horas.map((hora) => {
                  const estaOcupada = horasOcupadas.includes(hora);

                  return (
                    <div key={hora} className="relative group focus-within:z-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (estaOcupada) {
                            lanzarToast('Hora ya reservada');
                          } else {
                            setHoraSeleccionada(hora);
                          }
                        }}
                        className={`w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none ${
                          estaOcupada
                            ? 'bg-red-200 text-red-800 cursor-not-allowed'
                            : horaSeleccionada === hora
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {hora}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
          >
            Reservar cancha
          </motion.button>
        </form>

        {mensaje && (
          <div
            ref={mensajeRef}
            className={`mt-4 text-center font-semibold p-3 rounded-lg ${
              esError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {mensaje}
          </div>
        )}

        {mostrarToast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 animate-fade-in-out">
            {textoToast}
          </div>
        )}
      </motion.div>
    </div>
  );
}





