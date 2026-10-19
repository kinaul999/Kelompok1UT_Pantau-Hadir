<template>
  <div class="app-container">
    <!-- SIDEBAR -->
    <aside>
      <div class="logo">
        <img src="assets/images/logo-pantau-hadir.jpg" width="200" alt="Pantau Hadir - Sistem Absensi Pekerja Proyek">
      </div>

      <nav>
        <ul>
          <li><a href="admin-dashboard.html">Dashboard</a></li>
          <li><a href="rekapitulasi-absensi.html">Rekap Absensi</a></li>
          <li><a href="data-pekerja.html" class="aktif">Data Pekerja</a></li>
        </ul>
      </nav>

      <div class="sidebar-bawah">
        <button type="button" class="btn-keluar" @click="handleKeluar">
          Keluar <img src="assets/icons/log-out.svg" alt="">
        </button>

        <p class="copyright">
          © 2026 Pantau Hadir App<br>Sistem Absensi Pekerja Proyek
          <small>Halaman ini dibuat Oleh Adil Iskandar Z</small>
        </p>
      </div>
    </aside>

    <!-- KONTEN UTAMA -->
    <div class="konten">
      <!-- HEADER -->
      <header>
        <h2>PT. Jalan Baru</h2>
        <div class="admin">
          <span>Admin</span>
          <img src="assets/icons/users.svg" alt="Foto profil admin">
        </div>
      </header>

      <!-- ISI HALAMAN -->
      <main>
        <h1>Tambah Data Pekerja</h1>
        <p>Masukkan data pekerja baru ke dalam sistem.</p>

        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="nama">Nama Pekerja</label>
            <input 
              type="text" 
              id="nama" 
              v-model="form.nama" 
              placeholder="Masukan nama lengkap pekerja"
              required
            >
          </div>

          <div class="field">
            <label for="nik">NIK</label>
            <input 
              type="text" 
              id="nik" 
              v-model="form.nik" 
              placeholder="Masukan 16 digit NIK" 
              maxlength="16"
              required
            >
          </div>

          <div class="field">
            <label for="lokasi">Lokasi Kerja</label>
            <select id="lokasi" v-model="form.lokasi" required>
              <option value="">Pilih lokasi proyek</option>
              <option v-for="lokasi in daftarLokasi" :key="lokasi" :value="lokasi">
                {{ lokasi }}
              </option>
            </select>
          </div>

          <div class="field field-password">
            <label for="password">Buat Password Baru</label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              placeholder="Masukan password baru"
              required
            >
            <img 
              :src="showPassword ? 'assets/icons/eye.svg' : 'assets/icons/eye-off.svg'" 
              alt="Toggle password"
              @click="togglePasswordVisibility"
            >
          </div>

          <div class="aksi">
            <button type="button" class="btn-batal" @click="handleBatal">
              Batal <img src="assets/icons/circle-x.svg" alt="">
            </button>
            <button type="submit" class="btn-simpan">
              Simpan <img src="assets/icons/Check.svg" alt="">
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// State reaktif untuk form input
const form = reactive({
  nama: '',
  nik: '',
  lokasi: '',
  password: ''
})

// State untuk opsi lokasi kerja (bisa disesuaikan atau diambil dari API)
const daftarLokasi = ref([
  'Proyek Gedung A - Jakarta Selatan',
  'Proyek Apartemen B - Jakarta Pusat',
  'Proyek Infrastruktur C - Tangerang'
])

// State untuk toggle tampil/sembunyi password
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Handler tombol simpan
const handleSubmit = () => {
  console.log('Data pekerja disubmit:', { ...form })
  alert('Data pekerja berhasil disimpan!')
  // Tambahkan logika pemanggilan API / router push di sini
}

// Handler tombol batal
const handleBatal = () => {
  form.nama = ''
  form.nik = ''
  form.lokasi = ''
  form.password = ''
  // Atau arahkan kembali ke halaman data pekerja, misal: router.push('/data-pekerja')
}

// Handler tombol keluar
const handleKeluar = () => {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    console.log('Admin keluar')
  }
}
</script>

<style scoped>
:root {
  --biru-sidebar: #b3c0e4;
  --biru-tua: #0a0a5c;
  --biru-teks: #14146b;
  --oranye: #f2661a;
  --abu-input: #d9d9d9;
  --putih: #ffffff;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.app-container {
  display: flex;
  min-height: 100vh;
  font-family: "Plus Jakarta Sans", Arial, sans-serif;
  color: #000;
  background: var(--putih);
  width: 100%;
}

/* ================= SIDEBAR ================= */
aside {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 10;
  width: 250px;
  flex-shrink: 0;
  background: #b3c0e4;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
}

.logo { padding: 0 20px 40px; text-align: center; }
.logo img { max-width: 100%; height: auto; display: block; }

aside nav { width: 100%; }
aside nav ul { list-style: none; }

aside nav a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  color: #14146b;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background .2s;
}
aside nav a:hover { background: rgba(255, 255, 255, .45); }
aside nav a.aktif { background: #ffffff; }

.sidebar-bawah {
  margin-top: auto;
  width: 100%;
  padding: 0 24px;
  text-align: center;
}

.btn-keluar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  color: #14146b;
  border: 1px solid #14146b;
  border-radius: 8px;
  font: 600 14px "Plus Jakarta Sans", Arial, sans-serif;
  cursor: pointer;
}
.btn-keluar:hover { background: #eef1fb; }
.btn-keluar img { width: 14px; height: 14px; }

.copyright {
  margin-top: 14px;
  font-size: 9px;
  line-height: 1.4;
  color: #14146b;
}
.copyright small { display: block; margin-top: 6px; font-size: 9px; opacity: .8; }

/* ================= KONTEN UTAMA ================= */
.konten {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #f2661a;
  color: #ffffff;
}
header h2 {
  font-size: 20px;
  font-style: italic;
  font-weight: 600;
}
.admin { display: flex; align-items: center; gap: 12px; font-size: 15px; }
.admin img {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: #ffffff;
  padding: 2px;
}

main {
  flex: 1;
  position: relative;
  padding: 32px 44px 200px;
  background: url("assets/images/images-konstruksi-biru.jpg") no-repeat center bottom / contain;
}

main h1 { font-size: 32px; font-weight: 700; line-height: 1.2; }
main > p { font-size: 18px; margin-top: 2px; }

form {
  max-width: 820px;
  margin: 24px auto 0;
  padding: 0 8px;
}

.field { position: relative; margin-bottom: 14px; }

label {
  display: block;
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 400;
}

input, select {
  display: block;
  width: 100%;
  padding: 9px 12px;
  background: #d9d9d9;
  border: 1px solid transparent;
  border-radius: 2px;
  font: 400 13px "Plus Jakarta Sans", Arial, sans-serif;
  color: #000;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
input::placeholder { color: #333; }
input:focus, select:focus {
  border-color: #0a0a5c;
  box-shadow: 0 0 0 2px rgba(10, 10, 92, .15);
}
select { appearance: auto; cursor: pointer; }

.field-password img {
  position: absolute;
  right: 12px;
  bottom: 11px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.field-password input { padding-right: 40px; }

.aksi {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.aksi button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font: 600 14px "Plus Jakarta Sans", Arial, sans-serif;
  cursor: pointer;
  transition: filter .2s, background .2s;
}
.aksi img { width: 14px; height: 14px; }

.btn-batal {
  background: #ffffff;
  color: #14146b;
  border: 1px: 1px solid #14146b;
}
.btn-batal:hover { background: #eef1fb; }

.btn-simpan {
  background: #0a0a5c;
  color: #ffffff;
  border: 1px solid #0a0a5c;
}
.btn-simpan img { filter: invert(1); }
.btn-simpan:hover { filter: brightness(1.25); }

@media (max-width: 768px) {
  aside { width: 180px; }
  .konten { margin-left: 180px; }
  .logo { padding: 0 12px 24px; }
  aside nav a { height: 48px; font-size: 13px; }
  main { padding: 24px 20px 160px; }
  main h1 { font-size: 26px; }
}
</style>
