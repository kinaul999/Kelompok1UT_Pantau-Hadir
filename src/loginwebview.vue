<template>
  <div class="login-container" :style="{ backgroundImage: `linear-gradient(rgba(13, 71, 161, 0.45), rgba(13, 71, 161, 0.45)), url(${bgImg})` }">
    <div class="login-card">
      <!-- Sisi Kiri (Branding & Logo) -->
      <div class="brand-section">
        <div class="logo-box">
          <!-- Ganti logoSrc sesuai variabel import di bawah -->
          <img :src="logoImg" alt="Pantau Hadir Logo" class="brand-logo" />
        </div>
        <h1 class="brand-title">Pantau Hadir</h1>
        <p class="brand-desc">
          Sistem informasi absensi pekerja proyek yang membantu perusahaan memantau kehadiran secara mudah, cepat, dan terintegrasi.
        </p>

        <ul class="feature-list">
          <li>
            <span class="icon-check">✓</span>
            Monitoring kehadiran pekerja
          </li>
          <li>
            <span class="icon-check">✦</span>
            Pemantauan lokasi proyek
          </li>
          <li>
            <span class="icon-check">📋</span>
            Laporan absensi terintegrasi
          </li>
        </ul>
      </div>

      <!-- Sisi Kanan (Form Login) -->
      <div class="form-section">
        <h2>Login Admin</h2>
        <p class="form-subtitle">Silakan masuk untuk mengelola data absensi.</p>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label>Username / Email</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                v-model="username" 
                placeholder="Masukkan username atau email" 
                required 
              />
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                v-model="password" 
                placeholder="Masukkan password" 
                required 
              />
            </div>
          </div>

          <div class="remember-me">
            <input type="checkbox" id="remember" />
            <label for="remember">Ingat saya</label>
          </div>

          <p v-if="errorMsg" class="error-text">Username atau password salah!</p>

          <button type="submit" class="btn-login">Masuk</button>
        </form>

        <footer class="footer-text">
          © 2026 Pantau Hadir App. Semua hak dilindungi.
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 📌 IMPORT GAMBAR LANGSUNG DISINI
// Sesuaikan nama file dengan yang ada di folder src/assets/images/ kamu
import logoImg from '@/assets/images/logo_pantau_hadir.png' 
import bgImg from '@/assets/images/image_login.png'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref(false)

const handleLogin = () => {
  if (username.value === 'admin' && password.value === 'admin123') {
    localStorage.setItem('statusLogin', 'true')
    router.push('/rekapitulasi')
  } else {
    errorMsg.value = true
  }
}
</script>

<style scoped>
/* Background menggunakan variabel dari import bgImg */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(rgba(13, 71, 161, 0.45), rgba(13, 71, 161, 0.45)),
    v-bind('`url(${bgImg}) center/cover no-repeat`');
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #4b83cf 0%, #2b61af 100%);
  padding: 40px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-box {
  background: #ffffff;
  width: 100px;
  height: 100px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  padding: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.brand-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}

.brand-desc {
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 30px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-bottom: 12px;
  opacity: 0.95;
}

.icon-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin-right: 12px;
  font-size: 11px;
}

.form-section {
  flex: 1.1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

.form-section h2 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 6px;
}

.form-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 28px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #94a3b8;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 38px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 24px;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #1d6ed8;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-login:hover {
  background: #1e40af;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-bottom: 12px;
}

.footer-text {
  margin-top: 32px;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
  }
}
</style>