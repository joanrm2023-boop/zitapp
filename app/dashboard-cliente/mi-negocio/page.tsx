'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock, Eye, EyeOff, Calendar, Settings, Store, Link2, Copy, Globe, TrendingUp, CreditCard, Upload } from 'lucide-react';
import toast from "react-hot-toast";

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function MiNegocioPage() {
  const [mounted, setMounted] = useState(false);
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rangoInicio, setRangoInicio] = useState('10:00');
  const [rangoFin, setRangoFin] = useState('20:00');
  const [intervalo, setIntervalo] = useState(45);
  const [diasNoDisponibles, setDiasNoDisponibles] = useState<string[]>([]);
  const [horasNoDisponibles, setHorasNoDisponibles] = useState<Record<string, string[]>>({});
  const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>({});
  const [bloques, setBloques] = useState<Record<string, string[]>>({});
  const [intervaloInvalido, setIntervaloInvalido] = useState(false);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  // Estados para el modal de cambio de contraseña
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false);

  // Estados para modal de conflicto de horarios
  const [modalConflicto, setModalConflicto] = useState<{
    visible: boolean;
    citas: any[];
  }>({ visible: false, citas: [] });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    generarBloques();
    const abiertos: Record<string, boolean> = {};
    for (const dia of diasSemana) {
      if (horasNoDisponibles[dia]?.length > 0) abiertos[dia] = true;
    }
    setDiasAbiertos(abiertos);
  }, [rangoInicio, rangoFin, intervalo, diasNoDisponibles]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCliente(data);
        setNombre(data.nombre);
        setCorreo(data.correo);

        const diasConHorario = Object.keys(data.rango_horarios || {});
        const primerDia = diasConHorario[0];
        const horario = data.rango_horarios?.[primerDia] || { inicio: '10:00', fin: '20:00' };

        setRangoInicio(horario.inicio);
        setRangoFin(horario.fin);
        setIntervalo(data.intervalo_citas || 45);
        setDiasNoDisponibles(data.dias_no_disponibles || []);
        setHorasNoDisponibles(data.horas_no_disponibles || {});
      }

      setLoading(false);
    };

    obtenerDatos();
  }, []);

  const subirLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !cliente) return;

    // Validaciones
    if (file.size > 1024 * 1024) { // 1MB
      toast.error("El archivo es muy grande. Máximo 1MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten archivos de imagen.");
      return;
    }

    setSubiendoLogo(true);
    
    try {
      // Eliminar logo anterior si existe
      if (cliente.logo_url) {
        const nombreAnterior = cliente.logo_url.split('/').pop();
        await supabase.storage
          .from('logos')
          .remove([nombreAnterior]);
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${cliente.id_cliente}-${Date.now()}.${fileExt}`;
      
      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;

      // Actualizar la base de datos con la nueva URL
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ logo_url: logoUrl })
        .eq('id_cliente', cliente.id_cliente);

      if (updateError) {
        throw updateError;
      }

      // Actualizar el estado local
      setCliente(prev => ({ ...prev, logo_url: logoUrl }));
      
      toast.success("✅ Logo subido correctamente");
      
    } catch (error) {
      console.error('Error subiendo logo:', error);
      toast.error("Error al subir el logo: " + error.message);
    } finally {
      setSubiendoLogo(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  const generarBloques = () => {
    const start = convertirAHoras(rangoInicio);
    const end = convertirAHoras(rangoFin);

    if (!intervalo || intervalo < 5 || isNaN(intervalo)) {
      setIntervaloInvalido(true);
      return;
    }

    setIntervaloInvalido(false);

    let bloquesGenerados: Record<string, string[]> = {};

    diasSemana.forEach((dia) => {
      if (diasNoDisponibles.includes(dia)) return;

      let actual = start;
      let bloquesDia: string[] = [];
      while (actual < end) {
        bloquesDia.push(convertirATexto(actual));
        actual += intervalo;
      }
      bloquesGenerados[dia] = bloquesDia;
    });

    setBloques(bloquesGenerados);
  };

  const convertirAHoras = (str: string) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  };

  const convertirATexto = (mins: number) => {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const toggleDia = (dia: string) => {
    setDiasAbiertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  };

  const toggleHora = (dia: string, hora: string) => {
    setHorasNoDisponibles((prev) => {
      const actuales = prev[dia] || [];
      const nuevas = actuales.includes(hora)
        ? actuales.filter((h) => h !== hora)
        : [...actuales, hora];

      setDiasAbiertos((prevAbiertos) => ({
        ...prevAbiertos,
        [dia]: nuevas.length > 0,
      }));

      return { ...prev, [dia]: nuevas };
    });
  };

  const verificarConflictosHorario = async () => {
    if (!cliente) return { hayConflicto: false, citasAfectadas: [] };

    const { data: clienteActual } = await supabase
      .from('clientes')
      .select('dias_no_disponibles, horas_no_disponibles')
      .eq('id_cliente', cliente.id_cliente)
      .single();

    console.log('🔍 Datos actuales en BD:', clienteActual);
    console.log('🔍 Días NO disponibles (nuevo):', diasNoDisponibles);
    console.log('🔍 Horas NO disponibles (nuevo):', horasNoDisponibles);

    const hoy = new Date().toISOString().split('T')[0];
    
    const { data: reservasPendientes, error } = await supabase
      .from('reservas')
      .select('id, nombre, apellido, telefono, fecha, hora, id_barbero')
      .eq('id_cliente', cliente.id_cliente)
      .eq('estado', 'pendiente')
      .gte('fecha', hoy);

    console.log('📅 Reservas pendientes encontradas:', reservasPendientes);

    if (error) {
      console.error('Error consultando reservas:', error);
      return { hayConflicto: false, citasAfectadas: [] };
    }

    const diasNoDisponiblesActuales = clienteActual.dias_no_disponibles || [];
    const horasNoDisponiblesActuales = clienteActual.horas_no_disponibles || {};

    const citasAfectadas: any[] = [];

    reservasPendientes?.forEach((reserva) => {
      const diaSemana = obtenerDiaSemana(reserva.fecha);
      
      console.log(`🔄 Procesando reserva: ${reserva.nombre} - Fecha: ${reserva.fecha} - Día: ${diaSemana}`);
      console.log(`   ¿Día estaba bloqueado? ${diasNoDisponiblesActuales.includes(diaSemana)}`);
      console.log(`   ¿Día se bloquea ahora? ${diasNoDisponibles.includes(diaSemana)}`);
      
      const diaSeBloqueoAhora = diasNoDisponibles.includes(diaSemana) && 
                                !diasNoDisponiblesActuales.includes(diaSemana);
      
      console.log(`   ✅ ¿Es conflicto de día? ${diaSeBloqueoAhora}`);
      
      if (diaSeBloqueoAhora) {
        citasAfectadas.push(reserva);
        return;
      }

      const horaEstabaBloqueada = horasNoDisponiblesActuales[diaSemana]?.includes(reserva.hora);
      const horaAhoraBloqueada = horasNoDisponibles[diaSemana]?.includes(reserva.hora);
      
      console.log(`   Hora: ${reserva.hora}`);
      console.log(`   ¿Hora estaba bloqueada? ${horaEstabaBloqueada}`);
      console.log(`   ¿Hora se bloquea ahora? ${horaAhoraBloqueada}`);
      console.log(`   ✅ ¿Es conflicto de hora? ${horaAhoraBloqueada && !horaEstabaBloqueada}`);
      
      if (horaAhoraBloqueada && !horaEstabaBloqueada) {
        citasAfectadas.push(reserva);
      }
    });

    console.log('🎯 TOTAL citas afectadas:', citasAfectadas);

    return {
      hayConflicto: citasAfectadas.length > 0,
      citasAfectadas
    };
  };

  // Función auxiliar para obtener día de la semana
  const obtenerDiaSemana = (fecha: string): string => {
    const diasMap = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const date = new Date(fecha + 'T00:00:00');
    return diasMap[date.getDay()];
  };

  const handleGuardar = async () => {
    if (!cliente) return;

    // PASO 1: Verificar conflictos ANTES de guardar
    const { hayConflicto, citasAfectadas } = await verificarConflictosHorario();
    
    if (hayConflicto) {
      // Mostrar modal de conflicto y NO continuar
      setModalConflicto({
        visible: true,
        citas: citasAfectadas
      });
      return; // IMPORTANTE: Detener la ejecución aquí
    }

    // PASO 2: Si no hay conflictos, continuar con el guardado normal
    const rangoPorDia: Record<string, { inicio: string; fin: string }> = {};
    diasSemana.forEach((dia) => {
      if (!diasNoDisponibles.includes(dia)) {
        rangoPorDia[dia] = {
          inicio: rangoInicio,
          fin: rangoFin,
        };
      }
    });

    const horasFiltradas: Record<string, string[]> = {};
    Object.entries(horasNoDisponibles).forEach(([dia, horas]) => {
      if (horas.length > 0) {
        horasFiltradas[dia] = horas;
      }
    });

    const res = await supabase
      .from('clientes')
      .update({
        rango_horarios: rangoPorDia,
        intervalo_citas: intervalo,
        dias_no_disponibles: diasNoDisponibles,
        horas_no_disponibles: horasFiltradas,
      })
      .eq('id_cliente', cliente.id_cliente);

    if (res.error) {
      toast.error('Error al guardar: ' + res.error.message);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', cliente.id_cliente)
        .maybeSingle();

      if (data) {
        const diasConHorario = Object.keys(data.rango_horarios || {});
        const primerDia = diasConHorario[0];
        const horario = data.rango_horarios?.[primerDia] || { inicio: '10:00', fin: '20:00' };

        setRangoInicio(horario.inicio);
        setRangoFin(horario.fin);
        setIntervalo(data.intervalo_citas || 45);
        setDiasNoDisponibles(data.dias_no_disponibles || []);
        setHorasNoDisponibles(data.horas_no_disponibles || {});

        const abiertos: Record<string, boolean> = {};
        for (const dia of diasSemana) {
          abiertos[dia] = false;
        }
        setDiasAbiertos(abiertos);
      }
    }
  };

  const handleCambiarContrasena = async () => {
    // Validaciones
    if (!contrasenaActual || !contrasenaNueva || !contrasenaConfirmar) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (contrasenaNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (contrasenaNueva !== contrasenaConfirmar) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (contrasenaActual === contrasenaNueva) {
      toast.error("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setCambiandoContrasena(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error("No se pudo obtener el usuario actual");
        return;
      }

      // Verificar contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: contrasenaActual,
      });

      if (signInError) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: contrasenaNueva
      });

      if (updateError) {
        toast.error("Error al cambiar la contraseña: " + updateError.message);
        return;
      }

      toast.success("✅ Contraseña actualizada correctamente");
      
      // Limpiar y cerrar modal
      setContrasenaActual('');
      setContrasenaNueva('');
      setContrasenaConfirmar('');
      setModalAbierto(false);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error inesperado al cambiar la contraseña");
    } finally {
      setCambiandoContrasena(false);
    }
  };

  // Calcular estadísticas
  const diasDisponibles = diasSemana.length - diasNoDisponibles.length;
  const horasDisponiblesPorDia = convertirAHoras(rangoFin) - convertirAHoras(rangoInicio);
  const totalHorasSemanales = diasDisponibles * (horasDisponiblesPorDia / 60);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
        Mi Negocio
      </h1>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Plan Actual</p>
              <p className="text-2xl font-bold capitalize">{cliente?.plan || 'Sin plan'}</p>
            </div>
            <TrendingUp className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Días Disponibles</p>
              <p className="text-2xl font-bold">{diasDisponibles}/7</p>
            </div>
            <Calendar className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Horas Semanales</p>
              <p className="text-2xl font-bold">{totalHorasSemanales.toFixed(0)}h</p>
            </div>
            <Clock className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando información del negocio...</p>
        </div>
      ) : (
        <>
          {/* Mensajes */}
          <AnimatePresence>
            {mensajeVisible && (
              <motion.div
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-green-700 text-lg font-medium">✅ Cambios guardados correctamente.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Información básica */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Store size={20} />
              Información del Negocio
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Nombre del negocio:</label>
                <div className="relative">
                  <Store className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
                  <input 
                    type="text" 
                    value={nombre} 
                    disabled 
                    className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Correo:</label>
                <div className="relative">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
                  <input 
                    type="email" 
                    value={correo} 
                    disabled 
                    className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Botón Cambiar Contraseña - Fuera del grid */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setModalAbierto(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Lock size={18} />
                Cambiar Contraseña
              </button>
            </div>

            {/* SECCIÓN DE LOGO ACTUALIZADA */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-sm font-medium text-gray-700">Logo del negocio (opcional):</label>
              <div className="flex flex-col gap-3">
                {/* Mostrar logo actual si existe */}
                {cliente?.logo_url && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <img 
                      src={cliente.logo_url} 
                      alt="Logo actual" 
                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Logo actual</span>
                      <p className="text-xs text-gray-500">Se muestra en tu página de reservas</p>
                    </div>
                  </div>
                )}
                
                {/* Input para subir nuevo logo */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={subirLogo}
                    disabled={subiendoLogo}
                    className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100
                              cursor-pointer border border-gray-300 rounded-lg p-2
                              disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {subiendoLogo ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  📎 Formatos: JPG, PNG, SVG • Tamaño máximo: 1MB • Recomendado: 200x200px mínimo
                </p>
                {subiendoLogo && (
                  <p className="text-sm text-blue-600 animate-pulse">
                    Subiendo logo...
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Plan y link para citas:</label>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <input
                  type="text"
                  value={cliente?.plan || "Sin plan"}
                  disabled
                  className="border border-gray-300 rounded-lg p-2 bg-gray-100 font-semibold text-blue-600 w-full md:w-auto"
                />
                {cliente?.slug && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <a
                      href={`/reservar/${cliente.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <Link2 size={16} />
                      Página
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/reservar/${cliente.slug}`
                        );
                        toast.success("✅ Link copiado");
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <Copy size={16} />
                      Copiar
                    </button>
                    <button
                      onClick={() => window.location.href = '/planes'}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <CreditCard size={16} />
                      Pagar Suscripción
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de horarios */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Horarios de Atención
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Hora de inicio:</label>
                <input 
                  type="time" 
                  value={rangoInicio} 
                  onChange={(e) => setRangoInicio(e.target.value)} 
                  className="p-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Hora de fin:</label>
                <input 
                  type="time" 
                  value={rangoFin} 
                  onChange={(e) => setRangoFin(e.target.value)} 
                  className="p-2 border border-gray-300 rounded-md text-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Intervalo entre citas (minutos):</label>
              <input
                type="number"
                value={intervalo}
                onChange={(e) => setIntervalo(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md text-gray-800"
                min={5}
              />
              {intervaloInvalido && (
                <p className="text-red-600 text-sm mt-1">El intervalo debe ser un número mayor o igual a 5 minutos.</p>
              )}
            </div>
          </div>

          {/* Días no disponibles */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Días no Disponibles
            </h2>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() =>
                    setDiasNoDisponibles((prev) =>
                      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 capitalize ${
                    diasNoDisponibles.includes(dia)
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                      : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* Horas no disponibles */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Horas no Disponibles por Día
            </h2>
            <div className="space-y-3">
              {diasSemana
                .filter((dia) => !diasNoDisponibles.includes(dia))
                .map((dia) => (
                  <div key={dia} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="capitalize font-medium text-gray-800">{dia}</span>
                      <span className="text-gray-600">{diasAbiertos[dia] ? '▲' : '▼'}</span>
                    </button>

                    {diasAbiertos[dia] && (
                      <div className="p-4 bg-white">
                        <div className="flex flex-wrap gap-2">
                          {bloques[dia]?.map((hora) => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => toggleHora(dia, hora)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 font-medium ${
                                horasNoDisponibles[dia]?.includes(hora)
                                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={handleGuardar}
            className="w-full py-3 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar cambios
          </button>
        </>
      )}

      {/* Modal de cambio de contraseña */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock size={22} />
                Cambiar Contraseña
              </h3>

              <div className="space-y-4">
                {/* Contraseña actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarActual ? "text" : "password"}
                      value={contrasenaActual}
                      onChange={(e) => setContrasenaActual(e.target.value)}
                      className="w-full p-2 pr-10 border border-gray-300 rounded-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarActual(!mostrarActual)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {mostrarActual ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarNueva ? "text" : "password"}
                      value={contrasenaNueva}
                      onChange={(e) => setContrasenaNueva(e.target.value)}
                      className="w-full p-2 pr-10 border border-gray-300 rounded-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNueva(!mostrarNueva)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {mostrarNueva ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmar ? "text" : "password"}
                      value={contrasenaConfirmar}
                      onChange={(e) => setContrasenaConfirmar(e.target.value)}
                      className="w-full p-2 pr-10 border border-gray-300 rounded-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setModalAbierto(false);
                    setContrasenaActual('');
                    setContrasenaNueva('');
                    setContrasenaConfirmar('');
                  }}
                  disabled={cambiandoContrasena}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarContrasena}
                  disabled={cambiandoContrasena}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cambiandoContrasena ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cambiando...
                    </>
                  ) : (
                    'Cambiar'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      {/* Modal de conflicto de horarios */}
        {modalConflicto.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                  <Calendar className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    ⚠️ No se puede guardar - Tienes citas programadas
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Los cambios que intentas hacer afectan {modalConflicto.citas.length} cita{modalConflicto.citas.length !== 1 ? 's' : ''} pendiente{modalConflicto.citas.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                <p className="text-sm text-gray-800">
                  <strong>Importante:</strong> Debes gestionar estas citas antes de poder cambiar tu disponibilidad. 
                  Ve a la página de Reservas para reprogramarlas o marcarlas como incumplidas.
                </p>
              </div>

              {/* Lista de citas afectadas */}
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 sticky top-0 bg-white pb-2">
                  Citas que debes gestionar:
                </h4>
                {modalConflicto.citas.map((cita, index) => (
                  <div 
                    key={cita.id} 
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {cita.nombre} {cita.apellido}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {cita.hora}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          📞 {cita.telefono}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                        Pendiente
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones del modal */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setModalConflicto({ visible: false, citas: [] })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    setModalConflicto({ visible: false, citas: [] });
                    window.location.href = '/reservas';
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Ir a gestionar reservas
                </button>
              </div>
            </motion.div>
          </div>
        )}

    </motion.div>
    
  );
}






