<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru-removebg-preview.png'
import iconLogOut from '../assets/icons/log-out.svg'
import iconScanFace from '../assets/icons/scan-face.svg'
import iconSquarePen from '../assets/icons/square-pen.svg'
import iconUsers from '../assets/icons/users.svg'
import iconUserPlus from '../assets/icons/user-plus.svg'
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
  'tambah-pekerja-trigger'
])

const handleLogoutClick = () => {
  emit('admin-logout-trigger')
}

const handleRekapClick = () => {
  emit('rekapitulasi-absen-trigger')
}

const handleDashboardClick = () => {
  emit('admin-dashboard-trigger')
}

const handleTambahPekerjaClick = () => {
  emit('tambah-pekerja-trigger')
}


const workers = ref([])
const isLoadingWorkers = ref(false)
const workersError = ref('')


const loadWorkers = async () => {
  isLoadingWorkers.value = true
  workersError.value = ''

  try {
    // Ambil data pekerja
    const { data: workerData, error: workerError } = await supabase
      .from('Workers')
      .select('id, nik, name, site_id, status, created_at')
      .order('created_at', { ascending: false })

    if (workerError) throw workerError

    // Ambil data site
    const { data: siteData, error: siteError } = await supabase
      .from('Sites')
      .select('id, name')

    if (siteError) throw siteError

    // Cocokkan ID site dengan site_id pekerja
    const siteMap = new Map(
      (siteData || []).map(site => [
        String(site.id).trim().toLowerCase(),
        site.name
      ])
    )

    workers.value = (workerData || []).map(worker => ({
      ...worker,
      site:
        siteMap.get(
          String(worker.site_id || '').trim().toLowerCase()
        ) || 'Site belum ditentukan'
    }))

    console.log('Data Sites:', siteData)
    console.log('Data Workers:', workers.value)

    currentPage.value = 1
  } catch (error) {
    console.error('Gagal mengambil data pekerja:', error)

    workersError.value =
      'Data pekerja gagal dimuat. Periksa koneksi atau izin akses Supabase.'
  } finally {
    isLoadingWorkers.value = false
  }
}


onMounted(loadWorkers)


const searchQuery = ref('')
const selectedSite = ref('')
const showSiteFilter = ref(false)
const currentPage = ref(1)
const itemsPerPage = 15

const uniqueSites = computed(() => {
  const sites = new Set(workers.value.map(w => w.site))
  return Array.from(sites)
})

const filteredWorkers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return workers.value.filter(worker => {
    const matchesSearch = !query ||
      worker.name.toLowerCase().includes(query) ||
      worker.nik.toLowerCase().includes(query)
    const matchesSite = !selectedSite.value || worker.site === selectedSite.value
    return matchesSearch && matchesSite
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredWorkers.value.length / itemsPerPage)))

const paginatedWorkers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredWorkers.value.slice(start, start + itemsPerPage)
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

const toggleSiteFilter = () => {
  showSiteFilter.value = !showSiteFilter.value
}

const selectSite = (site) => {
  selectedSite.value = site
  showSiteFilter.value = false
  currentPage.value = 1
}


const handleDelete = async (worker) => {
  const confirmDelete = window.confirm(
    `Hapus data pekerja ${worker.name} (${worker.nik})?`
  )

  if (!confirmDelete) return

  try {
    const { error } = await supabase
      .from('Workers')
      .delete()
      .eq('id', worker.id)

    if (error) throw error

    workers.value = workers.value.filter(
      w => w.id !== worker.id
    )

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }

    alert('Data pekerja berhasil dihapus.')
  } catch (error) {
    console.error('Gagal menghapus pekerja:', error)
    alert('Data gagal dihapus. Periksa izin DELETE pada Supabase.')
  }
}


const handleEdit = (worker) => {
  const newName = window.prompt('Ubah Nama Pekerja:', worker.name)
  if (newName && newName.trim()) {
    worker.name = newName.trim()
  }
}

const handleExport = () => {
  const header = 'No,NIK,Nama Pekerja,Site\n'
  const rows = filteredWorkers.value.map(w => `${w.no},${w.nik},"${w.name}",${w.site}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `data-pekerja-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="layout-admin data-pekerja-desktop">
    <!-- SIDEBAR KIRI -->
    <aside class="sidebar admin-sidebar">
      <div class="sidebar-logo">
        <img
          :src="logoPantauHadir"
          alt="Pantau Hadir - Sistem Absensi Pekerja Proyek"
          class="brand-logo"
        />
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi Utama Admin">
        <button
          type="button"
          class="nav-item"
          @click="handleDashboardClick"
        >
          <img :src="iconScanFace" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          class="nav-item"
          @click="handleRekapClick"
        >
          <img :src="iconSquarePen" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Rekap Absensi</span>
        </button>

        <button
          type="button"
          class="nav-item is-active"
          aria-current="page"
        >
          <img :src="iconUsers" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Data Pekerja</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button
          type="button"
          class="btn-logout"
          aria-label="Keluar ke halaman landing"
          @click="handleLogoutClick"
        >
          <img :src="iconLogOut" alt="" width="18" height="18" aria-hidden="true" />
          <span>Keluar</span>
        </button>

        <div class="sidebar-copy">
          <p>© 2026 Pantau Hadir App</p>
          <small>Sistem Absensi Pekerja Proyek</small>
        </div>
      </div>
    </aside>

    <!-- AREA KONTEN UTAMA KANAN -->
    <div class="admin-main-wrap">
      <!-- TOPBAR ORANYE -->
      <header class="app-header">
        <h2 class="company-title">PT. Jalan Baru</h2>
        <div class="admin-profile">
          <span class="admin-label">Admin</span>
          <div class="avatar-circle">
            <svg viewBox="0 0 24 24" fill="none" class="avatar-icon" aria-hidden="true">
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                fill="#ffffff"
              />
              <path
                d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </header>

      <!-- KONTEN DATA PEKERJA -->
      <main class="data-pekerja-content">
        <!-- HEADER AKSI -->
        <div class="content-header">
          <h1 class="page-title">Data Pekerja</h1>

          <div class="header-actions">
            <button
              type="button"
              class="btn-header-action"
              @click.prevent="emit('tambah-pekerja-trigger')"
            >
              <img :src="iconUserPlus" alt="" width="18" height="18" class="icon-white" aria-hidden="true" />
              <span>Tambah Pekerja</span>
            </button>

            <div class="filter-wrapper">
              <button
                type="button"
                class="btn-header-action"
                :class="{ 'is-active-filter': selectedSite }"
                aria-haspopup="true"
                :aria-expanded="showSiteFilter"
                @click="toggleSiteFilter"
              >
                <img :src="iconFunnel" alt="" width="16" height="16" class="icon-white" aria-hidden="true" />
                <span>{{ selectedSite ? selectedSite : 'Filter' }}</span>
              </button>

              <div v-if="showSiteFilter" class="filter-dropdown" role="menu">
                <button
                  type="button"
                  class="dropdown-item"
                  :class="{ 'is-selected': !selectedSite }"
                  @click="selectSite('')"
                >
                  Semua Site
                </button>
                <button
                  v-for="site in uniqueSites"
                  :key="site"
                  type="button"
                  class="dropdown-item"
                  :class="{ 'is-selected': selectedSite === site }"
                  @click="selectSite(site)"
                >
                  {{ site }}
                </button>
              </div>
            </div>

            <button
              type="button"
              class="btn-header-action"
              aria-label="Ekspor data ke file CSV"
              @click="handleExport"
            >
              <img :src="iconFileDown" alt="" width="18" height="18" class="icon-white" aria-hidden="true" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        <!-- SEARCH BAR -->
        <div class="search-bar-container">
          <div class="search-input-box">
            <img :src="iconSearch" alt="" width="18" height="18" class="search-icon" aria-hidden="true" />
            <input
              id="search-pekerja-desktop"
              v-model="searchQuery"
              type="search"
              name="search-pekerja"
              class="search-field"
              placeholder="Cari nama pekerja"
              @input="currentPage = 1"
            />
          </div>
        </div>

        <p v-if="isLoadingWorkers" role="status">
  Memuat data pekerja dari Supabase...
</p>

<p v-else-if="workersError" class="cell-empty" role="alert">
  {{ workersError }}
  <button type="button" @click="loadWorkers">
    Coba lagi
  </button>
</p>

        <!-- TABEL DATA PEKERJA -->
        <div v-if="!isLoadingWorkers && !workersError" class="table-card">
          <table class="worker-table">
            <thead>
              <tr>
                <th scope="col" class="col-no">No</th>
                <th scope="col" class="col-nik">NIK</th>
                <th scope="col" class="col-name">Nama Pekerja</th>
                <th scope="col" class="col-site">Site</th>
                <th scope="col" class="col-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
             <tr v-for="(worker, index) in paginatedWorkers" :key="worker.id">
  <td class="cell-no">
    {{ String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0') }}
  </td>
                <td class="cell-nik">{{ worker.nik }}</td>
                <td class="cell-name">{{ worker.name }}</td>
                <td class="cell-site">{{ worker.site }}</td>
                <td class="cell-aksi">
                  <button
                    type="button"
                    class="action-link"
                    @click="handleEdit(worker)"
                  >
                    [edit]
                  </button>
                  <button
                    type="button"
                    class="action-link"
                    @click="handleDelete(worker)"
                  >
                    [hapus]
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedWorkers.length === 0">
                <td colspan="5" class="cell-empty">
                  Tidak ada data pekerja yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINASI -->
        <div class="pagination-container">
          <button
            type="button"
            class="page-btn"
            :disabled="currentPage === 1"
            aria-label="Halaman pertama"
            @click="goToFirstPage"
          >
            <img :src="iconArrowLeftToLine" alt="" width="16" height="16" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="page-btn"
            :disabled="currentPage === 1"
            aria-label="Halaman sebelumnya"
            @click="prevPage"
          >
            <img :src="iconArrowLeft" alt="" width="16" height="16" aria-hidden="true" />
          </button>

          <div class="page-numbers-group">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              class="page-btn page-number-btn"
              :class="{ 'is-active': currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            type="button"
            class="page-btn"
            :disabled="currentPage === totalPages"
            aria-label="Halaman berikutnya"
            @click="nextPage"
          >
            <img :src="iconArrowRight" alt="" width="16" height="16" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="page-btn"
            :disabled="currentPage === totalPages"
            aria-label="Halaman terakhir"
            @click="goToLastPage"
          >
            <img :src="iconArrowRightToLine" alt="" width="16" height="16" aria-hidden="true" />
          </button>
        </div>

        <!-- LATAR SILUET KONSTRUKSI BAWAH -->
        <div class="illustration-bottom" aria-hidden="true">
          <img :src="imgKonstruksi" alt="" class="illustration-silhouette" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.data-pekerja-desktop {
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) 1fr;
  min-height: 100vh;
  background-color: var(--color-canvas, #ffffff);
  font-family: var(--font-family);
  color: var(--color-text-strong, #111111);
}

/* SIDEBAR KIRI */
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
  font-size: 1.05rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  border-radius: 0 24px 24px 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.nav-item.is-active {
  background-color: #ffffff;
  color: var(--color-primary, #080264);
  box-shadow: 0 2px 10px rgba(8, 2, 100, 0.06);
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
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.btn-logout:hover {
  background-color: #f2f4fa;
}

.btn-logout:active {
  transform: scale(0.98);
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

/* AREA KONTEN UTAMA KANAN */
.admin-main-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #ffffff;
}

/* TOPBAR */
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
  letter-spacing: 0.02em;
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

/* KONTEN */
.data-pekerja-content {
  position: relative;
  flex: 1;
  padding: 28px 36px 40px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  color: #000000;
  letter-spacing: -0.01em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  background-color: var(--color-primary, #080264);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm, 8px);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.btn-header-action:hover {
  background-color: #050046;
}

.btn-header-action:active {
  transform: scale(0.98);
}

.icon-white {
  filter: brightness(0) invert(1);
}

.filter-wrapper {
  position: relative;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 140px;
  background-color: #ffffff;
  border: 1.5px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  box-shadow: 0 8px 24px rgba(8, 2, 100, 0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  padding: 10px 16px;
  text-align: left;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-strong, #111111);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f0f2fa;
}

.dropdown-item.is-selected {
  background-color: var(--color-primary, #080264);
  color: #ffffff;
}

/* SEARCH */
.search-bar-container {
  margin-bottom: 20px;
}

.search-input-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  opacity: 0.7;
  pointer-events: none;
}

.search-field {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 42px;
  border: 1.5px solid #222222;
  border-radius: 6px;
  background-color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-text-strong, #111111);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-field:focus {
  border-color: var(--color-primary, #080264);
  box-shadow: 0 0 0 3px rgba(8, 2, 100, 0.14);
}

.search-field::placeholder {
  color: #777777;
}

/* TABEL */
.table-card {
  width: 100%;
  border: 2px solid var(--color-primary, #080264);
  background-color: #ffffff;
  overflow-x: auto;
  position: relative;
  z-index: 2;
}

.worker-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.worker-table th,
.worker-table td {
  border: 1px solid #c8d0ea;
  padding: 8px 12px;
}

.worker-table th {
  background-color: var(--color-primary, #080264);
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  height: 40px;
}

.worker-table tbody tr:nth-child(even) {
  background-color: #f7f9fe;
}

.worker-table tbody tr:hover {
  background-color: #eef2fb;
}

.col-no {
  width: 60px;
}

.col-nik {
  width: 110px;
}

.col-name {
  text-align: left;
}

.col-site {
  width: 110px;
}

.col-pass {
  width: 120px;
}

.col-aksi {
  width: 140px;
}

.cell-no {
  text-align: center;
  font-weight: 600;
}

.cell-nik {
  text-align: center;
  font-weight: 600;
}

.cell-name {
  text-align: left;
  font-weight: 600;
  padding-left: 18px;
}

.cell-site {
  text-align: center;
  font-weight: 600;
}

.cell-pass {
  text-align: center;
  letter-spacing: 0.15em;
  font-weight: 700;
  color: #333333;
}

.cell-aksi {
  text-align: center;
  white-space: nowrap;
}

.action-link {
  background: transparent;
  border: none;
  color: #1e40af;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  text-decoration: underline;
  transition: color 0.15s ease;
}

.action-link:hover {
  color: #0c2367;
}

.cell-empty {
  text-align: center;
  padding: 32px 16px;
  color: #777777;
  font-style: italic;
}

/* PAGINASI */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  position: relative;
  z-index: 2;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 40px;
  padding: 0 10px;
  background-color: #ffffff;
  color: var(--color-primary, #080264);
  border: 1.5px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f2fa;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-numbers-group {
  display: flex;
  gap: 8px;
}

.page-number-btn.is-active {
  background-color: #ffffff;
  color: var(--color-primary, #080264);
  border-width: 2px;
  box-shadow: 0 0 0 1px var(--color-primary, #080264);
}

/* ILUSTRASI KONSTRUKSI BAWAH */
.illustration-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  opacity: 0.42;
}

.illustration-silhouette {
  width: 100%;
  max-width: 1100px;
  height: auto;
  object-fit: contain;
  object-position: center bottom;
}

@media (max-width: 1024px) {
  .data-pekerja-desktop {
    grid-template-columns: 200px 1fr;
  }

  .nav-item {
    font-size: 0.95rem;
    padding: 12px 16px;
  }

  .app-header {
    padding: 0 20px;
  }

  .data-pekerja-content {
    padding: 20px;
  }
}
</style>
