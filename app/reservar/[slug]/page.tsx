'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RedireccionReserva() {
  const router = useRouter()
  const { slug } = useParams()

  useEffect(() => {
    const redirigir = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('tipo_negocio')
        .eq('slug', slug)
        .single()

      if (error || !data?.tipo_negocio) {
        router.push('/404') // o puedes redirigir a una página de error personalizada
        return
      }

      const tipo = data.tipo_negocio.toLowerCase()

      if (tipo === 'cancha') {
        router.push(`/reservar/${slug}/reservar-cancha`)
      } else {
        router.push(`/reservar/${slug}/reservar-bar-vet-spa`)
      }
    }

    redirigir()
  }, [router, slug])

  return (
    <p className="text-center mt-10 text-gray-500">Redireccionando...</p>
  )
}













