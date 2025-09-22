'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, User, UserPlus, Mail, TrendingUp, Users } from 'lucide-react';

export default function ProfesionalesPage() {
  const [mounted, setMounted] = useState(false);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [profesionalAEliminar, setProfesionalAEliminar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [planCliente, setPlanCliente] = useState<string>('');
  const [limitePlan, setLimitePlan] = useState<number>(0);
  const [profesionalEliminado, setProfesionalEliminado] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState<string>(''); // Nueva optimización

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cargarProfesionales = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener y almacenar datos del cliente una sola vez
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, plan')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) {
        setLoading(false);
        return;
      }

      // Almacenar para reutilizar
      setIdCliente(clienteData.id_cliente);
      setPlanCliente(clienteData.plan);
      
      const limite = clienteData.plan === 'basico' ? 1 : 
                    clienteData.plan === 'pro' ? 4 : 
                    999;
      setLimitePlan(limite);

      const { data, error } = await supabase
        .from('barberos')
        .select('*')
        .eq('id_cliente', clienteData.id_cliente)
        .eq('activo', true)
        .neq('estado', 'eliminado');

      if (!error) setProfesionales(data || []);
      setLoading(false);
    };

    cargarProfesionales();
  }, []);

  // Funciones de validación optimizadas
  const validarNombre = (valor: string) => {
    const nombreRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    const palabras = valor.trim().split(/\s+/);

    if (!nombreRegex.test(valor.trim())) {
      setMensajeError('El nombre solo puede contener letras y espacios.');
      return false;
    }

    if (palabras.length < 2) {
      setMensajeError('Por favor ingresa nombre y apellido (al menos dos palabras).');
      return false;
    }

    setMensajeError('');
    return true;
  };

  const validarCorreo = (valor: string) => {
    const correoRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com)$/;
    if (!correoRegex.test(valor.trim())) {
      setMensajeError(
        'Por favor ingresa un correo válido con dominio permitido o revisa si esta bien escrito (@gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com).'
      );
      return false;
    }

    setMensajeError('');
    return true;
  };

  const handleAgregar = async () => {
    // Validación de campos vacíos
    if (!nombre.trim() || !correo.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    // Usar funciones de validación existentes (elimina duplicación)
    if (!validarNombre(nombre) || !validarCorreo(correo)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    // Validar límite según el plan
    if (profesionales.length >= limitePlan) {
      const mensajeLimite = planCliente === 'basico' 
        ? 'El plan Básico permite máximo 1 profesional. Actualiza tu plan para agregar más.'
        : `El plan Pro permite máximo ${limitePlan} profesionales. Actualiza tu plan para agregar más.`;
      
      setMensajeError(mensajeLimite);
      setTimeout(() => setMensajeError(''), 5000);
      return;
    }

    // Usar idCliente almacenado (elimina consulta redundante)
    if (!idCliente) {
      setMensajeError('Error al obtener información del cliente.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    const { data, error } = await supabase
      .from('barberos')
      .insert([{
        nombre_barbero: nombre.trim(),
        correo_barbero: correo.trim(),
        activo: true,
        id_cliente: idCliente
      }])
      .select();

    if (error) {
      console.error('Error al agregar profesional:', error.message);
      setMensajeError('Error al agregar el profesional.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setProfesionales((prev) => [...prev, ...data]);
      setNombre('');
      setCorreo('');
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const iniciarEdicion = (profesional: any) => {
    setEditandoId(profesional.id_barbero);
    setEditNombre(profesional.nombre_barbero);
    setEditCorreo(profesional.correo_barbero);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditCorreo('');
  };

  const guardarEdicion = async () => {
    // Validación de campos vacíos
    if (!editandoId || !editNombre.trim() || !editCorreo.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    // Usar funciones de validación consistentes (mejora agregada)
    if (!validarNombre(editNombre) || !validarCorreo(editCorreo)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    const { data, error } = await supabase
      .from('barberos')
      .update({
        nombre_barbero: editNombre.trim(),
        correo_barbero: editCorreo.trim(),
      })
      .eq('id_barbero', editandoId)
      .select();

    if (error) {
      setMensajeError('Error al guardar los cambios.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setProfesionales((prev) =>
        prev.map((p) => (p.id_barbero === editandoId ? data[0] : p))
      );
      cancelarEdicion();
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const eliminarProfesional = (id: string) => {
    setProfesionalAEliminar(id);
    setConfirmacionVisible(true);
  };

  const confirmarEliminacion = async () => {
    if (!profesionalAEliminar) return;

    const { error } = await supabase
      .from('barberos')
      .update({ estado: 'eliminado' })
      .eq('id_barbero', profesionalAEliminar);

    if (!error) {
      setProfesionalEliminado(profesionalAEliminar);
      setConfirmacionVisible(false);
      
      setTimeout(() => {
        setProfesionales((prev) =>
          prev.filter((p) => p.id_barbero !== profesionalAEliminar)
        );
        setProfesionalEliminado(null);
        setProfesionalAEliminar(null);
      }, 2000);
    } else {
      setConfirmacionVisible(false);
      setProfesionalAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setConfirmacionVisible(false);
    setProfesionalAEliminar(null);
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
        Profesionales
      </h1>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Profesionales</p>
              <p className="text-2xl font-bold">{profesionales.length}</p>
            </div>
            <Users className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Plan Actual</p>
              <p className="text-2xl font-bold capitalize">{planCliente}</p>
            </div>
            <TrendingUp className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Límite del Plan</p>
              <p className="text-2xl font-bold">
                {limitePlan === 999 ? 'Ilimitado' : `${profesionales.length}/${limitePlan}`}
              </p>
            </div>
            <UserPlus className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {errorCamposVisible && (
          <motion.div
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-red-700 text-sm">Todos los campos son obligatorios.</p>
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
        {mensajeVisible && (
          <motion.div
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-green-700 text-lg font-medium">✅ Operación realizada correctamente.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario de agregar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nombre del profesional:</label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (e.target.value.trim()) validarNombre(e.target.value);
                }}
                placeholder="Nombre y apellido (ej: Juan Pérez)"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Correo del profesional:</label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (e.target.value.trim()) validarCorreo(e.target.value);
                }}
                placeholder="ejemplo@gmail.com"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Información del plan y límite */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-800">
              <strong>Plan actual:</strong> {planCliente.charAt(0).toUpperCase() + planCliente.slice(1)}
            </span>
            <span className="text-blue-600">
              {limitePlan === 999 
                ? `${profesionales.length} profesionales (Ilimitado)`
                : `${profesionales.length}/${limitePlan} profesionales`
              }
            </span>
          </div>
          {limitePlan !== 999 && profesionales.length >= limitePlan && (
            <p className="text-orange-600 text-xs mt-1">
              Has alcanzado el límite de tu plan. Actualiza para agregar más profesionales.
            </p>
          )}
        </div>

        <button
          onClick={handleAgregar}
          disabled={profesionales.length >= limitePlan && limitePlan !== 999}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            profesionales.length >= limitePlan && limitePlan !== 999
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {profesionales.length >= limitePlan && limitePlan !== 999 
            ? `Límite alcanzado (${limitePlan} máximo)`
            : 'Agregar profesional'
          }
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando profesionales...</p>
        </div>
      ) : profesionales.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <p>No hay profesionales registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profesionales.map((p) => (
            <motion.div 
              key={p.id_barbero} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {editandoId === p.id_barbero ? (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Nombre:</label>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Nombre del profesional"
                        className="p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Correo:</label>
                      <input
                        type="email"
                        value={editCorreo}
                        onChange={(e) => setEditCorreo(e.target.value)}
                        placeholder="Correo del profesional"
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
              ) : profesionalEliminado === p.id_barbero ? (
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
                    <p className="text-green-800 font-medium text-lg">Profesional eliminado con éxito</p>
                    <p className="text-green-600 text-sm mt-1">La tarjeta se eliminará en un momento...</p>
                  </div>
                </motion.div>
              ) : profesionalAEliminar === p.id_barbero ? (
                <div className="p-6 bg-yellow-50 border-t-4 border-yellow-400">
                  <div className="text-center">
                    <p className="mb-4 text-yellow-800 font-medium">¿Estás seguro de eliminar este profesional?</p>
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
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{p.nombre_barbero}</h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                          <Mail size={14} />
                          <span>{p.correo_barbero}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {p.estado || 'Activo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button 
                        onClick={() => iniciarEdicion(p)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors min-w-[44px] min-h-[44px]" 
                        title="Editar profesional"
                      >
                        <Pencil size={18} />
                        <span className="text-sm"> </span>
                      </button>
                      <button 
                        onClick={() => eliminarProfesional(p.id_barbero)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors min-w-[44px] min-h-[44px]" 
                        title="Eliminar profesional"
                      >
                        <Trash2 size={18} />
                        <span className="text-sm"></span>
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