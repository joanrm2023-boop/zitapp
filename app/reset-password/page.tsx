'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      setError('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex justify-center items-center py-6">
      <motion.div
        className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.img
          src="/logo_Zitapp.png"
          alt="Zitapp Logo"
          className="w-32 h-32 mx-auto mb-4"
        />

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Nueva Contraseña
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ingresa tu nueva contraseña
        </p>

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-green-700 font-semibold">
                ✓ Contraseña actualizada correctamente
              </p>
              <p className="text-green-600 text-sm mt-2">
                Redirigiendo al login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}