
<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

import iconLogOut from '../assets/icons/log-out.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.webp'

const props = defineProps({
  worker: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['logout-trigger'])

const attendanceHistory = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const itemsPerPage = 5

// Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(attendanceHistory.value.length / itemsPerPage))
)

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return attendanceHistory.value.slice(
    start,
    start + itemsPerPage
  )
})

// Format tanggal
const formatDate = (value) => {
  if (!value) return '-'

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

// Format waktu
const formatTime = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date(value))
}

// Mengambil riwayat absensi pekerja
const loadAttendanceHistory = async () => {
  if (!props.worker?.id) {
    errorMessage.value =
      'Identitas pekerja tidak ditemukan. Silakan login kembali.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('attendances')
      .select(`
        id,
        worker_id,
        site_id,
        attendance_date,
        check_in,
        check_out,
        status
      `)
      .eq('worker_id', props.worker.id)
      .order('attendance_date', { ascending: false })
      .order('check_in', { ascending: false })

    if (error) throw error

    const records = data || []

    // Mengambil nama site
    const siteIds = [
      ...new Set(
        records
          .map(record => record.site_id)
          .filter(Boolean)
      )
    ]

    let siteNameById = {}

    if (siteIds.length > 0) {
      const { data: sites, error: siteError } = await supabase
        .from('Sites')
        .select('id, name')
        .in('id', siteIds)

      if (siteError) throw siteError

      siteNameById = Object.fromEntries(
        (sites || []).map(site => [
          String(site.id),
          site.name
        ])
      )
    }

    attendanceHistory.value = records.map(record => ({
      ...record,
      site_name: siteNameById[String(record.site_id)] || '-'
    }))

    currentPage.value = 1

  } catch (error) {
    console.error('Gagal memuat riwayat absensi:', error)

    errorMessage.value =
      error.message ||
      'Riwayat absensi gagal dimuat. Silakan coba lagi.'

  } finally {
    isLoading.value = false
  }
}

// Pagination sebelumnya
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Pagination berikutnya
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Logout
const handleLogoutClick = () => {
  emit('logout-trigger')
}

onMounted(loadAttendanceHistory)
</script>

<template>
  <div class="mobile-shell">

    <!-- HEADER -->
    <header class="success-topbar">
      <nav aria-label="Navigasi Header">
        <button
          type="button"
          class="btn-exit"
          @click="handleLogoutClick"
        >
          <img
            :src="iconLogOut"
            alt=""
            width="20"
            height="20"
          />
          <span>Keluar</span>
        </button>
      </nav>
    </header>

    <!-- MAIN -->
    <main class="success-main">

      <section class="success-content">

        <!-- ICON ABSEN BERHASIL -->
        <div
          class="success-badge"
          role="img"
          aria-label="Absensi berhasil"
        >
          <svg
            class="check-glyph"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12.5L9.5 18L20 6.5"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1 class="success-title">
          ABSEN ANDA TERKIRIM!
        </h1>

        <!-- RIWAYAT ABSENSI -->
        <section class="history-card">

          <div class="history-heading-row">
            <h2>Riwayat Absensi</h2>

            <button
              type="button"
              class="refresh-button"
              aria-label="Muat ulang riwayat"
              :disabled="isLoading"
              @click="loadAttendanceHistory"
            >
              ↻
            </button>
          </div>

          <!-- LOADING -->
          <p
            v-if="isLoading"
            class="history-message"
          >
            Memuat riwayat absensi...
          </p>

          <!-- ERROR -->
          <div
            v-else-if="errorMessage"
            class="history-message history-error"
            role="alert"
          >
            {{ errorMessage }}

            <button
              type="button"
              class="retry-button"
              @click="loadAttendanceHistory"
            >
              Coba lagi
            </button>
          </div>

          <!-- DATA KOSONG -->
          <p
            v-else-if="attendanceHistory.length === 0"
            class="history-message"
          >
            Belum ada riwayat absensi.
          </p>

          <!-- TABEL RIWAYAT -->
          <template v-else>

            <div class="table-scroll">

              <table class="history-table">

                <thead>
                  <tr>
                    <th scope="col">
                      Tanggal
                    </th>

                    <th scope="col">
                      <span>Absen</span>
                      <span>Masuk</span>
                    </th>

                    <th scope="col">
                      <span>Absen</span>
                      <span>Pulang</span>
                    </th>

                    <th scope="col">
                      Lokasi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="record in paginatedHistory"
                    :key="record.id"
                  >
                    <td>
                      {{ formatDate(record.attendance_date) }}
                    </td>

                    <td>
                      {{ formatTime(record.check_in) }}
                    </td>

                    <td>
                      {{ formatTime(record.check_out) }}
                    </td>

                    <td>
                      {{ record.site_name }}
                    </td>
                  </tr>
                </tbody>

              </table>

            </div>

            <!-- PAGINATION -->
            <div class="pagination">

              <button
                type="button"
                class="page-button"
                aria-label="Halaman sebelumnya"
                :disabled="currentPage <= 1"
                @click="previousPage"
              >
                ←
              </button>

              <span class="page-indicator">
                {{ currentPage }} / {{ totalPages }}
              </span>

              <button
                type="button"
                class="page-button"
                aria-label="Halaman berikutnya"
                :disabled="currentPage >= totalPages"
                @click="nextPage"
              >
                →
              </button>

            </div>

          </template>

        </section>

      </section>

    </main>

    <!-- FOOTER -->
    <footer class="success-footer">
  <img
    :src="logoPantauHadir"
    alt="Logo Pantau Hadir"
    class="brand-logo"
    loading="lazy"
    decoding="async"
  />
</footer>

  </div>
</template>

<style scoped>
/* =========================
   LAYOUT UTAMA
========================= */

.mobile-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.success-topbar {
  flex-shrink: 0;
  background-color: var(--color-header, #f58220);
  padding: 12px 20px;
}

.success-topbar nav {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* =========================
   TOMBOL KELUAR
========================= */

.btn-exit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #ffffff;
  color: #080264;
  border: 2px solid #080264;
  border-radius: 8px;
  padding: 8px 18px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.btn-exit:hover {
  background-color: #f2f4fa;
}

/* =========================
   KONTEN ABSEN SUKSES
========================= */

.success-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
}

.success-badge {
  width: 112px;
  height: 112px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #00d616;
  border: 2px solid #00d616;
  outline: 1.5px solid #00d616;
  outline-offset: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px auto 18px;
}

.check-glyph {
  width: 58px;
  height: 58px;
}

.success-title {
  font-family: var(--font-family, sans-serif);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  color: #111111;
  text-align: center;
  margin: 0 0 30px;
}

/* =========================
   KARTU RIWAYAT ABSENSI
========================= */

.history-card {
  width: 100%;
  box-sizing: border-box;
  background: #b8c7e8;
  border-radius: 13px;
  padding: 12px 10px 10px;
  color: #080264;
}

.history-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 2px 7px;
}

.history-heading-row h2 {
  margin: 0;
  font-size: 13px;
  line-height: 1.3;
  font-weight: 700;
  color: #080264;
}

/* =========================
   TOMBOL REFRESH
========================= */

.refresh-button {
  width: 26px;
  height: 26px;
  border: 1px solid #080264;
  border-radius: 7px;
  background: #ffffff;
  color: #080264;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* =========================
   TABEL ABSENSI
========================= */

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1.5px solid #080264;
  border-radius: 7px;
  background: #ffffff;
}

.history-table {
  width: 100%;
  min-width: 440px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 11px;
  color: #111111;
}

.history-table th,
.history-table td {
  padding: 6px 4px;
  border: 1px solid #080264;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-table th {
  background: #080264;
  color: #ffffff;
  font-weight: 700;

  /* Header dapat menjadi dua baris */
  white-space: normal;
  line-height: 1.3;
  padding: 7px 3px;
}

/* Memisahkan tulisan menjadi dua baris */
.history-table th span {
  display: block;
}

/* Lebar setiap kolom */

.history-table th:nth-child(1),
.history-table td:nth-child(1) {
  width: 23%;
}

.history-table th:nth-child(2),
.history-table td:nth-child(2) {
  width: 24%;
}

.history-table th:nth-child(3),
.history-table td:nth-child(3) {
  width: 24%;
}

.history-table th:nth-child(4),
.history-table td:nth-child(4) {
  width: 29%;
}

/* =========================
   LOADING DAN ERROR
========================= */

.history-message {
  margin: 8px 2px;
  padding: 14px 8px;
  border-radius: 7px;
  background: #ffffff;
  color: #303b5b;
  text-align: center;
  font-size: 12px;
  line-height: 1.5;
}

.history-error {
  color: #991b1b;
}

.retry-button {
  display: block;
  margin: 8px auto 0;
  padding: 6px 12px;
  border: 1px solid #080264;
  border-radius: 6px;
  background: #ffffff;
  color: #080264;
  cursor: pointer;
}

/* =========================
   PAGINATION
========================= */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.page-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 27px;
  border: 1px solid #080264;
  border-radius: 7px;
  background: #ffffff;
  color: #080264;
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  min-width: 48px;
  text-align: center;
  color: #080264;
  font-size: 11px;
}

/* =========================
   FOOTER LOGO
========================= */

.success-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 12px 20px 20px;
  margin-top: auto;
}

.brand-logo {
  display: block;
  width: 125px;
  max-width: 100%;
  height: auto;
}

/* =========================
   RESPONSIVE TABLET / DESKTOP
========================= */

@media (min-width: 600px) {
  .success-main {
    padding: 32px 24px;
  }

  .history-card {
    padding: 16px;
  }

  .history-table {
    font-size: 13px;
    min-width: 0;
  }

  .history-table th,
  .history-table td {
    padding: 8px 6px;
  }
}

/* =========================
   RESPONSIVE HP KECIL
========================= */

@media (max-width: 380px) {
  .success-main {
    padding: 18px 12px;
  }

  .history-table {
    font-size: 10px;
  }
}
</style>
