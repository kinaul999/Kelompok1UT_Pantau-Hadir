
<script setup>
import { reactive, ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

import iconSave from '../assets/icons/save-check.svg'
import iconCancel from '../assets/icons/circle-x.svg'
import iconUsers from '../assets/icons/users.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'

const emit = defineEmits([
  'save-pekerja',
  'cancel-tambah-pekerja'
])

// Data formulir
const form = reactive({
  nama: '',
  nik: '',
  lokasi: '',
  password: ''
})

// State
const isSubmitting = ref(false)
const isLoadingSites = ref(true)
const validationError = ref('')
const daftarLokasi = ref([])
const showPassword = ref(false)

// Tampilkan / sembunyikan password
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Ambil daftar lokasi dari Supabase
const fetchSitesData = async () => {
  try {
    isLoadingSites.value = true
    validationError.value = ''

    const { data, error } = await supabase
      .from('Sites')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error

    daftarLokasi.value = data || []
  } catch (error) {
    console.error('Gagal memuat lokasi:', error)
    validationError.value =
      'Gagal mengambil daftar lokasi proyek dari server.'
  } finally {
    isLoadingSites.value = false
  }
}

onMounted(() => {
  fetchSitesData()
})

// Reset formulir
const handleResetForm = () => {
  form.nama = ''
  form.nik = ''
  form.lokasi = ''
  form.password = ''

  showPassword.value = false
  validationError.value = ''
}

// Tombol batal
const handleBatal = () => {
  handleResetForm()
  emit('cancel-tambah-pekerja')
}

// Simpan pekerja ke Supabase
const handleSubmit = async () => {
  if (isSubmitting.value) return

  validationError.value = ''

  const cleanNama = form.nama.trim()
  const cleanNik = form.nik.trim()
  const cleanPassword = form.password.trim()
  const selectedSiteId = form.lokasi

  if (
    !cleanNama ||
    !cleanNik ||
    !selectedSiteId ||
    !cleanPassword
  ) {
    validationError.value =
      'Semua kolom formulir wajib diisi!'
    return
  }

  if (cleanNik.length < 5) {
    validationError.value =
      'NIK minimal berjumlah 5 digit!'
    return
  }

  try {
    isSubmitting.value = true

    const { error } = await supabase
      .from('Workers')
      .insert([
        {
          nik: cleanNik,
          name: cleanNama,
          site_id: selectedSiteId,
          password: cleanPassword,
          status: 'active'
        }
      ])

    if (error) throw error

    // Hapus NIK dari daftar pekerja terhapus lokal
    try {
      const raw = localStorage.getItem(
        'pantau_hadir_deleted_worker_ids'
      )

      if (raw) {
        const deletedIds = JSON.parse(raw)

        if (Array.isArray(deletedIds)) {
          const filtered = deletedIds.filter(
            id => id !== cleanNik
          )

          localStorage.setItem(
            'pantau_hadir_deleted_worker_ids',
            JSON.stringify(filtered)
          )
        }
      }
    } catch (storageError) {
      console.warn(
        'Gagal memperbarui localStorage:',
        storageError
      )
    }

    alert('Data pekerja berhasil disimpan!')

    handleResetForm()
    emit('save-pekerja')
  } catch (error) {
    console.error('Gagal menyimpan pekerja:', error)

    if (error.code === '23505') {
      validationError.value =
        'NIK tersebut sudah terdaftar.'
    } else {
      validationError.value =
        'Gagal menyimpan ke server: ' + error.message
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="tambah-pekerja-page">

    <!-- HEADER FULL WIDTH -->
    <header class="page-header">
      <h2 class="company-name">
        PT. Jalan Baru
      </h2>

      <div class="admin-profile">
        <span>Admin</span>

        <div class="admin-avatar">
          <img :src="iconUsers" alt="Admin" />
        </div>
      </div>
    </header>

    <!-- AREA KONTEN -->
    <main class="page-content">

      <!-- BACKGROUND ILUSTRASI -->
      <div
        class="construction-background"
        aria-hidden="true"
      ></div>

      <!-- CARD FORM -->
      <section class="form-card">

        <div class="form-heading">
          <h1>Tambah Data Pekerja</h1>

          <p>
            Masukkan data pekerja baru ke dalam sistem.
          </p>
        </div>

        <!-- PESAN ERROR -->
        <div
          v-if="validationError"
          class="error-message-box"
          role="alert"
        >
          {{ validationError }}
        </div>

        <!-- FORMULIR -->
        <form @submit.prevent="handleSubmit">

          <!-- NAMA PEKERJA -->
          <div class="form-field">
            <label for="nama">
              Nama Pekerja
            </label>

            <input
              id="nama"
              v-model="form.nama"
              type="text"
              placeholder="Masukkan nama lengkap pekerja"
              autocomplete="name"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- NIK -->
          <div class="form-field">
            <label for="nik">
              NIK
            </label>

            <input
              id="nik"
              v-model="form.nik"
              type="text"
              maxlength="16"
              placeholder="Masukkan NIK pekerja (min. 5 digit)"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- LOKASI KERJA -->
          <div class="form-field">
            <label for="lokasi">
              Lokasi Kerja
            </label>

            <select
              id="lokasi"
              v-model="form.lokasi"
              :disabled="isSubmitting || isLoadingSites"
              required
            >
              <option value="" disabled>
                {{
                  isLoadingSites
                    ? 'Memuat lokasi proyek...'
                    : daftarLokasi.length
                      ? 'Pilih lokasi proyek'
                      : 'Tidak ada lokasi proyek tersedia'
                }}
              </option>

              <option
                v-for="site in daftarLokasi"
                :key="site.id"
                :value="site.id"
              >
                {{ site.name }}
              </option>
            </select>
          </div>

          <!-- PASSWORD -->
          <div class="form-field">
            <label for="password">
              Buat Password Baru
            </label>

            <div class="password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password baru"
                autocomplete="new-password"
                :disabled="isSubmitting"
                required
              />

              <button
                type="button"
                class="password-toggle"
                :disabled="isSubmitting"
                :aria-label="
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                "
                @click="togglePasswordVisibility"
              >
                <img
                  :src="showPassword ? iconEyeOff : iconEye"
                  alt=""
                />
              </button>
            </div>
          </div>

          <!-- TOMBOL AKSI -->
          <div class="form-actions">

            <button
              type="button"
              class="btn-cancel"
              :disabled="isSubmitting"
              @click="handleBatal"
            >
              <span>Batal</span>
              <img :src="iconCancel" alt="" />
            </button>

            <button
              type="submit"
              class="btn-save"
              :disabled="isSubmitting || isLoadingSites"
            >
              <span>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
              </span>

              <img
                v-if="!isSubmitting"
                :src="iconSave"
                alt=""
              />
            </button>

          </div>

        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ========================================
   HALAMAN TAMBAH PEKERJA
======================================== */

.tambah-pekerja-page {
  --tp-primary: #080264;
  --tp-orange: #f58220;
  --tp-border: #b9c8e8;

  width: 100%;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  background: #ffffff;

  font-family:
    "Plus Jakarta Sans",
    Arial,
    sans-serif;

  color: #111111;
  box-sizing: border-box;
}

.tambah-pekerja-page *,
.tambah-pekerja-page *::before,
.tambah-pekerja-page *::after {
  box-sizing: border-box;
}

/* ========================================
   HEADER
======================================== */

.page-header {
  width: 100%;
  min-height: 62px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 36px;

  background: var(--tp-orange);
  color: #ffffff;

  position: relative;
  z-index: 2;
}

.company-name {
  margin: 0;

  color: #ffffff;

  font-size: 22px;
  font-weight: 800;
  font-style: italic;

  letter-spacing: 0.2px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;

  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.admin-avatar {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid #ffffff;
  border-radius: 50%;
}

.admin-avatar img {
  width: 23px;
  height: 23px;

  object-fit: contain;

  filter: brightness(0) invert(1);
}

/* ========================================
   MAIN CONTENT
======================================== */

.page-content {
  position: relative;

  flex: 1;

  width: 100%;
  min-height: calc(100vh - 62px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 50px 28px;

  overflow: hidden;

  isolation: isolate;

  background:
    linear-gradient(
      180deg,
      #f5f9ff 0%,
      #ffffff 55%,
      #edf5ff 100%
    );
}

/* ========================================
   BACKGROUND KONSTRUKSI
======================================== */

.construction-background {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 75%;

  z-index: -1;
  pointer-events: none;

  background-image:
    url("../assets/images/images-konstruksi-biru.jpg");

  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% auto;

  opacity: 0.28;
}

/* ========================================
   FORM CARD
======================================== */

.form-card {
  position: relative;
  z-index: 1;

  width: 100%;
  max-width: 900px;

  padding: 34px 42px 38px;

  background: rgba(255, 255, 255, 0.96);

  border: 1px solid var(--tp-border);
  border-radius: 18px;

  box-shadow:
    0 12px 35px rgba(31, 65, 125, 0.09);
}

/* ========================================
   FORM HEADING
======================================== */

.form-heading {
  margin-bottom: 28px;

  text-align: center;
}

.form-heading h1 {
  margin: 0;

  color: #111111;

  font-size: clamp(27px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.25;
}

.form-heading p {
  margin: 10px 0 0;

  color: #41598c;

  font-size: 17px;
  font-weight: 400;
  line-height: 1.5;
}

/* ========================================
   FORM FIELD
======================================== */

.form-card form {
  width: 100%;
  margin: 0;
}

.form-field {
  width: 100%;
  margin-bottom: 20px;
}

.form-field label {
  display: block;

  margin-bottom: 9px;

  color: var(--tp-primary);

  font-size: 16px;
  font-weight: 700;
}

.form-field input,
.form-field select {
  display: block;

  width: 100%;
  height: 52px;

  padding: 0 16px;

  background: #f3f4f7;

  border: 1.5px solid var(--tp-border);
  border-radius: 9px;

  outline: none;

  color: #202020;

  font-family: inherit;
  font-size: 15px;
  font-weight: 400;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field input::placeholder {
  color: #777777;
  opacity: 1;
}

.form-field input:focus,
.form-field select:focus {
  border-color: var(--tp-primary);

  box-shadow:
    0 0 0 3px rgba(8, 2, 100, 0.10);
}

.form-field select {
  cursor: pointer;
  padding-right: 36px;
}

.form-field input:disabled,
.form-field select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* ========================================
   PASSWORD FIELD
======================================== */

.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper input {
  padding-right: 58px;
}

.password-toggle {
  position: absolute;

  right: 8px;
  top: 50%;

  transform: translateY(-50%);

  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 8px;

  background: transparent;

  cursor: pointer;
}

.password-toggle img {
  width: 21px;
  height: 21px;

  object-fit: contain;
}

.password-toggle:hover {
  background: rgba(8, 2, 100, 0.06);
}

/* ========================================
   BUTTON ACTIONS
======================================== */

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  flex-wrap: wrap;
  gap: 14px;

  margin-top: 30px;
}

.form-actions button {
  min-width: 145px;
  height: 49px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 12px;

  padding: 0 22px;

  border-radius: 9px;

  font-family: inherit;
  font-size: 16px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.form-actions button:not(:disabled):hover {
  transform: translateY(-2px);
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Tombol Batal */
.btn-cancel {
  background: #ffffff;

  color: var(--tp-primary);

  border: 1.5px solid var(--tp-primary);
}

.btn-cancel:hover {
  background: #f1f3ff;
}

/* Tombol Simpan */
.btn-save {
  background: var(--tp-primary);

  color: #ffffff;

  border: 1.5px solid var(--tp-primary);
}

.btn-save:hover {
  background: #15107c;
}

.btn-save img {
  filter: brightness(0) invert(1);
}

/* ========================================
   ERROR MESSAGE
======================================== */

.error-message-box {
  width: 100%;

  margin-bottom: 22px;
  padding: 13px 16px;

  color: #b91c1c;

  background: #fef2f2;

  border: 1px solid #fca5a5;
  border-radius: 9px;

  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

/* ========================================
   RESPONSIVE TABLET
======================================== */

@media (max-width: 1024px) {
  .page-content {
    padding: 36px 24px;
  }

  .form-card {
    max-width: 760px;
    padding: 30px 32px;
  }

  .construction-background {
    background-size: cover;
  }
}

/* ========================================
   RESPONSIVE MOBILE
======================================== */

@media (max-width: 600px) {
  .page-header {
    min-height: 58px;
    padding: 10px 18px;
  }

  .company-name {
    font-size: 17px;
  }

  .admin-profile {
    font-size: 13px;
    gap: 8px;
  }

  .admin-avatar {
    width: 30px;
    height: 30px;
  }

  .admin-avatar img {
    width: 20px;
    height: 20px;
  }

  .page-content {
    min-height: calc(100vh - 58px);

    align-items: flex-start;

    padding: 26px 14px;
  }

  .construction-background {
    background-size: cover;
    background-position: center bottom;
    opacity: 0.18;
  }

  .form-card {
    padding: 26px 20px;

    border-radius: 14px;
  }

  .form-heading {
    margin-bottom: 26px;
  }

  .form-heading h1 {
    font-size: 25px;
  }

  .form-heading p {
    font-size: 14px;
  }

  .form-field {
    margin-bottom: 18px;
  }

  .form-field label {
    font-size: 14px;
  }

  .form-field input,
  .form-field select {
    height: 48px;
    font-size: 14px;
  }

  .form-actions {
    gap: 10px;
    margin-top: 24px;
  }

  .form-actions button {
    flex: 1;
    min-width: 0;

    height: 46px;

    padding: 0 12px;

    font-size: 14px;
  }

  .form-actions img {
    width: 17px;
    height: 17px;
  }
}
</style>
