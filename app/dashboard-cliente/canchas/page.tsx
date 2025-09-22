'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';

export default function CanchasPage() {
  const [mounted, setMounted] = useState(false);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [canchaAEliminar, setCanchaAEliminar] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const obtenerCanchas = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('canchas')
        .select('*')
        .eq('id_cliente', user.id);

      if (error) {
        console.error('Error al obtener canchas:', error.message);
      } else {
        setCanchas(data || []);
      }

      setLoading(false);
    };

    obtenerCanchas();
  }, []);

  const handleAgregar = async () => {
    if (!nombre.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('canchas')
      .insert([{ 
        nombre_cancha: nombre, 
        id_cliente: user.id, 
        activo: true 
      }])
      .select();

    if (error) {
      alert('Error al agregar cancha: ' + error.message);
    } else if (data) {
      setCanchas((prev) => [...prev, ...data]);
      setNombre('');
      setMensajeVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const iniciarEdicion = (cancha: any) => {
    setEditandoId(cancha.id_cancha);
    setEditNombre(cancha.nombre_cancha);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;

    const { data, error } = await supabase
      .from('canchas')
      .update({ nombre_cancha: editNombre })
      .eq('id_cancha', editandoId)
      .select();

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else if (data) {
      setCanchas((prev) =>
        prev.map((c) => (c.id_cancha === editandoId ? data[0] : c))
      );
      cancelarEdicion();
      setMensajeVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const eliminarCancha = async (id: string) => {
    setCanchaAEliminar(id);
    setConfirmacionVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarEliminacion = async () => {
    if (!canchaAEliminar) return;

    const { error } = await supabase
      .from('canchas')
      .delete()
      .eq('id_cancha', canchaAEliminar);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setCanchas((prev) => prev.filter((c) => c.id_cancha !== canchaAEliminar));
    }

    setConfirmacionVisible(false);
    setCanchaAEliminar(null);
  };

  const cancelarEliminacion = () => {
    setConfirmacionVisible(false);
    setCanchaAEliminar(null);
  };

  const cambiarEstado = async (cancha: any) => {
    const { data, error } = await supabase
      .from('canchas')
      .update({ activo: !cancha.activo })
      .eq('id_cancha', cancha.id_cancha)
      .select();

    if (error) {
      alert('Error al cambiar estado: ' + error.message);
    } else if (data) {
      setCanchas((prev) =>
        prev.map((c) => (c.id_cancha === cancha.id_cancha ? data[0] : c))
      );
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">Canchas</h1>

      <AnimatePresence>
        {mensajeVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-green-500 text-white border border-green-700 rounded-xl p-4 mb-6 shadow-lg text-center text-lg font-semibold"
          >
            ✅ Cambios guardados correctamente.
          </motion.div>
        )}
        {errorCamposVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-red-500 text-white border border-red-700 rounded-xl p-4 mb-6 shadow-lg text-center text-lg font-semibold"
          >
            ❌ El nombre de la cancha es obligatorio.
          </motion.div>
        )}
        {confirmacionVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-yellow-400 text-black border border-yellow-600 rounded-xl p-4 mb-6 shadow-lg text-center text-lg font-semibold"
          >
            <p className="mb-2">⚠️ ¿Estás seguro de que deseas eliminar esta cancha?</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmarEliminacion} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Eliminar</button>
              <button onClick={cancelarEliminacion} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Cancelar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700">Nombre de la cancha</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 rounded border text-gray-800"
        />
        <button
          onClick={handleAgregar}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold mt-4"
        >
          Agregar cancha
        </button>
      </div>

      {loading ? (
        <p className="text-center">Cargando canchas...</p>
      ) : (
        <div className="grid gap-4">
          {canchas.length === 0 ? (
            <p className="text-center text-gray-600">No hay canchas registradas aún.</p>
          ) : (
            canchas.map((cancha) => (
              <div
                key={cancha.id_cancha}
                className="p-4 bg-white border rounded-lg shadow-sm"
              >
                {editandoId === cancha.id_cancha ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full p-2 rounded border text-gray-800"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={guardarEdicion}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{cancha.nombre_cancha}</p>
                      <p className={`text-sm font-medium ${cancha.activo ? 'text-green-600' : 'text-red-600'}`}>
                        {cancha.activo ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => iniciarEdicion(cancha)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => cambiarEstado(cancha)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        {cancha.activo ? '⛔' : '✅'}
                      </button>
                      <button
                        onClick={() => eliminarCancha(cancha.id_cancha)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}

