<script setup>
import { ref } from 'vue'
import PekerjaLogin from './views/PekerjaLogin.vue'
import PekerjaDashboard from './views/PekerjaDashboard.vue'
import LandingPage from './views/landingpage.vue'

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
      @select-admin="navigateTo('dashboard-admin')" 
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
      @logout-trigger="navigateTo('login')"
    />

  </main>
</template>

<style scoped>
.main-container {
  min-height: 100vh;
  background-color: #ffffff;
}
</style>