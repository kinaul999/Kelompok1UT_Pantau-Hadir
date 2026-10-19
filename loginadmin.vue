<template>
  <div class="login-container">
    <!-- Header -->
    <header>
      <img src="assets/images/logo-pantau-hadir.jpg" width="200" alt="Logo Hadir"[cite: 1]>
      <h2>Sistem Absensi Pekerja Proyek</h2>[cite: 1]
    </header>

    <!-- Konten Utama -->
    <main>
      <section>
        <h1>Masuk ke Akun Anda</h1>[cite: 1]
        <p>Masukkan NIK dan password Anda untuk mengakses sistem</p>[cite: 1]

        <form @submit.prevent="handleLogin">
          <div>
            <label for="nik">NIK</label>[cite: 1]
            <input 
              type="text" 
              id="nik" 
              v-model="nik" 
              placeholder="Masukkan Nomor Induk Karyawan Anda" 
              required
            >
          </div>

          <div>
            <label for="password">Kata Sandi</label>[cite: 1]
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              placeholder="Masukkan Kata Sandi Anda" 
              required
            >
            <button 
              type="button" 
              id="togglePassword" 
              @click="togglePasswordVisibility" 
              aria-label="Tampilkan/sembunyikan kata sandi"
            >
              <img 
                :src="showPassword ? 'icons/eye.svg' : 'assets/icons/eye-off.svg'" 
                width="10" 
                alt="Toggle sandi"
              >
            </button>
          </div>
            
          <button type="submit">
            <span class="btn-content">
              <img src="assets/icons/log-in.svg" width="15" alt="">
              MASUK KE SISTEM
            </span>
          </button>
        </form>

        <hr>

        <a href="#" @click.prevent="goToHome">
          <img src="assets/icons/house.svg" width="20" alt="">
          Kembali ke Beranda
        </a>
      </section>
    </main>

    <!-- Footer -->
    <footer>
      <p><small>© 2026 Pantau Hadir App — Sistem Absensi Pekerja Proyek</small></p>[cite: 1]
      <small>halaman ini dikerjakan oleh Adil Iskandar Z</small>[cite: 1]
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State untuk form input
const nik = ref('')
const password = ref('')
const showPassword = ref(false)

// Fungsi untuk toggle visibilitas kata sandi
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Fungsi ketika tombol masuk ditekan
const handleLogin = () => {
  console.log('Login dengan NIK:', nik.value)
  // Contoh redirect ke halaman admin dashboard menggunakan Vue Router:
  // router.push('/admin-dashboard')
}

// Fungsi kembali ke beranda
const goToHome = () => {
  // router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;1,700;1,800&display=swap');

:root {
  --orange: #f26419;
  --navy: #05005a;
  --card: rgba(218, 224, 243, 0.92);
  --ink: #000;
  --muted: #8a8fa3;
  --blue-soft: #b9d4f6;
  --blue-mid: #8fa6dc;
  --silhouette: #7f93c8;
}

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

/* Mengatur wrapper utama komponen (.login-container) agar mengambil alih fungsi body */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;
  color: var(--ink);
  background-color: #fff;
  background-image: url('assets/images/images-konstruksi-biru.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

/* ===== Header ===== */
header {
  display: flex;
  flex-direction: column;
}

header h2 {
  order: -1;
  background: var(--orange);
  color: #fff;
  font-style: italic;
  font-weight: 800;
  font-size: 1.15rem;
  text-align: right;
  padding: 0.6rem 1.1rem;
  letter-spacing: 0.1px;
}

/* ===== Konten utama ===== */
main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem 1rem 3rem;
}

main section {
  width: 100%;
  max-width: 350px;
  background: var(--card);
  border-radius: 20px;
  padding: 1.5rem 1.4rem 1.8rem;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(1px);
}

main h1 {
  font-size: 1.1rem;
  font-style: italic;
  font-weight: 800;
  line-height: 1.2;
}

main section > p {
  font-size: 0.62rem;
  margin: 0.15rem 0 1.6rem;
}

/* ===== Form ===== */
form { 
  padding: 0 0.9rem; 
}

form > div {
  position: relative;
  margin-bottom: 0.55rem;
}

label {
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  margin-bottom: 0.15rem;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  height: 2rem;
  padding: 0 1.8rem 0 0.55rem;
  font: inherit;
  font-size: 0.62rem;
  color: var(--ink);
  background: #fff;
  border: 1px solid #333;
  border-radius: 5px;
  outline: none;
}

input::placeholder { 
  color: var(--muted); 
}

input:focus-visible {
  border-color: var(--navy);
  box-shadow: 0 0 0 2px rgba(5, 0, 90, 0.25);
}

/* Tombol tampilkan/sembunyikan sandi */
#togglePassword {
  position: absolute;
  right: 0.4rem;
  bottom: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1.5rem;
  background: none;
  border: 0;
  cursor: pointer;
}

#togglePassword img { 
  width: 13px; 
  height: auto; 
  display: block; 
}

/* Tombol submit */
form > button[type="submit"] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  height: 1.6rem;
  margin-top: 1.4rem;
  font: inherit;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  background: var(--navy);
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s ease;
}

form > button[type="submit"]:hover { 
  background: #1a1480; 
}

form > button[type="submit"]:focus-visible { 
  outline: 2px solid var(--orange); 
  outline-offset: 2px; 
}

form > button[type="submit"] img {
  width: 12px;
  height: auto;
  filter: brightness(0) invert(1);
}

/* Pemisah & tautan beranda */
hr {
  border: 0;
  border-top: 1px solid #222;
  margin: 1rem 0.9rem 0.8rem;
}

main section > a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-style: italic;
  font-weight: 800;
  color: var(--navy);
  text-decoration: underline;
}

main section > a img { 
  width: 13px; 
  height: auto; 
}

/* ===== Footer ===== */
footer {
  text-align: center;
  padding: 0 1rem 0.9rem;
  font-size: 0.5rem;
  color: #4a5170;
}

footer small { 
  font-size: inherit; 
}

footer small + small { 
  display: none; 
}

/* ===== Layar kecil ===== */
@media (max-width: 480px) {
  header h2 { font-size: 0.95rem; }
  main section { max-width: 100%; }
  form { padding: 0; }
  hr { margin-inline: 0; }
}
</style>