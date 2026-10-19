<script setup>
import { ref, computed } from 'vue'

import iconLogOut from '../assets/icons/log-out.svg'
import iconArrowLeft from '../assets/icons/arrow-left.svg'
import iconArrowRight from '../assets/icons/arrow-right.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'

const emit = defineEmits(['logout-trigger'])

const handleLogoutClick = () => {
  emit('logout-trigger')
}

const historyRecords = ref([
  { id: 1, dateLabel: '2-Oct-26', isoDate: '2026-10-02', timeLabel: '7:32:01 AM', isoTime: '2026-10-02T07:32:01+07:00', location: 'Site A' },
  { id: 2, dateLabel: '1-Oct-26', isoDate: '2026-10-01', timeLabel: '4:05:44 PM', isoTime: '2026-10-01T16:05:44+07:00', location: 'Site A' },
  { id: 3, dateLabel: '1-Oct-26', isoDate: '2026-10-01', timeLabel: '7:29:32 AM', isoTime: '2026-10-01T07:29:32+07:00', location: 'Site A' },
  { id: 4, dateLabel: '30-Sep-26', isoDate: '2026-09-30', timeLabel: '4:13:48 PM', isoTime: '2026-09-30T16:13:48+07:00', location: 'Site A' },
  { id: 5, dateLabel: '30-Sep-26', isoDate: '2026-09-30', timeLabel: '7:40:01 AM', isoTime: '2026-09-30T07:40:01+07:00', location: 'Site A' },
  { id: 6, dateLabel: '29-Sep-26', isoDate: '2026-09-29', timeLabel: '4:10:15 PM', isoTime: '2026-09-29T16:10:15+07:00', location: 'Site A' },
  { id: 7, dateLabel: '29-Sep-26', isoDate: '2026-09-29', timeLabel: '7:35:20 AM', isoTime: '2026-09-29T07:35:20+07:00', location: 'Site A' },
  { id: 8, dateLabel: '28-Sep-26', isoDate: '2026-09-28', timeLabel: '4:08:50 PM', isoTime: '2026-09-28T16:08:50+07:00', location: 'Site A' },
  { id: 9, dateLabel: '28-Sep-26', isoDate: '2026-09-28', timeLabel: '7:28:44 AM', isoTime: '2026-09-28T07:28:44+07:00', location: 'Site A' },
  { id: 10, dateLabel: '27-Sep-26', isoDate: '2026-09-27', timeLabel: '7:30:10 AM', isoTime: '2026-09-27T07:30:10+07:00', location: 'Site A' }
])

const pageSize = 5
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(historyRecords.value.length / pageSize))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return historyRecords.value.slice(start, start + pageSize)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}
</script>

<template>
  <div class="mobile-shell">
    <header class="success-topbar">
      <nav aria-label="Navigasi Header">
        <button
          type="button"
          class="btn-exit"
          aria-label="Keluar ke halaman utama"
          @click="handleLogoutClick"
        >
          <img :src="iconLogOut" alt="" width="20" height="20" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </nav>
    </header>

    <main class="success-main">
      <section class="success-content" aria-labelledby="success-heading">
        <div class="success-badge" role="img" aria-label="Tanda Berhasil">
          <svg
            class="check-glyph"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12.5L9.5 18L20 6.5"
              stroke="#ffffff"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1 id="success-heading" class="success-title">
          ABSEN ANDA TERKIRIM!
        </h1>

        <div class="history-card">
          <h2 class="history-title">Riwayat Absensi</h2>

          <div class="table-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th scope="col">Hari/Tgl</th>
                  <th scope="col">Waktu</th>
                  <th scope="col">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedRecords" :key="item.id">
                  <td>
                    <time :datetime="item.isoDate">{{ item.dateLabel }}</time>
                  </td>
                  <td>
                    <time :datetime="item.isoTime">{{ item.timeLabel }}</time>
                  </td>
                  <td>{{ item.location }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-controls" aria-label="Navigasi Halaman Riwayat">
            <button
              type="button"
              class="pagination-btn"
              :disabled="currentPage === 1"
              aria-label="Entri Sebelumnya"
              @click="prevPage"
            >
              <img :src="iconArrowLeft" alt="" width="20" height="20" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              aria-label="Entri Selanjutnya"
              @click="nextPage"
            >
              <img :src="iconArrowRight" alt="" width="20" height="20" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>

    <footer class="success-footer">
      <img
        :src="logoPantauHadir"
        alt="Logo Pantau Hadir - Sistem Absensi Pekerja Proyek"
        width="140"
        height="76"
        class="brand-logo"
      />
    </footer>
  </div>
</template>

<style scoped>
.success-topbar {
  background-color: var(--color-header, #f58220);
  padding: 16px 20px;
}

.btn-exit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-primary, #080264);
  border: 2px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  padding: 8px 18px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.btn-exit:hover {
  background-color: #f2f4fa;
}

.btn-exit:focus-visible {
  outline: 3px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.btn-exit:active {
  transform: scale(0.98);
}

.success-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.success-badge {
  width: 136px;
  height: 136px;
  border-radius: 50%;
  background-color: #00d616;
  border: 2.5px solid #00d616;
  outline: 2px solid #00d616;
  outline-offset: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto 20px;
}

.check-glyph {
  width: 70px;
  height: 70px;
}

.success-title {
  font-family: var(--font-family);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--color-text-strong, #111111);
  text-align: center;
  letter-spacing: 0.02em;
  margin: 0 0 24px;
}

.history-card {
  width: 100%;
  background-color: var(--color-secondary, #b2c0e3);
  border-radius: var(--radius-lg, 16px);
  padding: 16px 14px 18px;
  box-shadow: 0 4px 14px rgba(8, 2, 100, 0.08);
}

.history-title {
  font-family: var(--font-family);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary, #080264);
  margin: 0 0 12px 2px;
  text-align: left;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface, #ffffff);
  border: 2px solid var(--color-primary, #080264);
}

.history-table th,
.history-table td {
  border: 1.5px solid var(--color-primary, #080264);
  padding: 7px 8px;
  text-align: center;
  font-size: 13.5px;
}

.history-table th {
  background-color: var(--color-primary, #080264);
  color: var(--color-text-inverse, #ffffff);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.history-table td {
  color: var(--color-primary, #080264);
  font-weight: 700;
  background-color: #ffffff;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
}

.pagination-btn {
  width: 42px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  border: 1.5px solid var(--color-primary, #080264);
  background-color: var(--color-surface, #ffffff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f2f4fa;
}

.pagination-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.pagination-btn:focus-visible {
  outline: 2px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.success-footer {
  display: flex;
  justify-content: center;
  padding: 16px 20px 24px;
  margin-top: auto;
}

.brand-logo {
  display: block;
  max-width: 140px;
  height: auto;
}
</style>
