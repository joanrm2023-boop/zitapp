'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, MapPin, FileText, TrendingUp, Users, Grid3x3 } from 'lucide-react';

export default function CanchasPage() {
  const [mounted, setMounted] = useState(false);
  const [canchas, setCanchas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [planCliente, setPlanCliente] = useState<string>('');
  const [limitePlan, setLimitePlan] = useState<number>(0);
  const [idCliente, setIdCliente] = useState<string>('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [editImagenUrl, setEditImagenUrl] = useState('');
  const [editImagenFile, setEditImagenFile] = useState<File | null>(null);
  const [precio, setPrecio] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
 

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cargarCanchas = async () => {
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
      
      // Límites según plan: Básico = 1, Pro = 4, Premium = 10
      const limite = clienteData.plan === 'basico' ? 1 : 
                    clienteData.plan === 'pro' ? 4 : 
                    10;
      setLimitePlan(limite);

      const { data, error } = await supabase
        .from('canchas')
        .select('*')
        .eq('id_cliente', clienteData.id_cliente);

      if (!error) setCanchas(data || []);
      setLoading(false);
    };

    cargarCanchas();
  }, []);

  // Funciones de validación
  const validarNombre = (valor: string) => {
    if (!valor.trim()) {
      setMensajeError('El nombre de la cancha es obligatorio.');
      return false;
    }
    if (valor.trim().length < 3) {
      setMensajeError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }
    setMensajeError('');
    return true;
  };

  const validarDescripcion = (valor: string) => {
    if (!valor.trim()) {
      setMensajeError('La descripción es obligatoria.');
      return false;
    }
    if (valor.trim().length < 10) {
      setMensajeError('La descripción debe tener al menos 10 caracteres.');
      return false;
    }
    if (valor.trim().length > 200) {
      setMensajeError('La descripción no puede exceder 200 caracteres.');
      return false;
    }
    setMensajeError('');
    return true;
  };

  const validarPrecio = (valor: string) => {
    if (!valor.trim()) {
      setMensajeError('El precio es obligatorio.');
      return false;
    }
    const precioNum = parseFloat(valor);
    if (isNaN(precioNum) || precioNum <= 0) {
      setMensajeError('El precio debe ser un número mayor a 0.');
      return false;
    }
    if (precioNum > 10000000) {
      setMensajeError('El precio no puede exceder $10,000,000.');
      return false;
    }
    setMensajeError('');
    return true;
  };

  const handleAgregar = async () => {
    // Validación de campos vacíos
    if (!nombre.trim() || !descripcion.trim() || !precio.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    // Usar funciones de validación
    if (!validarNombre(nombre) || !validarDescripcion(descripcion) || !validarPrecio(precio)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    // Validar límite según el plan
    if (canchas.length >= limitePlan) {
      const mensajeLimite = planCliente === 'basico' 
        ? 'El plan Básico permite máximo 1 cancha. Actualiza tu plan para agregar más.'
        : planCliente === 'pro'
        ? 'El plan Pro permite máximo 4 canchas. Actualiza tu plan para agregar más.'
        : 'El plan Premium permite máximo 10 canchas. Actualiza tu plan para agregar más.';
      
      setMensajeError(mensajeLimite);
      setTimeout(() => setMensajeError(''), 5000);
      return;
    }

    // Usar idCliente almacenado
    if (!idCliente) {
      setMensajeError('Error al obtener información del cliente.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    setSubiendoImagen(true);
    let imagenUrl = null;

    // 🆕 Subir imagen si existe
    if (imagenFile) {
      try {
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${idCliente}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('canchas-imagenes')
          .upload(fileName, imagenFile);

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          setMensajeError('Error al subir la imagen.');
          setTimeout(() => setMensajeError(''), 3000);
          setSubiendoImagen(false);
          return;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('canchas-imagenes')
          .getPublicUrl(fileName);

        imagenUrl = urlData.publicUrl;
      } catch (err) {
        console.error('Error procesando imagen:', err);
        setMensajeError('Error al procesar la imagen.');
        setTimeout(() => setMensajeError(''), 3000);
        setSubiendoImagen(false);
        return;
      }
    }

    const { data, error } = await supabase
    .from('canchas')
    .insert([{
      nombre_cancha: nombre.trim(),
      descripcion_cancha: descripcion.trim(),
      imagen_url: imagenUrl,
      precio_hora: parseFloat(precio), // ✅ NUEVO
      activo: true,
      id_cliente: idCliente
    }])
    .select();

    setSubiendoImagen(false);

    if (error) {
      console.error('Error al agregar cancha:', error.message);
      setMensajeError('Error al agregar la cancha.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setCanchas((prev) => [...prev, ...data]);
      setNombre('');
      setDescripcion('');
      setPrecio('');  
      setImagenFile(null);
      // Limpiar el input de archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const iniciarEdicion = (cancha: any) => {
    setEditandoId(cancha.id_cancha);
    setEditNombre(cancha.nombre_cancha);
    setEditDescripcion(cancha.descripcion_cancha || '');
    setEditPrecio(cancha.precio_hora?.toString() || '');  
    setEditImagenUrl(cancha.imagen_url || '');
    setEditImagenFile(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditDescripcion('');
    setEditPrecio(''); // ✅ NUEVO
    setEditImagenUrl('');
    setEditImagenFile(null);
  };

  const guardarEdicion = async () => {
    // Validación de campos vacíos
    if (!editandoId || !editNombre.trim() || !editDescripcion.trim() || !editPrecio.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }

    // Usar funciones de validación
    if (!validarNombre(editNombre) || !validarDescripcion(editDescripcion) || !validarPrecio(editPrecio)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    setSubiendoImagen(true);
    let nuevaImagenUrl = editImagenUrl; // Mantener URL actual por defecto

    // 🆕 Si hay nueva imagen, subirla
    if (editImagenFile) {
      try {
        const fileExt = editImagenFile.name.split('.').pop();
        const fileName = `${idCliente}/${Date.now()}.${fileExt}`;

        // Subir nueva imagen
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('canchas-imagenes')
          .upload(fileName, editImagenFile);

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          setMensajeError('Error al subir la nueva imagen.');
          setTimeout(() => setMensajeError(''), 3000);
          setSubiendoImagen(false);
          return;
        }

        // Obtener URL pública de la nueva imagen
        const { data: urlData } = supabase.storage
          .from('canchas-imagenes')
          .getPublicUrl(fileName);

        nuevaImagenUrl = urlData.publicUrl;

        // 🗑️ Opcional: Eliminar imagen anterior si existe
        if (editImagenUrl) {
          try {
            const oldFileName = editImagenUrl.split('/canchas-imagenes/')[1];
            if (oldFileName) {
              await supabase.storage
                .from('canchas-imagenes')
                .remove([oldFileName]);
            }
          } catch (err) {
            console.log('No se pudo eliminar imagen anterior:', err);
          }
        }
      } catch (err) {
        console.error('Error procesando imagen:', err);
        setMensajeError('Error al procesar la imagen.');
        setTimeout(() => setMensajeError(''), 3000);
        setSubiendoImagen(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('canchas')
      .update({
        nombre_cancha: editNombre.trim(),
        descripcion_cancha: editDescripcion.trim(),
        precio_hora: parseFloat(editPrecio), // ✅ NUEVO
        imagen_url: nuevaImagenUrl,
      })
      .eq('id_cancha', editandoId)
      .select();

    setSubiendoImagen(false);

    if (error) {
      setMensajeError('Error al guardar los cambios.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setCanchas((prev) =>
        prev.map((c) => (c.id_cancha === editandoId ? data[0] : c))
      );
      cancelarEdicion();
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const cambiarEstado = async (cancha: any) => {
    const { data, error } = await supabase
      .from('canchas')
      .update({ activo: !cancha.activo })
      .eq('id_cancha', cancha.id_cancha)
      .select();

    if (error) {
      setMensajeError('Error al cambiar estado.');
      setTimeout(() => setMensajeError(''), 3000);
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
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
        Canchas
      </h1>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Canchas</p>
              <p className="text-2xl font-bold">{canchas.length}</p>
            </div>
            <Grid3x3 className="text-white opacity-80" size={24} />
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
              <p className="text-2xl font-bold">{canchas.length}/{limitePlan}</p>
            </div>
            <Users className="text-white opacity-80" size={24} />
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
            <label className="text-sm font-medium text-gray-700">Nombre de la cancha:</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (e.target.value.trim()) validarNombre(e.target.value);
                }}
                placeholder="Ej: Cancha Principal"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>
          {/* 🆕 NUEVO CAMPO DE IMAGEN */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Imagen de la cancha (opcional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validar tamaño (máximo 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setMensajeError('La imagen no puede superar 5MB');
                      setTimeout(() => setMensajeError(''), 3000);
                      return;
                    }
                    setImagenFile(file);
                  }
                }}
                className="pl-2 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagenFile && (
                <p className="text-xs text-green-600">✅ Imagen seleccionada: {imagenFile.name}</p>
              )}
            </div>

            
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Descripción:</label>
            <div className="relative">
              <FileText className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
              <input
                type="text"
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (e.target.value.trim()) validarDescripcion(e.target.value);
                }}
                placeholder="Ej: Primer piso, cancha techada"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
            <p className="text-xs text-gray-500">{descripcion.length}/200 caracteres</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Precio por hora:</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-semibold z-10">$</span>
              <input
                type="number"
                value={precio}
                onChange={(e) => {
                  setPrecio(e.target.value);
                  if (e.target.value.trim()) validarPrecio(e.target.value);
                }}
                placeholder="Ej: 50000"
                min="0"
                step="1000"
                className="pl-6 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
            <p className="text-xs text-gray-500">Precio que se cobrará por hora de uso</p>
          </div>
        </div>

        {/* Información del plan y límite */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-800">
              <strong>Plan actual:</strong> {planCliente.charAt(0).toUpperCase() + planCliente.slice(1)}
            </span>
            <span className="text-blue-600">
              {canchas.length}/{limitePlan} canchas
            </span>
          </div>
          {canchas.length >= limitePlan && (
            <p className="text-orange-600 text-xs mt-1">
              Has alcanzado el límite de tu plan. Actualiza para agregar más canchas.
            </p>
          )}
        </div>

        <button
          onClick={handleAgregar}
          disabled={canchas.length >= limitePlan || subiendoImagen}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            canchas.length >= limitePlan || subiendoImagen
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {subiendoImagen 
            ? '⏳ Subiendo imagen...'
            : canchas.length >= limitePlan 
            ? `Límite alcanzado (${limitePlan} máximo)`
            : 'Agregar cancha'
          }
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando canchas...</p>
        </div>
      ) : canchas.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <Grid3x3 className="mx-auto mb-4 text-gray-400" size={48} />
          <p>No hay canchas registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {canchas.map((c) => (
            <motion.div 
              key={c.id_cancha} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {editandoId === c.id_cancha ? (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Nombre:</label>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Nombre de la cancha"
                        className="p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Descripción:</label>
                      <input
                        type="text"
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                        placeholder="Descripción de la cancha"
                        className="p-2 border border-gray-300 rounded-md text-gray-800"
                      />
                      <p className="text-xs text-gray-500">{editDescripcion.length}/200 caracteres</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Precio por hora:</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                        <input
                          type="number"
                          value={editPrecio}
                          onChange={(e) => setEditPrecio(e.target.value)}
                          placeholder="Precio por hora"
                          min="0"
                          step="1000"
                          className="pl-6 p-2 border border-gray-300 rounded-md text-gray-800 w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Cambiar imagen de la cancha:</label>
                      
                      {/* Mostrar imagen actual si existe */}
                      {editImagenUrl && !editImagenFile && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-600 mb-1">Imagen actual:</p>
                          <img 
                            src={editImagenUrl} 
                            alt="Imagen actual"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                          />
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setMensajeError('La imagen no puede superar 5MB');
                              setTimeout(() => setMensajeError(''), 3000);
                              return;
                            }
                            setEditImagenFile(file);
                          }
                        }}
                        className="p-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {editImagenFile && (
                        <p className="text-xs text-green-600">✅ Nueva imagen seleccionada: {editImagenFile.name}</p>
                      )}
                      <p className="text-xs text-gray-500">Si no seleccionas una nueva imagen, se mantendrá la actual.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={guardarEdicion}
                      disabled={subiendoImagen}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        subiendoImagen
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {subiendoImagen ? '⏳ Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      disabled={subiendoImagen}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {c.imagen_url ? (
                          <img 
                            src={c.imagen_url} 
                            alt={c.nombre_cancha}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-blue-500"
                          />
                        ) : (
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                            <MapPin className="text-white" size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{c.nombre_cancha}</h3>
                        <div className="flex items-center gap-1 text-green-600 text-sm mt-2 font-semibold">
                          <span>💰</span>
                          <span>${c.precio_hora?.toLocaleString('es-CO') || '0'} / hora</span>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                          c.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {c.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-4">
                      <button 
                        onClick={() => iniciarEdicion(c)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors min-w-[44px] min-h-[44px]" 
                        title="Editar cancha"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => cambiarEstado(c)} 
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors min-w-[44px] min-h-[44px] ${
                          c.activo 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={c.activo ? 'Desactivar cancha' : 'Activar cancha'}
                      >
                        <span className="text-xl">{c.activo ? '⛔' : '✅'}</span>
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

