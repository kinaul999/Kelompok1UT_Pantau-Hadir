<script setup>
import { reactive, ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.jpg'
import iconSave from '../assets/icons/save-check.svg'
import iconCancel from '../assets/icons/circle-x.svg'
import iconUsers from '../assets/icons/users.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'

const emit = defineEmits([
  'save-pekerja',
  'cancel-tambah-pekerja'
])

// State reaktif untuk form input
const form = reactive({
  nama: '',
  nik: '',
  lokasi: '',
  password: ''
})

// UX States untuk validasi dan loading info
const isSubmitting = ref(false)
const isLoadingSites = ref(true)
const validationError = ref('')

// 1. Ubah state daftarLokasi menjadi array kosong untuk menampung data dari Supabase
const daftarLokasi = ref([])

// State untuk fitur toggle mata password (tampil/sembunyi)
const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 2. Fungsi untuk mengambil data dari tabel 'Sites' di database
const fetchSitesData = async () => {
  try {
    isLoadingSites.value = true
    // Menarik kolom 'id' dan 'name' sesuai struktur tabel Sites di gambarmu
    const { data, error } = await supabase
      .from('Sites')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    daftarLokasi.value = data || []
  } catch (error) {
    console.error('Gagal memuat data lokasi:', error.message)
    validationError.value = 'Gagal mengambil daftar lokasi proyek dari server.'
  } finally {
    isLoadingSites.value = false
  }
}

// 3. Jalankan fetch otomatis saat halaman dibuka
onMounted(() => {
  fetchSitesData()
})

// 2. FUNGSI WRITE: Menyimpan data pekerja baru lengkap dengan Password & ID Lokasi (Target 2 Modul 8)
const handleSubmit = async () => {
  validationError.value = ''
  
  // Proses Sanitasi (.trim()) sesuai rubrik penilaian Modul 8
  const cleanNama = form.nama.trim()
  const cleanNik = form.nik.trim()
  const cleanPassword = form.password.trim()
  const selectedSiteId = form.lokasi // Berisi UUID dari opsi proyek yang dipilih

  // Form & Validasi Input: Cegah kirim data kosong ke database
  if (!cleanNama || !cleanNik || !selectedSiteId || !cleanPassword) {
    validationError.value = 'Semua kolom formulir wajib diisi!'
    return
  }

  // Validasi NIK minimal 5 digit (fleksibel mendukung ID Karyawan 5 digit maupun KTP 16 digit)
  if (cleanNik.length < 5) {
    validationError.value = 'NIK minimal berjumlah 5 digit!'
    return
  }

  try {
    // Aktifkan Loading State (Tombol berubah menjadi "Mengirim...")
    isSubmitting.value = true

    // Kirim data nyata ke tabel 'Workers' di database cloud Supabase
    // Kolom database: nik, name, site_id, password, status
    const { data, error } = await supabase
      .from('Workers') 
      .insert([
        {
          nik: cleanNik,           // Mengisi kolom 'nik' di Supabase
          name: cleanNama,         // Mengisi kolom 'name' di Supabase
          site_id: selectedSiteId, // Mengisi kolom 'site_id' dengan UUID Lokasi dari tabel Sites
          password: cleanPassword, // Mengisi kolom 'password' teks murni yang baru dibuat
          status: 'active'         // Mengisi kolom 'status' agar akun pekerja aktif untuk login
        }
      ])

    if (error) throw error

    // Bersihkan dari daftar ID/NIK yang pernah dihapus
    try {
      const raw = localStorage.getItem('pantau_hadir_deleted_worker_ids')
      if (raw) {
        const deletedIds = JSON.parse(raw)
        const filtered = deletedIds.filter(id => id !== cleanNik)
        localStorage.setItem('pantau_hadir_deleted_worker_ids', JSON.stringify(filtered))
      }
    } catch (e) {
      console.warn('LocalStorage update warning:', e)
    }

    // UX Toast/Feedback Berhasil disimpan
    alert('✅ Data pekerja berhasil disimpan dan dikaitkan dengan lokasi proyek!')
    emit('save-pekerja')
    handleResetForm()

  } catch (error) {
    console.error('Gagal menyimpan data:', error.message)
    validationError.value = 'Gagal menyimpan ke server: ' + error.message
  } finally {
    // Matikan loading state jika proses selesai (sukses/gagal)
    isSubmitting.value = false
  }
}

const handleResetForm = () => {
  form.nama = ''
  form.nik = ''
  form.lokasi = ''
  form.password = ''
  validationError.value = ''
}

const handleBatal = () => {
  handleResetForm()
  emit('cancel-tambah-pekerja')
}
</script>

<template>
  <div class="app-container">
    <!-- SIDEBAR -->
    <aside>
      <div class="logo">
        <img :src="logoPantauHadir" width="200" alt="Pantau Hadir - Sistem Absensi Pekerja Proyek">
      </div>

      <div class="sidebar-bawah">
        <p class="copyright">
          © 2026 Pantau Hadir App<br>Sistem Absensi Pekerja Proyek
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
          <img :src="iconUsers" alt="Foto profil admin">
        </div>
      </header>

      <!-- ISI HALAMAN -->
      <main>
        <h1>Tambah Data Pekerja</h1>
        <p>Masukkan data pekerja baru ke dalam sistem.</p>

        <!-- Pesan Error Validasi Tepat di Atas Form -->
        <div v-if="validationError" class="error-message-box">
          ⚠ {{ validationError }}
        </div>


        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="nama">Nama Pekerja</label>
            <input 
              type="text" 
              id="nama" 
              v-model="form.nama" 
              placeholder="Masukan nama lengkap pekerja"
              :disabled="isSubmitting"
              required
            >
          </div>

          <div class="field">
            <label for="nik">NIK</label>
            <input 
              type="text" 
              id="nik" 
              v-model="form.nik" 
              placeholder="Masukan NIK pekerja (min. 5 digit)" 
              maxlength="16"
              :disabled="isSubmitting"
              required
            >
          </div>

          <div class="field">
            <label for="lokasi">Lokasi Kerja</label>
            <select id="lokasi" v-model="form.lokasi" :disabled="isSubmitting || isLoadingSites" required>
              <option value="" disabled>{{ isLoadingSites ? 'Memuat lokasi proyek...' : (daftarLokasi.length ? 'Pilih lokasi proyek' : 'Tidak ada lokasi proyek tersedia') }}</option>
              
              <!-- Looping dynamic berdasarkan data baris dari tabel Sites Supabase -->
              <option v-for="site in daftarLokasi" :key="site.id" :value="site.id">
                {{ site.name }}
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
              :disabled="isSubmitting"
              required
            >
            <img 
              :src="showPassword ? iconEyeOff : iconEye" 
              alt="Toggle password"
              @click="togglePasswordVisibility"
            >
          </div>

          <div class="aksi">
            <button type="button" class="btn-batal" @click="handleBatal" :disabled="isSubmitting">
              Batal <img :src="iconCancel" alt="">
            </button>
            <!-- Tombol Terkunci & Berubah Teks Saat Loading Mengirim Data -->
            <button type="submit" class="btn-simpan" :disabled="isSubmitting">
              <span v-if="isSubmitting">Mengirim...</span>
              <span v-else>Simpan</span>
              <img :src="iconSave" alt="" v-if="!isSubmitting">
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<style scoped>

/* CSS Tambahan untuk Penanganan Error Box Pendukung Kriteria Modul 8 */
.error-message-box {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #fca5a5;
  margin: 16px auto 0;
  max-width: 820px;
  font-weight: 600;
  font-size: 14px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
  background: url("../assets/images/images-konstruksi-biru.jpg") no-repeat center bottom / contain;
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
  border: 1px solid #14146b;
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
