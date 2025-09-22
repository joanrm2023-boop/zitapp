'use client'; // Indica que este componente se ejecuta en el cliente (React)


import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Cliente de Supabase previamente configurado

// Componente principal para reservar una cita
export default function Reservar() {
  // Estados para controlar el formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [errorIdentificacion, setErrorIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');
  const [fecha, setFecha] = useState(() => {///Para que comience por defecto en fecha actual
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
      const dd = String(hoy.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    });
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeJSX, setMensajeJSX] = useState(null);
  const mensajeRef = useRef(null);
  
  useEffect(() => {//para hacer scroll automático al mensaje
    if (mensajeRef.current) {
      mensajeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [mensajeJSX]);

  useEffect(() => {//para ocultar el mensaje confirmatorio automáticamente luego de unos segundos
  if (mensajeJSX) {
      const timeout = setTimeout(() => {
        setMensajeJSX(null);
      }, 5000); // ⏱️ Desaparece después de 5 segundos

      return () => clearTimeout(timeout); // Limpieza por si cambia antes
    }
  }, [mensajeJSX]);

  // Estado para guardar las horas ocupadas en una fecha específica
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  // Estado auxiliar por si se quiere mostrar o almacenar las reservas completas
  const [reservas, setReservas] = useState<any[]>([]);

  // Función que genera las horas disponibles entre 10:00 AM y 10:00 PM en intervalos de 45 minutos
  const generarHoras = () => {
    const horas: string[] = [];
    const start = 10 * 60; // Inicio: 10:00 AM en minutos
    const end = 22 * 60;   // Fin: 10:00 PM en minutos

    for (let mins = start; mins < end; mins += 45) {
      const h = Math.floor(mins / 60).toString().padStart(2, '0'); // Hora con padding
      const m = (mins % 60).toString().padStart(2, '0'); // Minutos con padding
      horas.push(`${h}:${m}`);
    }

    return horas;
  };

  // Genera las horas disponibles al renderizar el componente
  const horasDisponibles = generarHoras();

  // Función para convertir formato 24h (ej. "13:45") a 12h (ej. "1:45 PM")
  const formato12Horas = (hora24: string): string => {
    const [hora, minuto] = hora24.split(':').map(Number); // Separar horas y minutos
    const ampm = hora >= 12 ? 'PM' : 'AM'; // AM o PM
    const hora12 = hora % 12 === 0 ? 12 : hora % 12; // Ajuste para hora 12
    return `${hora12}:${minuto.toString().padStart(2, '0')} ${ampm}`;
  };

  // Efecto para obtener las horas ocupadas cuando el usuario selecciona una fecha
  useEffect(() => {
    const obtenerReservasPorFecha = async () => {
      if (!fecha) return;

      // Consulta a Supabase para traer todas las reservas de esa fecha
      const { data, error } = await supabase
        .from('reservas')
        .select('hora')
        .eq('fecha', fecha);

      if (error) {
        console.error('Error al obtener reservas por fecha:', error.message);
        return;
      }

      // Almacena las horas ocupadas en el estado
      const horas = data?.map((r) => r.hora) || [];
      setHorasOcupadas(horas);
    };

    obtenerReservasPorFecha();
  }, [fecha]); // Este efecto se ejecuta cada vez que se cambia la fecha

    const handleSubmit = async (e: React.FormEvent) => {
      // Evita que el formulario recargue la página por defecto
      e.preventDefault();
      setCargando(true);
      setMensaje(''); // Limpia cualquier mensaje anterior      
      // 1. Definición de la expresión regular:
      //    - ^ y $: anclan el patrón al inicio y fin de la cadena
      //    - a-zA-Z: letras sin acento
      //    - áéíóúÁÉÍÓÚñÑ: letras acentuadas y la ñ
      //    - \s: espacios en blanco
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

      // 2. Validación de que el campo "nombre" no esté vacío
      if (!nombre.trim()) {
      setEsError(true);
      setMensaje('❌ Por favor ingresa tu nombre.');
      setCargando(false);
      return;
      }
      // 3. Validación de que "nombre" solo contenga letras y espacios
      if (!soloLetras.test(nombre)) {
        setMensaje('❌ El nombre solo debe contener letras.');
        setCargando(false);
        return;
      }

      // 4. Validación de que el campo "apellido" no esté vacío
      if (!apellido.trim()) {
        setMensaje('❌ Por favor ingresa tu apellido.');
        setCargando(false);
        return;
      }
      // 5. Validación de que "apellido" solo contenga letras y espacios
      if (!soloLetras.test(apellido)) {
        setMensaje('❌ El apellido solo debe contener letras.');
        setCargando(false);
        return;
      }

      // 6. Validación de que se haya seleccionado una fecha
      if (!fecha) {
        setMensaje('❌ Por favor selecciona una fecha.');
        setCargando(false);
        return;
      }

      // 7. Validar que la fecha seleccionada no sea anterior a hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establece hora 00:00

      if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        setMensaje('❌ Fecha inválida.');
        setCargando(false);
        return;
      }

      const [year, month, day] = fecha.split('-').map(Number); // Asegura que sean números
      const fechaSeleccionada = new Date(year, month - 1, day); // Construcción local sin UTC

      if (fechaSeleccionada < hoy) {
        setMensaje('❌ No puedes reservar en una fecha pasada.');
        setCargando(false);
        return;
      }

      // 7.1 Validar que si la reserva es hoy, la hora no sea pasada
      if (
        fechaSeleccionada.getTime() === hoy.getTime() // misma fecha
      ) {
        const [hora, minuto] = horaSeleccionada.split(':').map(Number);
        const ahora = new Date(); // hora actual
        const horaReserva = new Date(); // clon para modificar hora

        horaReserva.setHours(hora, minuto, 0, 0); // hora seleccionada

        if (horaReserva < ahora) {
          setMensaje('❌ No puedes reservar en una hora que ya pasó.');
          setCargando(false);
          return;
        }
      }

      // 8. Validación de que se haya seleccionado una hora
      if (!horaSeleccionada) {
        setMensaje('❌ Por favor selecciona una hora.');
        setCargando(false);
        return;
      }
      
      //Validar identificación (no vacía y solo dígitos)
      if (!identificacion.trim()) {
        setMensaje('❌ Por favor ingresa tu número de identificación.');
        setCargando(false);
        return;
      }
      if (!/^\d+$/.test(identificacion)) {
        setMensaje('❌ La identificación debe contener solo números.');
        setCargando(false);
        return;
      }

      // Validar teléfono (no vacío y entre 7 y 10 dígitos)
      if (!telefono.trim()) {
        setMensaje('❌ Por favor ingresa tu teléfono.');
        setCargando(false);
        return;
      }
      if (!/^\d{7,10}$/.test(telefono)) {
        setMensaje('❌ El teléfono debe tener entre 7 y 10 dígitos.');
        setCargando(false);
        return;
      }

      // 9. (Opcional) Verificar si ya existe una reserva idéntica
      //    - Consultamos Supabase para filas que coincidan en fecha, hora, nombre y apellido
      const { data: yaExiste, error: errorConsulta } = await supabase
        .from('reservas')
        .select('*')
        .eq('fecha', fecha)
        .eq('hora', horaSeleccionada)
        .eq('nombre', nombre)
        .eq('apellido', apellido);

      // 10. Manejo de errores de consulta
      if (errorConsulta) {
        setMensaje('❌ Error al verificar reservas previas: ' + errorConsulta.message);
        setCargando(false);
        return;
      }
      // 11. Si yaEncontró filas, informamos al usuario y detenemos el proceso
      if (yaExiste && yaExiste.length > 0) {
        setMensaje('❌ Ya tienes una reserva en ese horario.');
        setCargando(false);
        return;
      }
      
      // 11.5 Validar que el teléfono no esté vacío
      if (!telefono.trim()) {
        setMensaje('❌ Por favor ingresa tu número de teléfono.');
        return;
      }

      // 11.6 Validar que el teléfono solo contenga números
      if (!/^\d+$/.test(telefono)) {
        setMensaje('❌ El número de teléfono solo debe contener dígitos.');
        return;
      }

      // 11.7 Validar que el teléfono tenga entre 7 y 10 dígitos
      if (telefono.length < 7 || telefono.length > 10) {
        setMensaje('❌ El número de teléfono debe tener entre 7 y 10 dígitos.');
        return;
      }

      // 11.8 Validar que la identificación no esté vacía
      if (!identificacion.trim()) {
        setMensaje('❌ Por favor ingresa tu número de identificación.');
        return;
      }

      // 11.9 Validar que la identificación solo tenga números y máximo 15 dígitos
      const soloNumeros = /^[0-9]+$/;
      if (!soloNumeros.test(identificacion)) {
        setMensaje('❌ La identificación solo debe contener números.');
        return;
      }

      if (identificacion.length > 15) {
        setMensaje('❌ La identificación no debe tener más de 15 dígitos.');
        return;
      }

      // 11.10 Validar que no exista ya una reserva con la misma identificación
      const { data: reservasExistentes, error: errorDuplicado } = await supabase
        .from('reservas')
        .select('id')
        .eq('identificacion', identificacion);

      if (errorDuplicado) {
        setEsError(true);
        setMensajeJSX('❌ Error al verificar duplicados: ' + errorDuplicado.message);
        setCargando(false); // 🔁 IMPORTANTE
        return;
      }

      if (reservasExistentes && reservasExistentes.length > 0) {
        setEsError(true);
        setMensajeJSX('⚠️ Ya existe una reserva con esa identificación.');
        setCargando(false);
        return;
      }

      // 12. Insertar la nueva reserva en la tabla "reservas"
      const { data, error } = await supabase
        .from('reservas')
        .insert([
          {
            nombre,
            apellido,
            identificacion,
            telefono,
            fecha,
            hora: horaSeleccionada,
          },
        ]);

        // 13. Manejo de error en la inserción
        if (error) {
          setMensaje('❌ Error al guardar la reserva: ' + error.message);
          console.error('❌ Error en Supabase:', error.message);
          setCargando(false);
          return; // ⛔ Importante: evitar que el flujo continúe
        }

        // 14. Mensaje de éxito formateado con formato de 12 horas
        setMensajeJSX(
          <div className="p-4 border border-green-500 bg-green-50 rounded-lg shadow-md mb-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✅</span>
              <h2 className="text-green-700 font-semibold text-lg">¡Reserva confirmada!</h2>
            </div>
            <p className="mt-2 text-gray-800">
              <strong>{nombre} {apellido}</strong> tiene una cita el <strong>{fecha}</strong> a las <strong>{formato12Horas(horaSeleccionada)}</strong>.
            </p>
          </div>
        );

    // 15. Actualizar estados locales:
    setReservas((prev) => [...prev, ...(data || [])]);
    setHorasOcupadas((prev) => [...prev, horaSeleccionada]);

    // 16. Limpiar los campos del formulario
    setNombre('');
    setApellido('');
    setFecha('');
    setHoraSeleccionada('');
    setIdentificacion('');
    setTelefono('');

    // 17. Finalizar estado de carga y limpiar mensaje tras unos segundos
    setCargando(false);
    setTimeout(() => {
      setMensaje('');
    }, 5000);
  };

  // Renderizado del formulario de reserva
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full flex justify-end items-start mt-4 px-4">
        <a
          href="/dashboard"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-md shadow-md transition duration-300"
        >
          🛠️ Panel de Control
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-6">📅 Reservar cita</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-md"
      >
        {/* Campo de nombre */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tu nombre"
          />
        </div>

        {/* Campo de apellido */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="apellido">
            Apellido
          </label>
          <input
            id="apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tu apellido"
          />
        </div>

        {/* Campo de identificación */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="identificacion">
            Identificación
          </label>
          <input
            id="identificacion"
            type="text"
            value={identificacion}
            onChange={(e) => {
              const valor = e.target.value;

              // Validar que solo tenga dígitos
              if (!/^\d*$/.test(valor)) {
                setErrorIdentificacion('❌ Solo se permiten números.');
                return;
              }

              // Validar longitud máxima
              if (valor.length > 15) {
                setErrorIdentificacion('❌ No puede tener más de 15 dígitos.');
                return;
              }

              // Si pasa las validaciones
              setIdentificacion(valor);
              setErrorIdentificacion('');
            }}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Número de identificación"
          />
          {errorIdentificacion && (
            <p className="text-red-600 text-sm mt-1">{errorIdentificacion}</p>
          )}
        </div>

        {/* Campo de teléfono */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(e) => {
              const valor = e.target.value;

              // Validar que solo tenga dígitos
              if (!/^\d*$/.test(valor)) {
                setErrorTelefono('❌ Solo se permiten números.');
                return;
              }

              // Validar longitud máxima
              if (valor.length > 10) {
                setErrorTelefono('❌ El teléfono no puede tener más de 10 dígitos.');
                return;
              }

              // Si pasa las validaciones, guardar valor y limpiar error
              setTelefono(valor);
              setErrorTelefono('');
            }}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tu teléfono"
          />
          {errorTelefono && (
            <p className="text-red-600 text-sm mt-1">{errorTelefono}</p>
          )}
        </div>

        {/* Campo de fecha */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="fecha">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Selección de horario */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Selecciona una hora:</label>
          {(() => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const fechaSeleccionadaDate = new Date(fecha);
            fechaSeleccionadaDate.setHours(0, 0, 0, 0);

            let horasFiltradas = horasDisponibles;

            // Si la fecha seleccionada es hoy, eliminar horas ya pasadas
            if (fecha && fechaSeleccionadaDate.getTime() === hoy.getTime()) {
              const ahora = new Date();
              horasFiltradas = horasDisponibles.filter((hora) => {
                const [h, m] = hora.split(':').map(Number);
                const horaDate = new Date();
                horaDate.setHours(h, m, 0, 0);
                return horaDate > ahora;
              });
            }

            const hayHorasDisponibles = horasFiltradas.some(
              (hora) => !horasOcupadas.includes(hora)
            );

            return (
              <>
                {!hayHorasDisponibles ? (
                  <p className="text-red-600 font-medium">
                    No hay horarios disponibles para esta fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {horasFiltradas.map((hora) => {
                      const deshabilitada = horasOcupadas.includes(hora);
                      return (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => setHoraSeleccionada(hora)}
                          disabled={deshabilitada}
                          className={`px-3 py-2 rounded-md border text-sm ${
                            horaSeleccionada === hora
                              ? 'bg-black text-white'
                              : deshabilitada
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-white text-black hover:bg-gray-200'
                          }`}
                        >
                          {formato12Horas(hora)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Botón para confirmar la reserva */}
          <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={cargando}
            className={`px-6 py-3 text-white text-lg font-semibold rounded-full transition duration-300 shadow-md ${
              cargando
                ? 'bg-red-600 cursor-wait'  // 🔴 Rojo mientras carga
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {cargando ? '⏳ Reservando...' : 'Reservar cita'}
          </button>
        </div>
        </form>
      
      {cargando && (
      <div className="mt-4 text-gray-600">
        ⏳ Procesando tu reserva...
      </div>
      )}

      {/* Muestra mensajes de éxito o error con scroll automático */}
      {mensajeJSX && (
      <div
        ref={mensajeRef}
        className={`mt-6 mx-auto max-w-md rounded-xl border px-4 py-3 text-center shadow-md ${
          esError
            ? 'border-red-300 bg-red-100 text-red-800'
            : 'border-green-300 bg-green-100 text-green-800'
        }`}
      >
        {mensajeJSX}
      </div>
    )}
    </main>
  );
}









