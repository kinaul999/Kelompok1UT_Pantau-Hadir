<script setup>
import { ref } from 'vue'
import PekerjaLogin from './views/PekerjaLogin.vue'
import PekerjaDashboard from './views/PekerjaDashboard.vue'

// Kotak status navigasi lokal (Default dimulai dari halaman login)
const currentScreen = ref('login')

// Fungsi pusat untuk mengubah isi kotak status navigasi
const navigateTo = (screenName) => {
  currentScreen.value = screenName
}
</script>

<template>
  <main class="main-container">
    
    <!-- 1. HALAMAN LOGIN PEKERJA -->
    <PekerjaLogin 
      v-if="currentScreen === 'login'" 
      @login-success="navigateTo('dashboard')" 
    />
    
    <!-- 2. HALAMAN DASHBOARD PEKERJA (Perbaikan Event Listener) -->
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