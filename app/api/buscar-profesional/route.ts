import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json(null)

  const { data } = await getSupabaseAdmin()
    .from('barberos')
    .select('nombre_barbero, foto_url')
    .ilike('correo_barbero', email.trim())
    .eq('activo', true)
    .neq('estado', 'eliminado')
    .maybeSingle()

  return NextResponse.json(data)
}
