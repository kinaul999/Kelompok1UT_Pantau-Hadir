
<script setup>
import { ref } from 'vue'
import { supabase } from './lib/supabase'

import PekerjaLogin from './views/PekerjaLogin.vue'
import PekerjaDashboard from './views/PekerjaDashboard.vue'
import LandingPage from './views/landingpage.vue'
import AbsenSukses from './views/AbsenSukses.vue'
import admindashboard from './views/admindashboard.vue'
import AdminLogin from './views/AdminLogin.vue'
import RekapitulasiAbsen from './views/RekapitulasiAbsen.vue'
import DataPekerja from './views/DataPekerja.vue'
import TambahPekerja from './views/TambahPekerja.vue'

// ==================================================
// NAVIGASI HALAMAN
// ==================================================

const currentScreen = ref('landing')

const navigateTo = (screenName) => {
  currentScreen.value = screenName
}

// ==================================================
// DATA PEKERJA YANG SEDANG LOGIN
// ==================================================

const loggedInWorker = ref(null)

const handleWorkerLogin = (workerData) => {
  const worker = workerData?.worker

  // Pastikan data pekerja dikirim dari PekerjaLogin.vue
  if (!worker?.id || !worker?.auth_user_id) {
    console.error(
      'Data pekerja tidak valid:',
      workerData
    )

    alert(
      'Data pekerja tidak valid. Silakan login kembali.'
    )

    return
  }

  // Simpan data pekerja agar bisa diteruskan ke dashboard
  loggedInWorker.value = worker

  navigateTo('dashboard')
}

// ==================================================
// LOGOUT PEKERJA
// ==================================================

const handleWorkerLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Gagal logout pekerja:', error)
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat logout:', error)
  } finally {
    loggedInWorker.value = null
    navigateTo('landing')
  }
}

// ==================================================
// LOGIN ADMIN
// ==================================================

// Fungsi ini dipertahankan jika nantinya dipakai oleh
// komponen AdminLogin.vue melalui event admin-login.
const handleAdminLogin = async ({ nik, password }) => {
  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: 'pedangrusak279@gmail.com',
        password
      })

    if (error || !data.user) {
      alert('Email atau password salah. Periksa kembali.')
      return
    }

    const {
      data: admin,
      error: adminError
    } = await supabase
      .from('admins')
      .select('auth_user_id, nik, name, status')
      .eq('auth_user_id', data.user.id)
      .maybeSingle()

    if (adminError) {
      console.error(
        'Gagal membaca data admin:',
        adminError
      )

      await supabase.auth.signOut()

      alert(
        'Gagal memeriksa data admin. Periksa kebijakan akses tabel.'
      )

      return
    }

    if (
      !admin ||
      admin.nik?.trim() !== nik?.trim() ||
      admin.status?.toLowerCase() !== 'active'
    ) {
      await supabase.auth.signOut()

      alert(
        'NIK tidak cocok atau akun admin tidak aktif.'
      )

      return
    }

    navigateTo('admindashboard')
  } catch (error) {
    console.error('Login admin gagal:', error)

    alert(
      'Terjadi kesalahan saat login admin. Periksa Console.'
    )
  }
}

// Logout admin
const handleAdminLogout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Gagal logout admin:', error)
  } finally {
    navigateTo('landing')
  }
}
</script>

<template>
  <main class="main-container">

    <!-- 1. BERANDA -->
    <LandingPage
      v-if="currentScreen === 'landing'"
      @select-pekerja="navigateTo('login')"
      @select-admin="navigateTo('adminlogin')"
    />

    <!-- 2. LOGIN PEKERJA -->
    <PekerjaLogin
      v-if="currentScreen === 'login'"
      @login-success="handleWorkerLogin"
      @back-to-landing="navigateTo('landing')"
    />

    <!-- 3. DASHBOARD PEKERJA -->
    <PekerjaDashboard
      v-if="currentScreen === 'dashboard' && loggedInWorker"
      :worker="loggedInWorker"
      @absen-complete="navigateTo('absen-sukses')"
      @logout-trigger="handleWorkerLogout"
    />

    <!-- Pengaman jika dashboard diminta tanpa data pekerja -->
    <section
      v-if="currentScreen === 'dashboard' && !loggedInWorker"
      class="session-error"
    >
      <p>Data login pekerja tidak tersedia.</p>

      <button
        type="button"
        @click="navigateTo('login')"
      >
        Kembali ke Login
      </button>
    </section>

    <!-- 4. HALAMAN SUKSES ABSENSI -->
    <AbsenSukses
      v-if="currentScreen === 'absen-sukses'"
      @logout-trigger="handleWorkerLogout"
    />

    <!-- 5. LOGIN ADMIN -->
    <AdminLogin
      v-if="currentScreen === 'adminlogin'"
      @admin-login-success="navigateTo('admindashboard')"
      @admin-logout-trigger="navigateTo('landing')"
    />

    <!-- 6. DASHBOARD ADMIN -->
    <admindashboard
      v-if="currentScreen === 'admindashboard'"
      @admin-logout-trigger="handleAdminLogout"
      @data-pekerja-trigger="navigateTo('datapekerja')"
      @rekapitulasi-absen-trigger="navigateTo('rekapitulasiabsen')"
    />

    <!-- 7. REKAPITULASI ABSENSI -->
    <RekapitulasiAbsen
      v-if="currentScreen === 'rekapitulasiabsen'"
      @admin-dashboard-trigger="navigateTo('admindashboard')"
      @admin-logout-trigger="handleAdminLogout"
      @data-pekerja-trigger="navigateTo('datapekerja')"
    />

    <!-- 8. DATA PEKERJA -->
    <DataPekerja
      v-if="currentScreen === 'datapekerja'"
      @admin-dashboard-trigger="navigateTo('admindashboard')"
      @rekapitulasi-absen-trigger="navigateTo('rekapitulasiabsen')"
      @admin-logout-trigger="handleAdminLogout"
      @tambah-pekerja-trigger="navigateTo('tambahpekerja')"
    />

    <!-- 9. TAMBAH PEKERJA -->
    <TambahPekerja
      v-if="currentScreen === 'tambahpekerja'"
      @save-pekerja="navigateTo('datapekerja')"
      @cancel-tambah-pekerja="navigateTo('datapekerja')"
    />

  </main>
</template>

<style scoped>
.main-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.session-error {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
}

.session-error button {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background-color: #080264;
  color: white;
  cursor: pointer;
}
</style>
