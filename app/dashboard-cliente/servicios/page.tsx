'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, DollarSign, Package, TrendingUp, ShoppingBag } from 'lucide-react';

export default function ServiciosPage() {
  const [mounted, setMounted] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [servicioAEliminar, setServicioAEliminar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [servicioEliminado, setServicioEliminado] = useState<string | null>(null); // 👈 NUEVO

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cargarServicios = async () => {
      const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id_cliente')
          .eq('user_id', user.id)
          .single();
        if (!clienteData) return;

      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id_cliente', user.id)
        .neq('ser_estado', 'eliminado');

      if (!error) setServicios(data || []);
      setLoading(false);
    };

    cargarServicios();
  }, []);

  const handleAgregar = async () => {
    if (!nombre.trim() || !precio.trim()) {
        setErrorCamposVisible(true);
        setTimeout(() => setErrorCamposVisible(false), 3000);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('user_id', user.id)
        .single();
      if (!clienteData) return;

    const { data, error } = await supabase
        .from('servicios')
        .insert([{
        ser_nombre: nombre.trim(),
        ser_precio: parseFloat(precio),
        ser_estado: 'activo',
        id_cliente: clienteData.id_cliente
        }])
        .select();

    if (error) {
        console.error('❌ Supabase insert error:', error.message);
        setMensajeError('❌ Error al agregar el servicio.');
        setTimeout(() => setMensajeError(''), 3000);
    } else {
        setServicios((prev) => [...prev, ...data]);
        setNombre('');
        setPrecio('');
        setMensajeVisible(true);
        setTimeout(() => setMensajeVisible(false), 3000);
    }
    };

  const iniciarEdicion = (servicio: any) => {
    setEditandoId(servicio.id_ser);
    setEditNombre(servicio.ser_nombre);
    setEditPrecio(servicio.ser_precio.toString());
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditPrecio('');
  };

  const guardarEdicion = async () => {
    if (!editandoId || !editNombre.trim() || !editPrecio.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    const { data, error } = await supabase
      .from('servicios')
      .update({
        ser_nombre: editNombre.trim(),
        ser_precio: parseFloat(editPrecio),
      })
      .eq('id_ser', editandoId)
      .select();

    if (error) {
      setMensajeError('❌ Error al guardar los cambios.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setServicios((prev) =>
        prev.map((s) => (s.id_ser === editandoId ? data[0] : s))
      );
      cancelarEdicion();
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const eliminarServicio = (id: string) => {
    setServicioAEliminar(id);
    setConfirmacionVisible(true);
  };

  // 👈 FUNCIÓN ACTUALIZADA CON EL MENSAJE DE ÉXITO
  const confirmarEliminacion = async () => {
    if (!servicioAEliminar) return;

    const { error } = await supabase
      .from('servicios')
      .update({ ser_estado: 'eliminado' })
      .eq('id_ser', servicioAEliminar);

    if (!error) {
      // Primero mostrar mensaje de éxito en la tarjeta
      setServicioEliminado(servicioAEliminar);
      setConfirmacionVisible(false);
      
      // Después de 2 segundos, remover completamente el servicio
      setTimeout(() => {
        setServicios((prev) =>
          prev.filter((s) => s.id_ser !== servicioAEliminar)
        );
        setServicioEliminado(null);
        setServicioAEliminar(null);
      }, 2000);
    } else {
      setConfirmacionVisible(false);
      setServicioAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setConfirmacionVisible(false);
    setServicioAEliminar(null);
  };

  // Calcular estadísticas
  const totalServicios = servicios.length;
  const precioPromedio = totalServicios > 0 
    ? servicios.reduce((sum, s) => sum + s.ser_precio, 0) / totalServicios 
    : 0;
  const servicioMasCaro = totalServicios > 0 
    ? Math.max(...servicios.map(s => s.ser_precio))
    : 0;

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
        Servicios
      </h1>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Servicios</p>
              <p className="text-2xl font-bold">{totalServicios}</p>
            </div>
            <Package className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Precio Promedio</p>
              <p className="text-2xl font-bold">${precioPromedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            </div>
            <TrendingUp className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Servicio Más Caro</p>
              <p className="text-2xl font-bold">${servicioMasCaro.toLocaleString('es-CO')}</p>
            </div>
            <DollarSign className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {mensajeVisible && (
          <motion.div
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-green-700 text-lg font-medium">✅ Servicio agregado correctamente.</p>
          </motion.div>
        )}
        {errorCamposVisible && (
          <motion.div
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-red-700 text-sm">❌ Todos los campos son obligatorios.</p>
          </motion.div>
        )}
        {mensajeError && (
          <motion.div
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-red-700 text-sm">{mensajeError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario de agregar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nombre del servicio:</label>
            <div className="relative">
              <Package className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Corte de cabello"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Precio del servicio:</label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="number"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Sin punto ni comas. Ej: 20000"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAgregar}
          className="w-full py-3 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Agregar servicio
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando servicios...</p>
        </div>
      ) : servicios.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <ShoppingBag className="mx-auto mb-4 text-gray-400" size={48} />
          <p>No hay servicios registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {servicios.map((s) => (
            <motion.div 
              key={s.id_ser} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 👈 NUEVO: MENSAJE DE ÉXITO */}
              {servicioEliminado === s.id_ser ? (
                <motion.div 
                  className="p-6 bg-green-50 border-t-4 border-green-400"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-800 font-medium text-lg">Servicio eliminado con éxito</p>
                  </div>
                </motion.div>
              ) : servicioAEliminar === s.id_ser ? (
                <div className="p-6 bg-yellow-50 border-t-4 border-yellow-400">
                  <div className="text-center">
                    <p className="mb-4 text-yellow-800 font-medium">⚠️ ¿Estás seguro de eliminar este servicio?</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={confirmarEliminacion} 
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
                      >
                        Eliminar
                      </button>
                      <button 
                        onClick={cancelarEliminacion} 
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : editandoId === s.id_ser ? (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Nombre:</label>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Nombre del servicio"
                        className="p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Precio:</label>
                      <input
                        type="number"
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(e.target.value)}
                        placeholder="Precio del servicio"
                        className="p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={guardarEdicion}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                        <Package className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{s.ser_nombre}</h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                          <DollarSign size={14} />
                          <span>${s.ser_precio.toLocaleString('es-CO')}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                          {s.ser_estado}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => iniciarEdicion(s)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => eliminarServicio(s.id_ser)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
