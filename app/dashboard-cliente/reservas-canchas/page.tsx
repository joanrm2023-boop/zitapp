'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function ReservasCanchaPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: canchasData } = await supabase
        .from('canchas')
        .select('id_cancha, nombre_cancha')
        .eq('id_cliente', user.id);

      const { data: reservasData } = await supabase
        .from('reservas_cancha')
        .select('*')
        .eq('id_cliente', user.id);

      setCanchas(canchasData || []);
      setReservas(reservasData || []);
      setLoading(false);
    };

    obtenerDatos();
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">Reservas de Canchas</h1>

      {loading ? (
        <p className="text-center">Cargando reservas...</p>
      ) : (
        <div className="space-y-6">
          {canchas.length === 0 ? (
            <p className="text-center text-gray-600">No hay canchas registradas.</p>
          ) : (
            canchas.map((cancha) => {
              const reservasDeCancha = reservas.filter(
                (r) => r.id_cancha === cancha.id_cancha
              );

              return (
                <div key={cancha.id_cancha} className="bg-white shadow rounded-lg p-4 border">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {cancha.nombre_cancha}
                  </h2>
                  {reservasDeCancha.length === 0 ? (
                    <p className="text-gray-600 text-sm">No hay reservas para esta cancha.</p>
                  ) : (
                    <div className="space-y-2">
                      {reservasDeCancha.map((reserva) => (
                        <div
                          key={reserva.id}
                          className="border p-3 rounded bg-gray-50 text-sm text-gray-700"
                        >
                          <p>
                            <strong>{reserva.nombre}</strong> - {reserva.identificacion}
                          </p>
                          <p>
                            Fecha: {reserva.fecha} | Hora: {reserva.hora}
                          </p>
                          {reserva.nota && <p>Nota: {reserva.nota}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </motion.div>
  );
}



