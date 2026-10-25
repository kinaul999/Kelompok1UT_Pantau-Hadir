```vue
<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

import iconLogin from '../assets/icons/log-in.svg'
import iconHouse from '../assets/icons/house.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru-removebg-preview.png'

const emit = defineEmits([
  'admin-login-success',
  'admin-logout-trigger'
])

const nik = ref('')
const password = ref('')
const showPassword = ref(false)
const loginError = ref('')
const isLoading = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}


const handleLogin = async () => {
  if (isLoading.value) return

  loginError.value = ''

  const nikInput = nik.value.trim()
  const passwordInput = password.value

  if (!nikInput || !passwordInput) {
    loginError.value = 'NIK dan kata sandi wajib diisi.'
    return
  }

  isLoading.value = true

  try {
    // 1. Login terlebih dahulu ke Supabase Authentication
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email: 'pedangrusak279@gmail.com',
        password: passwordInput
      })

    if (authError) {
      loginError.value = 'Email atau kata sandi salah.'
      return
    }

    // 2. Cari data admin berdasarkan UID akun yang login
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('auth_user_id, nik, name, status')
      .eq('auth_user_id', data.user.id)
      .maybeSingle()

    if (adminError) throw adminError

    // 3. Validasi NIK dan status admin
    if (
      !admin ||
      admin.nik !== nikInput ||
      admin.status !== 'active'
    ) {
      await supabase.auth.signOut()
      loginError.value =
        'NIK tidak cocok atau akun admin tidak aktif.'
      return
    }

    // 4. Login berhasil, pindah ke dashboard
    emit('admin-login-success', {
      nik: admin.nik,
      name: admin.name
    })
  } catch (error) {
    console.error('Login admin gagal:', error)
    loginError.value =
      'Terjadi kesalahan saat memeriksa akun. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}


const goToHome = async () => {
  await supabase.auth.signOut()
  emit('admin-logout-trigger')
}
</script>

<template>
  <div class="admin-login-layout">
    <header class="app-topbar">
      <h2 class="topbar-title">Sistem Absensi Pekerja Proyek</h2>
    </header>

    <div class="brand-bar">
      <img
        :src="logoPantauHadir"
        width="140"
        height="76"
        alt="Logo Pantau Hadir"
        class="brand-logo"
      />
    </div>

    <div class="illustration-bg" aria-hidden="true">
      <img
        :src="imgKonstruksi"
        alt=""
        class="illustration-img"
        opacity="0.50"
      />
    </div>

    <main class="login-main">
      <section class="admin-login-card" aria-labelledby="admin-login-heading">
        <h1 id="admin-login-heading" class="card-title">Masuk ke Akun Anda</h1>
        <p class="card-subtitle">Masukkan NIK dan password Anda untuk mengakses sistem</p>

        <form class="login-form" @submit.prevent="handleLogin">
          <p v-if="loginError" class="login-error" role="alert">
  {{ loginError }}
</p>
        
          <div class="form-group">
            <label for="admin-nik" class="form-label">NIK</label>
            <input
              id="admin-nik"
              v-model="nik"
              type="text"
              name="nik"
              class="form-input"
              placeholder="Masukkan Nomor Induk Karyawan Anda"
              autocomplete="username"
              required
            />
          </div>

          <div class="form-group">
            <label for="admin-password" class="form-label">Kata Sandi</label>
            <div class="password-field">
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                class="form-input input-password"
                placeholder="Masukkan Kata Sandi Anda"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                :aria-pressed="showPassword"
                @click="togglePasswordVisibility"
              >
                <img
                  :src="showPassword ? iconEyeOff : iconEye"
                  width="18"
                  height="18"
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading">
  <img
    :src="iconLogin"
    width="18"
    height="18"
    alt=""
    class="btn-icon"
    aria-hidden="true"
  />
  <span>{{ isLoading ? 'MEMERIKSA...' : 'MASUK KE SISTEM' }}</span>
          </button>
        </form>

        <hr class="card-divider" />

        <button type="button" class="btn-home" @click="goToHome">
          <img :src="iconHouse" width="18" height="18" alt="" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </button>
      </section>
    </main>

    <footer class="app-footer">
      <p class="footer-copy">
        <small>© 2026 Pantau Hadir App - Sistem Absensi Pekerja Proyek</small>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.admin-login-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-text-strong, #111111);
  font-family: var(--font-family);
  overflow-x: hidden;
  isolation: isolate;
}

.app-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: var(--header-height, 56px);
  padding: 0 var(--space-24, 24px);
  background-color: var(--color-header, #f58220);
  z-index: 2;
}

.topbar-title {
  margin: 0;
  color: var(--color-text-inverse, #ffffff);
  font-size: 1.15rem;
  font-style: italic;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.brand-bar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 24px 0;
}

.brand-logo {
  display: block;
  max-width: 140px;
  height: auto;
}

.illustration-bg {
  position: absolute;
  inset: 0;
  top: var(--header-height, 56px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  opacity: 50%;
}

.illustration-img {
  width: 100%;
  max-width: 1100px;
  max-height: 85vh;
  object-fit: contain;
  object-position: center bottom;
  opacity: 0.95;
}

.login-main {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px 36px;
}

.admin-login-card {
  width: 100%;
  max-width: 440px;
  background-color: rgba(218, 224, 243, 0.92);
  border-radius: var(--radius-xl, 24px);
  padding: 36px 36px 32px;
  box-shadow: 0 12px 32px rgba(8, 12, 100, 0.16);
  backdrop-filter: blur(6px);
}

.card-title {
  font-family: var(--font-family);
  font-size: 1.65rem;
  font-style: italic;
  font-weight: 800;
  line-height: 1.2;
  color: #000000;
  margin: 0 0 6px;
}

.card-subtitle {
  font-family: var(--font-family);
  font-size: 0.85rem;
  line-height: 1.4;
  color: #333333;
  margin: 0 0 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-family);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-strong, #111111);
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background-color: #ffffff;
  color: #000000;
  font-family: var(--font-family);
  font-size: 0.88rem;
  border: 1.5px solid #222222;
  border-radius: var(--radius-sm, 8px);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input::placeholder {
  color: #888888;
  font-weight: 400;
}

.form-input:focus {
  border-color: var(--color-primary, #080264);
  box-shadow: 0 0 0 3px rgba(8, 2, 100, 0.18);
}

.input-password {
  padding-right: 46px;
}

.password-toggle {
  position: absolute;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #555555;
  transition: opacity 0.15s ease;
}

.login-error {
  margin: 0;
  padding: 10px 12px;
  color: #b42318;
  background-color: #fee4e2;
  border-radius: 8px;
  font-size: 0.85rem;
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.password-toggle:hover {
  opacity: 0.7;
}

.password-toggle:focus-visible {
  outline: 2px solid var(--color-primary, #080264);
  outline-offset: 1px;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  margin-top: 10px;
  background-color: var(--color-primary, #080264);
  color: #ffffff;
  font-family: var(--font-family);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  border: none;
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.btn-submit:hover {
  background-color: #050046;
}

.btn-submit:active {
  transform: scale(0.99);
}

.btn-submit:focus-visible {
  outline: 3px solid var(--color-accent, #f58220);
  outline-offset: 2px;
}

.btn-icon {
  filter: brightness(0) invert(1);
}

.card-divider {
  border: 0;
  border-top: 1px solid #222222;
  margin: 20px 0 16px;
  opacity: 0.85;
}

.btn-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-primary, #080264);
  font-family: var(--font-family);
  font-size: 0.88rem;
  font-style: italic;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
  padding: 6px;
  transition: opacity 0.15s ease;
}

.btn-home:hover {
  opacity: 0.75;
}

.btn-home:focus-visible {
  outline: 2px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.app-footer {
  position: relative;
  z-index: 2;
  padding: 8px 16px 18px;
  text-align: center;
}

.footer-copy {
  margin: 0;
  color: #4a5170;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .brand-bar {
    padding: 12px 20px 0;
  }

  .topbar-title {
    font-size: 1rem;
  }

  .admin-login-card {
    padding: 24px 20px 22px;
    border-radius: 18px;
  }

  .card-title {
    font-size: 1.4rem;
  }
}
</style>
