```vue
<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

import iconUndo from '../assets/icons/undo-2.svg'
import iconLogIn from '../assets/icons/log-in.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru.jpg'

const nik = ref('')
const kataSandi = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

const emit = defineEmits([
  'login-success',
  'back-to-landing'
])

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (isLoading.value) return

  const nikValue = nik.value.trim().toUpperCase()
  const passwordValue = kataSandi.value

  if (!nikValue || !passwordValue) {
    loginError.value = 'NIK dan kata sandi wajib diisi.'
    return
  }

  isLoading.value = true
  loginError.value = ''

  let loginSucceeded = false
  let authAttempted = false

  try {
    // 1. Login melalui Supabase Auth menggunakan email turunan NIK.
    const email = `${nikValue.toLowerCase()}@pekerja.pantauhadir.com`

    authAttempted = true

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: passwordValue
      })

    if (authError) {
      throw new Error('NIK atau kata sandi salah.')
    }

    const user = authData.user

    if (!user) {
      throw new Error('Akun pengguna tidak ditemukan.')
    }

    console.log('UID pengguna Auth:', user.id)
    console.log('NIK yang dicari:', nikValue)

    // 2. Diagnosis: cari pekerja berdasarkan NIK.
    // Ini membantu memeriksa apakah RLS menghalangi pembacaan data.
    const { data: workerByNik, error: nikQueryError } =
      await supabase
        .from('Workers')
        .select('id, nik, name, site_id, status, auth_user_id')
        .eq('nik', nikValue)
        .maybeSingle()

    console.log('Hasil query berdasarkan NIK:', workerByNik)
    console.log('Error query berdasarkan NIK:', nikQueryError)

    if (nikQueryError) {
      throw new Error(
        `Gagal membaca data pekerja: ${nikQueryError.message}`
      )
    }

    if (!workerByNik) {
      throw new Error(
        'Data pekerja tidak terbaca oleh aplikasi. Periksa RLS tabel Workers.'
      )
    }

    // 3. Pastikan data pekerja terhubung dengan akun Auth yang sedang login.
    if (workerByNik.auth_user_id !== user.id) {
      throw new Error(
        'UID akun Auth tidak cocok dengan auth_user_id pada data pekerja.'
      )
    }

    // 4. Pastikan status aktif, tanpa membedakan huruf besar/kecil.
    if (
      typeof workerByNik.status !== 'string' ||
      workerByNik.status.trim().toLowerCase() !== 'active'
    ) {
      throw new Error('Akun pekerja tidak aktif.')
    }

    // 5. Pemeriksaan tambahan menggunakan UID dan NIK.
    const { data: worker, error: workerError } =
      await supabase
        .from('Workers')
        .select('id, nik, name, site_id, status, auth_user_id')
        .eq('auth_user_id', user.id)
        .eq('nik', nikValue)
        .maybeSingle()

    console.log('Hasil query berdasarkan UID dan NIK:', worker)
    console.log('Error query berdasarkan UID:', workerError)

    if (workerError) {
      throw new Error(
        `Gagal memverifikasi data pekerja: ${workerError.message}`
      )
    }

    if (!worker) {
      throw new Error(
        'Data pekerja tidak cocok dengan UID akun yang sedang login.'
      )
    }

    if (!worker.id || !worker.auth_user_id) {
      throw new Error('Data pekerja tidak lengkap.')
    }

    // 6. Hanya kirim event jika semua pemeriksaan berhasil.
    loginSucceeded = true

    emit('login-success', {
      nik: worker.nik,
      worker
    })
  } catch (error) {
    console.error('Login pekerja gagal:', error)

    loginError.value =
      error.message || 'Login gagal. Silakan coba lagi.'
  } finally {
    // Hapus sesi yang terbentuk jika pemeriksaan login gagal.
    if (authAttempted && !loginSucceeded) {
      try {
        await supabase.auth.signOut()
      } catch (sessionError) {
        console.error('Gagal membersihkan sesi:', sessionError)
      }
    }

    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <main class="login-card">
      <header class="login-header">
        <nav class="login-nav">
          <button
            type="button"
            class="nav-back"
            aria-label="Kembali ke halaman utama"
            @click="emit('back-to-landing')"
          >
            <img
              :src="iconUndo"
              alt=""
              width="24"
              height="24"
              aria-hidden="true"
            />
          </button>
        </nav>

        <figure class="login-brand">
          <img
            :src="logoPantauHadir"
            alt="Logo Pantau Hadir"
            width="100"
            height="100"
            class="brand-logo"
          />
        </figure>
      </header>

      <h1 class="h1 text-center login-title">MASUK</h1>

      <form class="stack-16" @submit.prevent="handleLogin">
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
              type="button"
              class="password-toggle-btn"
              @click="togglePassword"
              :aria-label="
                showPassword
                  ? 'Sembunyikan kata sandi'
                  : 'Tampilkan kata sandi'
              "
            >
              <img
                :src="showPassword ? iconEyeOff : iconEye"
                alt=""
                width="20"
                height="20"
              />
            </button>
          </div>
        </div>

        <p
          v-if="loginError"
          class="login-error"
          role="alert"
        >
          {{ loginError }}
        </p>

        <button
          type="submit"
          class="btn btn-primary btn-block login-btn"
          :disabled="isLoading"
        >
          <img
            :src="iconLogIn"
            alt=""
            width="20"
            height="20"
            aria-hidden="true"
          />

          {{ isLoading ? 'Memeriksa akun...' : 'Masuk' }}
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
  padding: 0;
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  cursor: pointer;
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

.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
}

.footer-img {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
```