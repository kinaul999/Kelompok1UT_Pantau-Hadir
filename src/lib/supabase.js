
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from('admins')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Koneksi Supabase gagal:', error.message)
    return false
  }

  console.log('Koneksi Supabase berhasil!')
  return true
}

if (import.meta.env.DEV) {
  console.log('Menjalankan tes koneksi Supabase...')
  testSupabaseConnection()
}