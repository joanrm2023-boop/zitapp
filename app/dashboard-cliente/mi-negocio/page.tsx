'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Settings, Store, Link2, Copy, Globe, TrendingUp, CreditCard, Upload } from 'lucide-react';
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

  const handleGuardar = async () => {
    if (!cliente) return;

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
      alert('Error al guardar: ' + res.error.message);
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
    </motion.div>
  );
}






