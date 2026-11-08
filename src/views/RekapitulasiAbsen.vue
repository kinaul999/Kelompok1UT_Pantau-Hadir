
<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick
} from 'vue'

import { supabase } from '../lib/supabase'

import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import iconLogOut from '../assets/icons/log-out.svg'
import iconScanFace from '../assets/icons/scan-face.svg'
import iconSquarePen from '../assets/icons/square-pen.svg'
import iconUsers from '../assets/icons/users.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru-removebg-preview.webp'
import iconFunnel from '../assets/icons/funnel.svg'
import iconFileDown from '../assets/icons/file-down.svg'
import iconSearch from '../assets/icons/search.svg'
import iconArrowLeftToLine from '../assets/icons/arrow-left-to-line.svg'
import iconArrowLeft from '../assets/icons/arrow-left.svg'
import iconArrowRight from '../assets/icons/arrow-right.svg'
import iconArrowRightToLine from '../assets/icons/arrow-right-to-line.svg'

const emit = defineEmits([
  'admin-logout-trigger',
  'rekapitulasi-absen-trigger',
  'admin-dashboard-trigger',
  'data-pekerja-trigger'
])

// SIDEBAR MOBILE
const isMobileMenuOpen = ref(false)

const navigateAdmin = (action) => {
  isMobileMenuOpen.value = false

  const actions = {
    dashboard: 'admin-dashboard-trigger',
    rekap: 'rekapitulasi-absen-trigger',
    pekerja: 'data-pekerja-trigger',
    logout: 'admin-logout-trigger'
  }

  emit(actions[action])
}

// DATA ABSENSI
const listPresensi = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const searchQuery = ref('')

// FILTER
const selectedStatus = ref('')
const selectedSite = ref('')
const startDate = ref('')
const endDate = ref('')

const currentPage = ref(1)
const itemsPerPage = 15

let attendanceChannel = null

// DAFTAR SITE UNTUK FILTER
const availableSites = computed(() => {
  return [
    ...new Set(
      listPresensi.value
        .map(item => item.Site)
        .filter(site => site && site !== '-')
    )
  ].sort((a, b) => a.localeCompare(b, 'id'))
})

// RESET FILTER
const resetFilters = () => {
  selectedStatus.value = ''
  selectedSite.value = ''
  startDate.value = ''
  endDate.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

// VALIDASI RENTANG TANGGAL
const dateFilterError = computed(() => {
  if (
    startDate.value &&
    endDate.value &&
    startDate.value > endDate.value
  ) {
    return 'Tanggal mulai tidak boleh melebihi tanggal akhir.'
  }

  return ''
})

// MEMBUAT SIGNED URL FOTO
const getAttendancePhotoUrl = async (path) => {
  if (!path || path === '-') return null

  const { data, error } = await supabase.storage
    .from('attendance-photos')
    .createSignedUrl(path, 3600)

  if (error) {
    console.error('Gagal membuat link foto:', error)
    return null
  }

  return data?.signedUrl || null
}

// FORMAT TANGGAL WIB
const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(
    value + (value.length === 10 ? 'T00:00:00+07:00' : '')
  )

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

// FORMAT WAKTU WIB
const formatTime = (value) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date(value))
}

// MENENTUKAN STATUS ABSENSI
const calculateStatus = (checkIn) => {
  if (!checkIn) return '-'

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(checkIn))

  const hour = Number(
    parts.find(part => part.type === 'hour')?.value
  )

  const minute = Number(
    parts.find(part => part.type === 'minute')?.value
  )

  if (hour >= 8 || (hour === 8 && minute >= 0)) {
    return 'Terlambat'
  }

  return 'Hadir'
}

// MEMUAT DATA ABSENSI
const loadAttendance = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data: attendanceRows, error: attendanceError } =
      await supabase
        .from('attendances')
        .select('*')
        .order('attendance_date', { ascending: false })
        .order('check_in', { ascending: false })

    if (attendanceError) throw attendanceError

    if (!attendanceRows || attendanceRows.length === 0) {
      listPresensi.value = []
      currentPage.value = 1

      await nextTick()
      updateScrollbar()

      return
    }

    const workerIds = [
      ...new Set(
        attendanceRows.map(row => row.worker_id).filter(Boolean)
      )
    ]

    const siteIds = [
      ...new Set(
        attendanceRows.map(row => row.site_id).filter(Boolean)
      )
    ]

    let workers = []
    let sites = []

    if (workerIds.length > 0) {
      const { data, error } = await supabase
        .from('Workers')
        .select('id, name, nik, site_id')
        .in('id', workerIds)

      if (error) throw error

      workers = data || []
    }

    if (siteIds.length > 0) {
      const { data, error } = await supabase
        .from('Sites')
        .select('*')
        .in('id', siteIds)

      if (error) throw error

      sites = data || []
    }

    const workerMap = new Map(
      workers.map(worker => [worker.id, worker])
    )

    const siteMap = new Map(
      sites.map(site => [site.id, site])
    )

    listPresensi.value = await Promise.all(
      attendanceRows.map(async (row) => {
        const worker = workerMap.get(row.worker_id)
        const site = siteMap.get(row.site_id)

        const [buktiMasukUrl, buktiPulangUrl] =
          await Promise.all([
            getAttendancePhotoUrl(row.check_in_photo),
            getAttendancePhotoUrl(row.check_out_photo)
          ])

        return {
          id: row.id,

          Nama:
            worker?.name ||
            worker?.nik ||
            'Pekerja tidak ditemukan',

          NIK: worker?.nik || '-',

          Site:
            site?.name ||
            site?.site_name ||
            site?.nama_site ||
            site?.project_name ||
            '-',

          Tanggal: formatDate(row.attendance_date),

          // Tanggal asli untuk proses filter
          TanggalISO: row.attendance_date,

          'Jam Masuk': formatTime(row.check_in),
          'Bukti Masuk': buktiMasukUrl,

          'Jam Pulang': formatTime(row.check_out),
          'Bukti Pulang': buktiPulangUrl,

          Status: calculateStatus(row.check_in)
        }
      })
    )

    currentPage.value = 1

    await nextTick()
    updateScrollbar()

  } catch (error) {
    console.error('Gagal memuat rekap absensi:', error)

    errorMessage.value =
      error?.message ||
      'Gagal mengambil data absensi dari Supabase.'

  } finally {
    isLoading.value = false
  }
}

// PENCARIAN DAN FILTER
const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return listPresensi.value.filter(item => {
    const matchName =
      item.Nama.toLowerCase().includes(query) ||
      item.NIK.toLowerCase().includes(query)

    const matchStatus = selectedStatus.value
      ? item.Status === selectedStatus.value
      : true

    const matchSite = selectedSite.value
      ? item.Site === selectedSite.value
      : true

    const matchStartDate = startDate.value
      ? item.TanggalISO >= startDate.value
      : true

    const matchEndDate = endDate.value
      ? item.TanggalISO <= endDate.value
      : true

    return (
      matchName &&
      matchStatus &&
      matchSite &&
      matchStartDate &&
      matchEndDate
    )
  })
})

// STATUS BADGE
const getStatusClass = (status) => {
  switch (status) {
    case 'Hadir':
      return 'badge-success'

    case 'Terlambat':
      return 'badge-warning'

    default:
      return 'badge-secondary'
  }
}

// PAGINATION
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredData.value.length / itemsPerPage)
  )
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredData.value.slice(
    start,
    start + itemsPerPage
  )
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToFirstPage = () => goToPage(1)
const prevPage = () => goToPage(currentPage.value - 1)
const nextPage = () => goToPage(currentPage.value + 1)
const goToLastPage = () => goToPage(totalPages.value)

// EKSPOR CSV
const handleExport = () => {
  if (dateFilterError.value) {
    alert(dateFilterError.value)
    return
  }

  const headers = [
    'No',
    'NIK',
    'Nama',
    'Tanggal',
    'Lokasi / Site',
    'Jam Masuk',
    'Jam Pulang',
    'Status'
  ]

  const rows = filteredData.value.map((item, index) => [
    index + 1,
    item.NIK,
    item.Nama,
    item.Tanggal,
    item.Site,
    item['Jam Masuk'],
    item['Jam Pulang'],
    item.Status
  ].map(value =>
    `"${String(value ?? '').replaceAll('"', '""')}"`
  ).join(','))

  const blob = new Blob(
    ['\uFEFF' + [headers.join(','), ...rows].join('\n')],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'rekap-absensi.csv'
  link.click()

  URL.revokeObjectURL(url)
}

// CUSTOM SCROLLBAR
const tableCard = ref(null)
const scrollbarTrack = ref(null)

const scrollbarThumbWidth = ref(100)
const scrollbarThumbLeft = ref(0)

let isDraggingScrollbar = false
let dragStartX = 0
let dragStartScroll = 0

const updateScrollbar = () => {
  const table = tableCard.value

  if (!table) return

  const visibleWidth = table.clientWidth
  const totalWidth = table.scrollWidth

  if (totalWidth <= visibleWidth) {
    scrollbarThumbWidth.value = 100
    scrollbarThumbLeft.value = 0
    return
  }

  scrollbarThumbWidth.value = Math.max(
    10,
    (visibleWidth / totalWidth) * 100
  )

  const maxScroll = totalWidth - visibleWidth
  const maxThumbMove = 100 - scrollbarThumbWidth.value

  scrollbarThumbLeft.value =
    (table.scrollLeft / maxScroll) * maxThumbMove
}

const handleTableScroll = () => {
  updateScrollbar()
}

const startScrollbarDrag = (event) => {
  if (!tableCard.value) return

  isDraggingScrollbar = true
  dragStartX = event.clientX
  dragStartScroll = tableCard.value.scrollLeft

  event.currentTarget.setPointerCapture(event.pointerId)
}

const moveScrollbarDrag = (event) => {
  if (!isDraggingScrollbar || !tableCard.value) return

  const table = tableCard.value
  const track = scrollbarTrack.value

  if (!track) return

  const trackWidth = track.clientWidth
  const totalWidth = table.scrollWidth
  const visibleWidth = table.clientWidth

  const maxScroll = totalWidth - visibleWidth

  const thumbWidth =
    (visibleWidth / totalWidth) * trackWidth

  const maxThumbMove = trackWidth - thumbWidth

  if (maxThumbMove <= 0 || maxScroll <= 0) return

  const movement = event.clientX - dragStartX

  const scrollMovement =
    (movement / maxThumbMove) * maxScroll

  table.scrollLeft = Math.max(
    0,
    Math.min(
      maxScroll,
      dragStartScroll + scrollMovement
    )
  )

  updateScrollbar()
}

const stopScrollbarDrag = () => {
  isDraggingScrollbar = false
}

const handleScrollbarTrackClick = (event) => {
  if (!tableCard.value || !scrollbarTrack.value) return

  if (event.target !== event.currentTarget) return

  const rect = scrollbarTrack.value.getBoundingClientRect()

  const clickPosition = event.clientX - rect.left
  const percentage = clickPosition / rect.width

  const maxScroll =
    tableCard.value.scrollWidth - tableCard.value.clientWidth

  tableCard.value.scrollLeft = percentage * maxScroll

  updateScrollbar()
}

// SINKRONISASI FILTER DENGAN PAGINATION
import { watch } from 'vue'

watch(
  [searchQuery, selectedStatus, selectedSite, startDate, endDate],
  () => {
    currentPage.value = 1
  }
)

// LIFECYCLE
onMounted(async () => {
  await loadAttendance()

  window.addEventListener('resize', updateScrollbar)

  attendanceChannel = supabase
    .channel('rekap-absensi-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendances'
      },
      () => loadAttendance()
    )
    .subscribe()

  await nextTick()
  updateScrollbar()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollbar)

  if (attendanceChannel) {
    supabase.removeChannel(attendanceChannel)
    attendanceChannel = null
  }
})
</script>

<template>
  <div class="layout-admin rekapitulasi-desktop">

    <!-- OVERLAY SIDEBAR MOBILE -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-sidebar-overlay"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- SIDEBAR -->
    <aside
      class="sidebar admin-sidebar"
      :class="{ 'mobile-sidebar-open': isMobileMenuOpen }"
    >
      <div class="sidebar-logo">
        <img
          :src="logoPantauHadir"
          alt="Pantau Hadir"
          class="brand-logo"
        />
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi Utama Admin">
        <button
          type="button"
          class="nav-item"
          @click="navigateAdmin('dashboard')"
        >
          <img
            :src="iconScanFace"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
          />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          class="nav-item is-active"
          aria-current="page"
          @click="navigateAdmin('rekap')"
        >
          <img
            :src="iconSquarePen"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
          />
          <span>Rekap Absensi</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="navigateAdmin('pekerja')"
        >
          <img
            :src="iconUsers"
            alt=""
            width="26"
            height="26"
            class="nav-icon"
          />
          <span>Data Pekerja</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button
          type="button"
          class="btn-logout"
          @click="navigateAdmin('logout')"
        >
          <img :src="iconLogOut" alt="" width="18" height="18" />
          <span>Keluar</span>
        </button>

        <div class="sidebar-copy">
          <p>© 2026 Pantau Hadir App</p>
          <small>Sistem Absensi Pekerja Proyek</small>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="admin-main-wrap">

      <!-- HEADER -->
      <header class="app-header">

        <button
          type="button"
          class="mobile-menu-button"
          aria-label="Buka menu navigasi"
          :aria-expanded="isMobileMenuOpen"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg
            v-if="!isMobileMenuOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>

          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="m18 6-12 12M6 6l12 12" />
          </svg>
        </button>

        <h2 class="company-title">PT. Jalan Baru</h2>

        <div class="admin-profile">
          <span class="admin-label">Admin</span>

          <div class="avatar-circle" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              class="avatar-icon"
            >
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                fill="#ffffff"
              />
              <path
                d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22c0 .28.22.5.5.5h17.18c.28 0 .5-.22.5-.5 0-4.14-4.08-7.5-9.09-7.5Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </header>

      <!-- REKAP CONTENT -->
      <main class="rekap-content">

        <div class="content-header">
          <div>
            <h1 class="page-title">Rekapitulasi Absensi</h1>
            <p class="subtitle">Data presensi harian karyawan</p>
          </div>

          <div class="header-actions">

            <!-- FILTER STATUS -->
            <label class="filter-control">
              <img
                :src="iconFunnel"
                alt=""
                width="16"
                height="16"
                :style="{ filter: 'invert(1)' }"
              />

              <select
                v-model="selectedStatus"
                aria-label="Filter status"
              >
                <option value="">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </label>

            <!-- FILTER SITE -->
            <label class="filter-control site-filter-control">
              <select
                v-model="selectedSite"
                aria-label="Filter lokasi proyek"
              >
                <option value="">Semua Lokasi</option>

                <option
                  v-for="site in availableSites"
                  :key="site"
                  :value="site"
                >
                  {{ site }}
                </option>
              </select>
            </label>

            <!-- EKSPOR -->
            <button
              type="button"
              class="btn-header-action"
              @click="handleExport"
            >
              <img
                :src="iconFileDown"
                alt=""
                width="18"
                height="18"
                class="icon-white"
              />
              <span>Ekspor</span>
            </button>

          </div>
        </div>

        <!-- FILTER RENTANG TANGGAL -->
        <div class="date-filter-container">

          <div class="date-filter-item">
            <label for="start-date">Tanggal Mulai</label>

            <input
              id="start-date"
              v-model="startDate"
              type="date"
              class="date-filter-input"
              aria-label="Tanggal mulai"
            />
          </div>

          <div class="date-filter-item">
            <label for="end-date">Tanggal Akhir</label>

            <input
              id="end-date"
              v-model="endDate"
              type="date"
              class="date-filter-input"
              :min="startDate || undefined"
              aria-label="Tanggal akhir"
            />
          </div>

          <button
            type="button"
            class="btn-reset-filter"
            @click="resetFilters"
          >
            Reset Filter
          </button>

        </div>

        <p
          v-if="dateFilterError"
          class="date-filter-error"
          role="alert"
        >
          {{ dateFilterError }}
        </p>

        <!-- SEARCH -->
        <div class="search-bar-container">
          <div class="search-input-box">
            <img
              :src="iconSearch"
              alt=""
              width="18"
              height="18"
              class="search-icon"
            />

            <input
              v-model="searchQuery"
              type="search"
              class="search-field"
              placeholder="Cari nama atau NIK karyawan"
            />
          </div>
        </div>

        <!-- ERROR -->
        <div
          v-if="errorMessage"
          class="error-message"
          role="alert"
        >
          Gagal memuat data: {{ errorMessage }}

          <button type="button" @click="loadAttendance">
            Coba Lagi
          </button>
        </div>

        <!-- LOADING -->
        <div v-if="isLoading" class="loading-state">
          Memuat data absensi dari Supabase...
        </div>

        <!-- TABLE -->
        <div
          ref="tableCard"
          class="table-card"
          @scroll="handleTableScroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Nama</th>
                <th scope="col">Tanggal</th>
                <th scope="col">Lokasi / Site</th>
                <th scope="col">Jam Masuk</th>
                <th scope="col">Bukti Masuk</th>
                <th scope="col">Jam Pulang</th>
                <th scope="col">Bukti Pulang</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in paginatedData"
                :key="item.id"
              >
                <td>
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>

                <td class="font-medium">
                  {{ item.Nama }}
                </td>

                <td>{{ item.Tanggal }}</td>

                <td class="site-cell">
                  {{ item.Site }}
                </td>

                <td>{{ item['Jam Masuk'] }}</td>

                <td>
                  <a
                    v-if="item['Bukti Masuk']"
                    :href="item['Bukti Masuk']"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="photo-link"
                  >
                    Lihat Foto
                  </a>

                  <span v-else class="text-muted">-</span>
                </td>

                <td>{{ item['Jam Pulang'] }}</td>

                <td>
                  <a
                    v-if="item['Bukti Pulang']"
                    :href="item['Bukti Pulang']"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="photo-link"
                  >
                    Lihat Foto
                  </a>

                  <span v-else class="text-muted">-</span>
                </td>

                <td>
                  <span
                    :class="[
                      'status-badge',
                      getStatusClass(item.Status)
                    ]"
                  >
                    {{ item.Status }}
                  </span>
                </td>
              </tr>

              <tr
                v-if="!isLoading && paginatedData.length === 0"
              >
                <td colspan="9" class="empty-state">
                  {{
                    errorMessage
                      ? 'Data belum dapat ditampilkan.'
                      : 'Data absensi tidak ditemukan.'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- CUSTOM SCROLLBAR -->
        <div
          ref="scrollbarTrack"
          class="custom-scrollbar"
          @click="handleScrollbarTrackClick"
        >
          <div
            class="custom-scrollbar-thumb"
            :style="{
              width: `${scrollbarThumbWidth}%`,
              left: `${scrollbarThumbLeft}%`
            }"
            @pointerdown.stop="startScrollbarDrag"
            @pointermove="moveScrollbarDrag"
            @pointerup="stopScrollbarDrag"
            @pointercancel="stopScrollbarDrag"
            @lostpointercapture="stopScrollbarDrag"
          ></div>
        </div>

        <!-- PAGINATION -->
        <nav
          class="pagination-container"
          aria-label="Navigasi halaman tabel"
        >
          <button
            type="button"
            class="page-btn"
            aria-label="Halaman pertama"
            :disabled="currentPage === 1"
            @click="goToFirstPage"
          >
            <img :src="iconArrowLeftToLine" alt="" />
          </button>

          <button
            type="button"
            class="page-btn"
            aria-label="Halaman sebelumnya"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <img :src="iconArrowLeft" alt="" />
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="page-btn page-number-btn"
            :class="{ 'is-active': currentPage === page }"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            type="button"
            class="page-btn"
            aria-label="Halaman berikutnya"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            <img :src="iconArrowRight" alt="" />
          </button>

          <button
            type="button"
            class="page-btn"
            aria-label="Halaman terakhir"
            :disabled="currentPage === totalPages"
            @click="goToLastPage"
          >
            <img :src="iconArrowRightToLine" alt="" />
          </button>
        </nav>

        <!-- ILUSTRASI -->
        <div class="illustration-bottom" aria-hidden="true">
          <img
            :src="imgKonstruksi"
            alt=""
            class="illustration-silhouette"
          />
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* DESKTOP */
.rekapitulasi-desktop {
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) minmax(0, 1fr);
  min-height: 100vh;
}

.admin-sidebar {
  background-color: var(--color-sidebar, #c5c9e8);
  display: flex;
  flex-direction: column;
  padding: 32px 0 24px;
  border-right: 1px solid rgba(8, 2, 100, 0.08);
}

.sidebar-logo {
  padding: 0 28px 40px;
}

.brand-logo {
  display: block;
  max-width: 140px;
  height: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 0 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 28px;
  border: none;
  background: transparent;
  color: var(--color-primary, #080264);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  border-radius: 0 24px 24px 0;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.nav-item.is-active {
  background-color: #ffffff;
  color: var(--color-primary, #080264);
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  margin-top: auto;
  padding: 24px 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 170px;
  padding: 8px 18px;
  background-color: #ffffff;
  color: var(--color-primary, #080264);
  border: 1.5px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

.sidebar-copy {
  color: var(--color-primary, #080264);
  font-size: 0.72rem;
  line-height: 1.35;
  opacity: 0.75;
}

.sidebar-copy p {
  margin: 0;
  font-weight: 700;
}

.sidebar-copy small {
  font-size: inherit;
}

.admin-main-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  min-height: var(--header-height, 56px);
  background-color: var(--color-header, #f58220);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 36px;
}

.company-title {
  margin: 0;
  font-size: 1.25rem;
  font-style: italic;
  font-weight: 800;
  color: #ffffff;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-label {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-icon {
  width: 22px;
  height: 22px;
}

.rekap-content {
  position: relative;
  isolation: isolate;
  flex: 1;
  min-width: 0;
  padding: 28px 30px 32px;
  overflow: hidden;
}

.content-header,
.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.content-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #000;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  font-weight: 800;
}

.subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  justify-content: flex-end;
}

.filter-control,
.btn-header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-primary, #080264);
  color: #fff;
  font: inherit;
  font-weight: 700;
}

.filter-control select {
  max-width: 150px;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.filter-control option {
  color: #111;
}

.btn-header-action {
  cursor: pointer;
}

.icon-white {
  filter: brightness(0) invert(1);
}

/* FILTER TANGGAL */
.date-filter-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.date-filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-filter-item label {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.date-filter-input {
  box-sizing: border-box;
  height: 38px;
  min-width: 155px;
  padding: 0 10px;
  border: 1px solid var(--color-primary, #080264);
  border-radius: 6px;
  background: #fff;
  color: #111;
  font-family: inherit;
  font-size: 13px;
}

.btn-reset-filter {
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--color-primary, #080264);
  border-radius: 6px;
  background: #fff;
  color: var(--color-primary, #080264);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-reset-filter:hover {
  background: #f0f2fa;
}

.date-filter-error {
  margin: -6px 0 12px;
  color: #b91c1c;
  font-size: 13px;
}

.search-bar-container {
  margin-bottom: 16px;
}

.search-input-box {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-field {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 0 16px 0 42px;
  border: 1px solid var(--color-primary, #080264);
  border-radius: 6px;
  font: inherit;
}

.table-card {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border: 2px solid var(--color-primary, #080264);
  background: #fff;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 13px;
  text-align: center;
}

.data-table th,
.data-table td {
  padding: 7px 8px;
  border: 1px solid #c8d0ea;
  white-space: nowrap;
}

.data-table th {
  background: var(--color-primary, #080264);
  color: #fff;
  font-weight: 700;
}

.data-table tbody tr:nth-child(even) {
  background: #f7f9fe;
}

.data-table tbody tr:hover {
  background: #eef2fb;
}

.font-medium {
  text-align: left;
  font-weight: 500;
}

.site-cell {
  font-weight: 600;
}

.text-muted {
  color: #94a3b8;
}

.photo-link {
  color: var(--color-primary, #080264);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.photo-link:hover {
  color: var(--color-header, #f58220);
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-pill, 999px);
  font-size: 12px;
  font-weight: 700;
}

.badge-success {
  background: #c8f5d0;
  color: #0b7a28;
}

.badge-warning {
  background: #f8d7b0;
  color: #a34200;
}

.badge-secondary {
  background: #e2e8f0;
  color: #475569;
}

.empty-state,
.loading-state {
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.error-message {
  position: relative;
  z-index: 3;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fee2e2;
  color: #991b1b;
  overflow-wrap: anywhere;
}

.error-message button {
  margin-left: 10px;
  padding: 6px 10px;
  cursor: pointer;
}

.pagination-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 42px;
  padding: 0 10px;
  border: 1.5px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  background: #fff;
  color: var(--color-primary, #080264);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.page-btn img {
  width: 16px;
  height: 16px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-number-btn.is-active {
  border-width: 2px;
}

.illustration-bottom {
  position: absolute;
  z-index: 1;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  opacity: 0.35;
  pointer-events: none;
}

.illustration-silhouette {
  width: min(100%, 1100px);
  max-height: 180px;
  object-fit: contain;
  object-position: center bottom;
}

/* CUSTOM SCROLLBAR */
.custom-scrollbar {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 14px;
  margin-top: 8px;
  background: #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  touch-action: pan-y;
}

.custom-scrollbar-thumb {
  position: absolute;
  top: 2px;
  height: 10px;
  min-width: 10%;
  background: #080264;
  border-radius: 20px;
  cursor: grab;
  touch-action: none;
  transition: background 0.15s ease;
}

.custom-scrollbar-thumb:hover,
.custom-scrollbar-thumb:active {
  background: #f58220;
}

/* TABLET */
@media (max-width: 900px) {
  .rekapitulasi-desktop {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .rekap-content {
    padding: 20px;
  }

  .content-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* MOBILE */
.mobile-menu-button,
.mobile-sidebar-overlay {
  display: none;
}

@media (max-width: 600px) {
  .rekapitulasi-desktop {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .admin-sidebar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1001;
    width: 260px;
    max-width: 82vw;
    height: 100vh;
    padding: 28px 0 20px;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 0.3s ease, visibility 0.3s ease;
    overflow-y: auto;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .admin-sidebar.mobile-sidebar-open {
    transform: translateX(0);
    visibility: visible;
  }

  .sidebar-logo {
    padding: 0 28px 36px;
  }

  .sidebar-nav {
    padding-right: 16px;
  }

  .sidebar-footer {
    margin-top: auto;
  }

  .mobile-sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.45);
  }

  .app-header {
    min-height: 56px;
    padding: 0 16px;
    gap: 12px;
  }

  .mobile-menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    padding: 5px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #fff;
    cursor: pointer;
  }

  .mobile-menu-button svg {
    width: 25px;
    height: 25px;
  }

  .company-title {
    font-size: 1.1rem;
  }

  .admin-profile {
    gap: 8px;
  }

  .admin-label {
    font-size: 0.9rem;
  }

  .avatar-circle {
    width: 30px;
    height: 30px;
  }

  .rekap-content {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 20px 14px 30px;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .page-title {
    font-size: 1.55rem;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 13px;
  }

  .header-actions {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-control,
  .btn-header-action {
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }

  .filter-control {
    flex: 1;
    min-width: 0;
  }

  .filter-control select {
    width: 100%;
    min-width: 0;
    max-width: none;
    font-size: 13px;
  }

  .date-filter-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  .date-filter-item {
    min-width: 0;
  }

  .date-filter-input {
    width: 100%;
    min-width: 0;
    height: 40px;
    font-size: 12px;
  }

  .date-filter-item label {
    font-size: 12px;
  }

  .btn-reset-filter {
    grid-column: 1 / -1;
    width: 100%;
    height: 38px;
  }

  .date-filter-error {
    font-size: 12px;
  }

  .search-bar-container {
    width: 100%;
    margin-bottom: 14px;
  }

  .search-field {
    height: 42px;
    font-size: 13px;
  }

  .table-card {
    width: 100%;
    max-width: 100%;
    overflow-x: auto !important;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    touch-action: pan-x pan-y;
    border-radius: 4px;
  }

  .data-table {
    width: max-content;
    min-width: 900px;
    table-layout: auto;
    font-size: 13px;
  }

  .data-table th,
  .data-table td {
    padding: 9px 10px;
  }

  .custom-scrollbar {
    display: block;
    height: 14px;
    margin-top: 8px;
  }

  .custom-scrollbar-thumb {
    height: 10px;
  }

  .pagination-container {
    gap: 5px;
    margin-top: 16px;
  }

  .page-btn {
    min-width: 34px;
    height: 36px;
    padding: 0 7px;
    font-size: 12px;
  }

  .page-btn img {
    width: 14px;
    height: 14px;
  }

  .illustration-silhouette {
    width: 100%;
    max-height: 120px;
  }

  .error-message,
  .loading-state {
    font-size: 13px;
  }
}

/* HP LAYAR KECIL */
@media (max-width: 360px) {
  .rekap-content {
    padding-right: 10px;
    padding-left: 10px;
  }

  .company-title {
    font-size: 1rem;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .admin-label {
    font-size: 0.8rem;
  }

  .pagination-container {
    gap: 4px;
  }

  .page-btn {
    min-width: 30px;
    height: 34px;
    padding: 0 5px;
  }
}
</style>
