<script setup>
import { ref } from 'vue'
import iconUndo from '../assets/icons/undo-2.svg'
import iconLogIn from '../assets/icons/log-in.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru.jpg'

const idPerusahaan = ref('')
const nik = ref('')
const kataSandi = ref('')
const showPassword = ref(false)

const emit = defineEmits(['login-success'])

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = () => {
  emit('login-success', {
    idPerusahaan: idPerusahaan.value,
    nik: nik.value,
    kataSandi: kataSandi.value
  })
}
</script>

<template>
  <div class="login-wrapper">
    <main class="login-card">
      <header class="login-header">
        <nav class="login-nav">
          <a href="index.html" class="nav-back" aria-label="Kembali ke halaman utama">
            <img :src="iconUndo" alt="" width="24" height="24" aria-hidden="true" />
          </a>
        </nav>
        <figure class="login-brand">
          <img
            :src="logoPantauHadir"
            alt="Logo Pantau Hadir - Sistem Absensi Pekerja Proyek"
            width="100"
            height="100"
            class="brand-logo"
          />
        </figure>
      </header>

      <h1 class="h1 text-center login-title">MASUK</h1>

      <form class="stack-16" @submit.prevent="handleLogin">
        <div class="field">
          <label for="id-perusahaan" class="label">ID Perusahaan</label>
          <input
            id="id-perusahaan"
            v-model.trim="idPerusahaan"
            type="text"
            name="id-perusahaan"
            class="input"
            placeholder="Masukkan ID Perusahaan"
            required
            autofocus
          />
        </div>

        <div class="field">
          <label for="nik" class="label">NIK</label>
          <input
            id="nik"
            v-model.trim="nik"
            type="text"
            name="nik"
            class="input"
            placeholder="Masukkan NIK"
            autocomplete="username"
            inputmode="numeric"
            required
          />
        </div>

        <div class="field">
          <label for="kata-sandi" class="label">Kata Sandi</label>
          <div class="password-wrapper">
            <input
              id="kata-sandi"
              v-model="kataSandi"
              :type="showPassword ? 'text' : 'password'"
              name="kata-sandi"
              class="input input-password"
              placeholder="Masukkan Kata Sandi"
              autocomplete="current-password"
              required
            />
            <button
              id="togglePassword"
              type="button"
              class="password-toggle-btn"
              :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
              :aria-pressed="showPassword"
              @click="togglePassword"
            >
              <img
                :src="showPassword ? iconEye : iconEyeOff"
                width="20"
                height="20"
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block login-btn">
          <img :src="iconLogIn" alt="" width="20" height="20" aria-hidden="true" />
          Masuk
        </button>
      </form>
    </main>

    <footer class="illustration-footer text-center">
      <img
        :src="imgKonstruksi"
        alt="Ilustrasi Konstruksi Pantau Hadir"
        width="400"
        height="200"
        class="footer-img"
      />
    </footer>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-24) var(--space-16);
}

.login-card {
  margin: var(--space-24) auto;
}

.login-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-24);
}

.login-nav {
  align-self: flex-start;
  margin-bottom: var(--space-8);
}

.nav-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.nav-back:hover {
  background-color: rgba(8, 12, 100, 0.08);
}

.nav-back:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
}

.login-brand {
  margin: 0;
  display: flex;
  justify-content: center;
}

.brand-logo {
  object-fit: contain;
}

.login-title {
  margin-bottom: var(--space-24);
  letter-spacing: 0.04em;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-password {
  padding-right: 50px;
}

.password-toggle-btn {
  position: absolute;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-pill);
  cursor: pointer;
  color: var(--color-text);
  transition: opacity 0.15s ease;
}

.password-toggle-btn:hover {
  opacity: 0.75;
}

.password-toggle-btn:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
}

.login-btn {
  margin-top: var(--space-16);
}

.footer-img {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
