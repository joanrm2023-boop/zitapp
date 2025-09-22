'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Pencil, Trash2, X } from 'lucide-react'
import { Check, Ban } from 'lucide-react';


export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [totalReservas, setTotalReservas] = useState<number>(0)
  const [profesionalesActivos, setProfesionalesActivos] = useState<number>(0)


  const [modalEditar, setModalEditar] = useState(false)
  const [nombreEdit, setNombreEdit] = useState('')
  const [planEdit, setPlanEdit] = useState('')
  const [tipoNegocioEdit, setTipoNegocioEdit] = useState('')
  const [estadoEdit, setEstadoEdit] = useState('')
  const [mensajeEliminadoVisible, setMensajeEliminadoVisible] = useState(false)



  useEffect(() => {
    const cargarClientes = async () => {
      const { data, error } = await supabase.from('clientes').select('*')
      if (error) {
        console.error('Error cargando clientes:', error)
      } else {
        setClientes(data)
      }
      setLoading(false)
    }
    cargarClientes()
  }, [])

  const abrirModal = async (cliente: any) => {
    setClienteSeleccionado(cliente)
    const { count: reservas } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('id_cliente', cliente.id_cliente)
    const { count: profesionales } = await supabase
      .from('barberos')
      .select('*', { count: 'exact', head: true })
      .eq('id_cliente', cliente.id_cliente)
      .eq('estado', 'activo')
    setTotalReservas(reservas || 0)
    setProfesionalesActivos(profesionales || 0)
  }

  const abrirModalEditar = (cliente: any) => {
    setClienteSeleccionado(cliente)
    setNombreEdit(cliente.nombre ?? '')
    setPlanEdit(cliente.plan ?? '')
    setTipoNegocioEdit(cliente.tipo_negocio ?? '')
    setEstadoEdit(cliente.activo ?? 'Activo')
    setModalEditar(true)
  }

  const eliminarCliente = async (id_cliente: string) => {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción marcará el cliente como eliminado.');
    if (!confirmar) return;

    const { error } = await supabase
      .from('clientes')
      .update({ activo: 'Eliminado' })
      .eq('id_cliente', id_cliente);

    if (error) {
      console.error(error);
      return;
    }

    setClientes((prev) =>
      prev.map((c) => c.id_cliente === id_cliente ? { ...c, activo: 'Eliminado' } : c)
    );

    setMensajeEliminadoVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setMensajeEliminadoVisible(false), 3000);
  };

  const cambiarEstado = async (cliente: any) => {
    const nuevoEstado = cliente.activo === 'Activo' ? 'Inactivo' : 'Activo'

    const { error } = await supabase
      .from('clientes')
      .update({ activo: nuevoEstado })
      .eq('id_cliente', cliente.id_cliente)

    if (error) {
      alert('❌ Error actualizando el estado del cliente')
      console.error(error)
      return
    }

    alert(`✅ Estado cambiado a ${nuevoEstado}`)

    setClientes((prev) =>
      prev.map((c) =>
        c.id_cliente === cliente.id_cliente ? { ...c, activo: nuevoEstado } : c
      )
    )
  }

  const guardarCambios = async () => {
    if (!clienteSeleccionado) return
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre: nombreEdit,
        plan: planEdit,
        tipo_negocio: tipoNegocioEdit,
        activo: estadoEdit,
      })
      .eq('id_cliente', clienteSeleccionado.id_cliente)
    if (error) {
      alert('❌ Error actualizando cliente')
      return
    }
    setModalEditar(false)
    setClienteSeleccionado(null)
    alert('✅ Cambios guardados con éxito')
      }



  return (
    <div className="p-4 md:p-6">

        <AnimatePresence>
          {mensajeEliminadoVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="bg-red-500 text-white border border-red-700 rounded-xl p-4 mb-6 shadow-lg text-center text-lg font-semibold"
            >
              ❌ Cliente marcado como eliminado.
            </motion.div>
          )}
        </AnimatePresence>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Clientes registrados</h1>

      {loading ? (
        <p className="text-gray-500">Cargando clientes...</p>
      ) : clientes.length === 0 ? (
        <p className="text-gray-500">No hay clientes registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <motion.table className="min-w-full border border-gray-200 shadow-md rounded-xl overflow-hidden bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <thead className="bg-gray-100 text-left text-sm text-gray-700">
              <tr>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Tipo de negocio</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {clientes.map((cliente) => (
                <tr key={cliente.id_cliente} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3">{cliente.nombre}</td>
                  <td className="px-5 py-3 capitalize">{cliente.plan || 'básico'}</td>
                  <td className="px-5 py-3 capitalize">{cliente.tipo_negocio || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={cliente.activo === 'Activo' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {cliente.activo}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex space-x-3">
                      <button
                        className={cliente.activo === 'Activo' ? 'text-purple-600 hover:text-purple-800' : 'text-gray-500 hover:text-gray-700'}
                        title="Cambiar estado"
                        onClick={() => cambiarEstado(cliente)}
                      >
                        {cliente.activo === 'Activo' ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (
                          <Ban size={18} />
                        )}
                      </button>

                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver"
                        onClick={() => abrirModal(cliente)}
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Editar"
                        onClick={() => abrirModalEditar(cliente)}
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                        onClick={() => eliminarCliente(cliente.id_cliente)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      )}

      <AnimatePresence>
        {clienteSeleccionado && !modalEditar && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative" initial={{ scale: 0.8, y: -50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: -50 }} transition={{ duration: 0.3 }}>
              <button onClick={() => setClienteSeleccionado(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-600">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Resumen del cliente</h2>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><strong>Nombre:</strong> {clienteSeleccionado.nombre}</p>
                <p><strong>Plan:</strong> {clienteSeleccionado.plan}</p>
                <p><strong>Tipo de negocio:</strong> {clienteSeleccionado.tipo_negocio}</p>
                <p><strong>Estado:</strong> {clienteSeleccionado.activo}</p>
                {clienteSeleccionado.created_at && (
                  <p><strong>Fecha de registro:</strong> {new Date(clienteSeleccionado.created_at).toLocaleDateString()}</p>
                )}
                <p><strong>Total de reservas:</strong> {totalReservas}</p>
                <p><strong>Profesionales activos:</strong> {profesionalesActivos}</p>
              </div>
              <div className="mt-6 text-center space-y-2">
                <a href={`/reservar/${clienteSeleccionado.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
                  Ver página pública
                </a>
                <button onClick={() => {
                  const url = `${window.location.origin}/reservar/${clienteSeleccionado.slug}`
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(url).then(() => alert('✅ Enlace copiado al portapapeles')).catch(() => alert('❌ No se pudo copiar el enlace'))
                  } else {
                    const textArea = document.createElement('textarea')
                    textArea.value = url
                    textArea.style.position = 'fixed'
                    textArea.style.left = '-9999px'
                    document.body.appendChild(textArea)
                    textArea.focus()
                    textArea.select()
                    try {
                      document.execCommand('copy')
                      alert('✅ Enlace copiado al portapapeles')
                    } catch {
                      alert('❌ No se pudo copiar el enlace')
                    }
                    document.body.removeChild(textArea)
                  }
                }} className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                  Copiar enlace
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modalEditar && (
            <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Editar cliente</h2>

                <label className="block mb-2 text-sm font-medium text-gray-800">Nombre del negocio</label>
                <input
                  type="text"
                  value={nombreEdit}
                  onChange={(e) => setNombreEdit(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />

                <label className="block mb-2 text-sm font-medium text-gray-800">Plan</label>
                <select
                  value={planEdit}
                  onChange={(e) => setPlanEdit(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded bg-white text-black"
                >
                  <option value="básico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>

                <label className="block mb-2 text-sm font-medium text-gray-800">Tipo de negocio</label>
                <select
                  value={tipoNegocioEdit}
                  onChange={(e) => setTipoNegocioEdit(e.target.value)}
                  className="w-full mb-4 px-3 py-2 border border-gray-300 rounded bg-white text-black"
                >
                  <option value="barberia">Barbería</option>
                  <option value="cancha">Cancha</option>
                  <option value="spa">Spa</option>
                  <option value="veterinaria">Veterinaria</option>
                </select>

                <label className="block mb-2 text-sm font-medium text-gray-800">Estado</label>
                <select
                  value={estadoEdit}
                  onChange={(e) => setEstadoEdit(e.target.value)}
                  className="w-full mb-6 px-3 py-2 border border-gray-300 rounded bg-white text-black"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>

                <div className="flex justify-end space-x-3">
                  <button
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                    onClick={() => {
                      setModalEditar(false)
                      setClienteSeleccionado(null)
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    onClick={guardarCambios}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}
      </AnimatePresence>
    </div>
  )
}





