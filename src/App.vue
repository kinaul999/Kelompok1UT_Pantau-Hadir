<script setup>
import { ref } from 'vue'
import PekerjaLogin from './views/PekerjaLogin.vue'
import PekerjaDashboard from './views/PekerjaDashboard.vue'
import LandingPage from './views/landingpage.vue'
import AbsenSukses from './views/AbsenSukses.vue'
import admindashboard from './views/admindashboard.vue'
import AdminLogin from './views/AdminLogin.vue'
import RekapitulasiAbsen from './views/RekapitulasiAbsen.vue'
import DataPekerja from './views/DataPekerja.vue'
import TambahPekerja from './views/TambahPekerja.vue'

// Kotak status navigasi lokal (Default dimulai dari halaman login)
const currentScreen = ref('landing')

// Fungsi pusat untuk mengubah isi kotak status navigasi
const navigateTo = (screenName) => {
  currentScreen.value = screenName
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
    
    <!-- 2. HALAMAN LOGIN PEKERJA -->
    <PekerjaLogin 
      v-if="currentScreen === 'login'" 
      @login-success="navigateTo('dashboard')" 
    />
    
    <!-- 3. HALAMAN DASHBOARD PEKERJA -->
    <PekerjaDashboard 
      v-if="currentScreen === 'dashboard'" 
      @absen-complete="navigateTo('absen-sukses')"
      @logout-trigger="navigateTo('landing')"
    />

    <!-- 4. HALAMAN SUKSES ABSENSI -->
    <AbsenSukses
      v-if="currentScreen === 'absen-sukses'"
      @logout-trigger="navigateTo('landing')"
    />

    <!-- 5. HALAMAN LOGIN ADMIN -->
    <AdminLogin
      v-if="currentScreen === 'adminlogin'"
      @admin-login-success="navigateTo('admindashboard')"
      @admin-logout-trigger="navigateTo('landing')"
    />

    <!-- 6. HALAMAN DASHBOARD ADMIN -->
    <admindashboard
      v-if="currentScreen === 'admindashboard'"
      @admin-logout-trigger="navigateTo('landing')"
      @data-pekerja-trigger="navigateTo('datapekerja')"
      @rekapitulasi-absen-trigger="navigateTo('rekapitulasiabsen')"
    />

    <!-- 7. HALAMAN REKAPITULASI ABSENSI -->
    <RekapitulasiAbsen
      v-if="currentScreen === 'rekapitulasiabsen'"
      @admin-dashboard-trigger="navigateTo('admindashboard')"
      @admin-logout-trigger="navigateTo('landing')"
    />

    <!-- 8. HALAMAN DATA PEKERJA -->
    <DataPekerja
      v-if="currentScreen === 'datapekerja'"
      @admin-dashboard-trigger="navigateTo('admindashboard')"
      @rekapitulasi-absen-trigger="navigateTo('rekapitulasiabsen')"
      @admin-logout-trigger="navigateTo('landing')"
      @tambah-pekerja-trigger="navigateTo('tambahpekerja')"
    />

    <!-- 9. HALAMAN TAMBAH PEKERJA -->
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
</style>