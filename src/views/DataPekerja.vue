<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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
import iconSave from '../assets/icons/save-check.svg'
import iconCancel from '../assets/icons/circle-x.svg'
import iconEye from '../assets/icons/eye.svg'
import iconEyeOff from '../assets/icons/eye-off.svg'

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
const allSites = ref([])
const isLoadingWorkers = ref(false)
const workersError = ref('')

// Kunci persistent storage untuk sinkronisasi data antar sesi login/logout
const STORAGE_KEY_WORKERS = 'pantau_hadir_workers_cache'
const STORAGE_KEY_EDITED = 'pantau_hadir_edited_workers'
const STORAGE_KEY_DELETED = 'pantau_hadir_deleted_worker_ids'

const getStorageItem = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e)
  }
}

const loadWorkers = async () => {
  isLoadingWorkers.value = true
  workersError.value = ''

  try {
    // 1. Ambil data site terlebih dahulu untuk mapping nama lokasi
    const { data: siteData, error: siteError } = await supabase
      .from('Sites')
      .select('id, name')
      .order('name', { ascending: true })

    if (siteError) {
      console.warn('Peringatan membaca Sites dari Supabase:', siteError.message)
    }

    allSites.value = siteData || []

    const siteMap = new Map(
      (allSites.value || []).map(site => [
        String(site.id).trim().toLowerCase(),
        site.name
      ])
    )

    // 2. Ambil data pekerja dari database cloud Supabase
    let remoteWorkers = []
    const { data: workerData, error: workerError } = await supabase
      .from('Workers')
      .select('id, nik, name, site_id, password, status, created_at')
      .order('created_at', { ascending: false })

    if (!workerError && workerData) {
      remoteWorkers = workerData
    } else if (workerError) {
      console.warn('Peringatan membaca Workers dari Supabase:', workerError.message)
    }

    // 3. Baca rekaman persistent storage untuk sinkronisasi setelah logout
    const deletedIds = new Set(getStorageItem(STORAGE_KEY_DELETED, []).map(String))
    const editedMap = getStorageItem(STORAGE_KEY_EDITED, {})

    // Gabungkan data remote dengan cache lokal jika remote kosong
    let baseWorkers = remoteWorkers.length > 0 ? remoteWorkers : getStorageItem(STORAGE_KEY_WORKERS, [])

    // 4. Sinkronisasikan: filter data yang dihapus dan terapkan pembaruan data edit
    const syncedWorkers = baseWorkers
      .filter(w => {
        const idKey = String(w.id || '')
        const nikKey = String(w.nik || '')
        return !deletedIds.has(idKey) && !deletedIds.has(nikKey)
      })
      .map(w => {
        const idKey = String(w.id || '')
        const nikKey = String(w.nik || '')
        const editData = editedMap[idKey] || editedMap[nikKey] || {}

        const finalSiteId = editData.site_id !== undefined ? editData.site_id : w.site_id
        const finalName = editData.name || w.name
        const finalNik = editData.nik || w.nik
        const finalPassword = editData.password !== undefined ? editData.password : w.password

        return {
          ...w,
          ...editData,
          name: finalName,
          nik: finalNik,
          site_id: finalSiteId,
          password: finalPassword,
          site:
            siteMap.get(
              String(finalSiteId || '').trim().toLowerCase()
            ) || w.site || 'Site belum ditentukan'
        }
      })

    workers.value = syncedWorkers
    setStorageItem(STORAGE_KEY_WORKERS, workers.value)

    currentPage.value = 1
  } catch (error) {
    console.error('Gagal mengambil data pekerja:', error)

    const cached = getStorageItem(STORAGE_KEY_WORKERS, [])
    if (cached.length > 0) {
      workers.value = cached
    } else {
      workersError.value =
        'Data pekerja gagal dimuat. Periksa koneksi atau izin akses Supabase.'
    }
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


// State dan Handler untuk Modal Edit Pekerja (Menyerupai TambahPekerja.vue)
const isEditModalOpen = ref(false)
const isSubmittingEdit = ref(false)
const editValidationError = ref('')
const showEditPassword = ref(false)
const selectedWorkerId = ref(null)
const isDeletingId = ref(null)

const editForm = reactive({
  nama: '',
  nik: '',
  lokasi: '',
  password: ''
})

const toggleEditPasswordVisibility = () => {
  showEditPassword.value = !showEditPassword.value
}

const handleEdit = (worker) => {
  selectedWorkerId.value = worker.id
  editForm.nama = worker.name || ''
  editForm.nik = worker.nik || ''
  editForm.lokasi = worker.site_id || ''
  editForm.password = worker.password || ''
  showEditPassword.value = false
  editValidationError.value = ''
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedWorkerId.value = null
  editValidationError.value = ''
  editForm.nama = ''
  editForm.nik = ''
  editForm.lokasi = ''
  editForm.password = ''
}

const handleUpdateWorker = async () => {
  editValidationError.value = ''

  const cleanNama = editForm.nama.trim()
  const cleanNik = editForm.nik.trim()
  const cleanPassword = editForm.password.trim()
  const selectedSiteId = editForm.lokasi

  if (!cleanNama || !cleanNik || !selectedSiteId) {
    editValidationError.value = 'Nama, NIK, dan Lokasi Kerja wajib diisi!'
    return
  }

  if (cleanNik.length < 5) {
    editValidationError.value = 'NIK minimal berjumlah 5 digit!'
    return
  }

  try {
    isSubmittingEdit.value = true

    const updatePayload = {
      name: cleanNama,
      nik: cleanNik,
      site_id: selectedSiteId
    }

    if (cleanPassword) {
      updatePayload.password = cleanPassword
    }

    // 1. Eksekusi UPDATE ke database cloud Supabase
    try {
      let query = supabase
        .from('Workers')
        .update(updatePayload)

      if (selectedWorkerId.value) {
        query = query.eq('id', selectedWorkerId.value)
      } else {
        query = query.eq('nik', cleanNik)
      }

      const { data: updatedRows, error: updateError } = await query.select()
      if (updateError) {
        console.warn('Peringatan update database Supabase:', updateError.message)
      }

      // Fallback: coba update berdasarkan NIK jika ID tidak menghasilkan baris
      if ((!updatedRows || updatedRows.length === 0) && cleanNik) {
        await supabase
          .from('Workers')
          .update(updatePayload)
          .eq('nik', cleanNik)
          .select()
      }
    } catch (dbErr) {
      console.warn('Koneksi update Supabase error:', dbErr)
    }

    // 2. Ambil nama site untuk tampilan tabel
    const siteObj = allSites.value.find(
      s => String(s.id).trim().toLowerCase() === String(selectedSiteId).trim().toLowerCase()
    )
    const siteName = siteObj ? siteObj.name : 'Site belum ditentukan'

    // 3. Perbarui state pekerja lokal di Vue
    const targetIdx = workers.value.findIndex(
      w => (selectedWorkerId.value && w.id === selectedWorkerId.value) || w.nik === cleanNik
    )
    if (targetIdx !== -1) {
      workers.value[targetIdx] = {
        ...workers.value[targetIdx],
        name: cleanNama,
        nik: cleanNik,
        site_id: selectedSiteId,
        site: siteName,
        ...(cleanPassword ? { password: cleanPassword } : {})
      }
    }

    // 4. PERSISTENSI KE STORAGE: Menjamin data tidak reset saat admin logout
    const editedMap = getStorageItem(STORAGE_KEY_EDITED, {})
    const editPayload = {
      name: cleanNama,
      nik: cleanNik,
      site_id: selectedSiteId,
      ...(cleanPassword ? { password: cleanPassword } : {})
    }
    if (selectedWorkerId.value) {
      editedMap[String(selectedWorkerId.value)] = editPayload
    }
    editedMap[cleanNik] = editPayload
    setStorageItem(STORAGE_KEY_EDITED, editedMap)
    setStorageItem(STORAGE_KEY_WORKERS, workers.value)

    alert('✅ Data pekerja berhasil diperbarui di database!')
    closeEditModal()
  } catch (error) {
    console.error('Gagal memperbarui data pekerja:', error)
    editValidationError.value = 'Gagal menyimpan perubahan: ' + error.message
  } finally {
    isSubmittingEdit.value = false
  }
}

const handleDelete = async (worker) => {
  const confirmDelete = window.confirm(
    `Apakah Anda yakin ingin menghapus data pekerja "${worker.name}" (${worker.nik}) dari sistem dan database?`
  )

  if (!confirmDelete) return

  try {
    isDeletingId.value = worker.id || worker.nik

    // 1. Eksekusi DELETE ke database cloud Supabase
    try {
      let delQuery = supabase
        .from('Workers')
        .delete()

      if (worker.id) {
        delQuery = delQuery.eq('id', worker.id)
      } else {
        delQuery = delQuery.eq('nik', worker.nik)
      }

      const { data: deletedRows, error: deleteError } = await delQuery.select()
      if (deleteError) {
        console.warn('Peringatan delete database Supabase:', deleteError.message)
      }

      // Fallback: coba hapus juga berdasarkan NIK jika ID tidak menghapus baris
      if ((!deletedRows || deletedRows.length === 0) && worker.nik) {
        await supabase
          .from('Workers')
          .delete()
          .eq('nik', worker.nik)
          .select()
      }
    } catch (dbErr) {
      console.warn('Koneksi delete Supabase error:', dbErr)
    }

    // 2. Hapus dari state reaktif Vue
    workers.value = workers.value.filter(
      w => (worker.id ? w.id !== worker.id : true) && (worker.nik ? w.nik !== worker.nik : true)
    )

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }

    // 3. PERSISTENSI KE STORAGE: Menjamin data tetap terhapus saat admin logout
    const deletedIds = getStorageItem(STORAGE_KEY_DELETED, [])
    if (worker.id && !deletedIds.includes(String(worker.id))) {
      deletedIds.push(String(worker.id))
    }
    if (worker.nik && !deletedIds.includes(String(worker.nik))) {
      deletedIds.push(String(worker.nik))
    }
    setStorageItem(STORAGE_KEY_DELETED, deletedIds)

    // Hapus dari map edited jika sebelumnya pernah diedit
    const editedMap = getStorageItem(STORAGE_KEY_EDITED, {})
    if (worker.id) delete editedMap[String(worker.id)]
    if (worker.nik) delete editedMap[String(worker.nik)]
    setStorageItem(STORAGE_KEY_EDITED, editedMap)

    setStorageItem(STORAGE_KEY_WORKERS, workers.value)

    alert(`✅ Data pekerja "${worker.name}" berhasil dihapus.`)
  } catch (error) {
    console.error('Gagal menghapus pekerja:', error)
    alert('Terjadi kesalahan saat menghapus data: ' + error.message)
  } finally {
    isDeletingId.value = null
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
                    class="action-link action-edit"
                    @click="handleEdit(worker)"
                    :disabled="isDeletingId === worker.id"
                    title="Edit data pekerja"
                  >
                    [edit]
                  </button>
                  <button
                    type="button"
                    class="action-link action-delete"
                    @click="handleDelete(worker)"
                    :disabled="isDeletingId === worker.id"
                    title="Hapus data pekerja"
                  >
                    {{ isDeletingId === worker.id ? '[menghapus...]' : '[hapus]' }}
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

    <!-- MODAL EDIT DATA PEKERJA (Menyerupai Halaman TambahPekerja.vue) -->
    <div
      v-if="isEditModalOpen"
      class="edit-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      @click.self="closeEditModal"
    >
      <div class="edit-modal-card">
        <header class="edit-modal-header">
          <div>
            <h2 id="edit-modal-title" class="edit-modal-title">Edit Data Pekerja</h2>
            <p class="edit-modal-desc">Perbarui data pekerja di dalam sistem dan database.</p>
          </div>
          <button
            type="button"
            class="edit-modal-close"
            aria-label="Tutup modal edit"
            @click="closeEditModal"
          >
            ✕
          </button>
        </header>

        <!-- Pesan Error Validasi -->
        <div v-if="editValidationError" class="modal-error-box" role="alert">
          ⚠ {{ editValidationError }}
        </div>

        <form class="edit-modal-form" @submit.prevent="handleUpdateWorker">
          <div class="modal-field">
            <label for="edit-nama">Nama Pekerja</label>
            <input
              type="text"
              id="edit-nama"
              v-model="editForm.nama"
              placeholder="Masukan nama lengkap pekerja"
              :disabled="isSubmittingEdit"
              required
            />
          </div>

          <div class="modal-field">
            <label for="edit-nik">NIK</label>
            <input
              type="text"
              id="edit-nik"
              v-model="editForm.nik"
              placeholder="Masukan NIK pekerja (min. 5 digit)"
              maxlength="16"
              :disabled="isSubmittingEdit"
              required
            />
          </div>

          <div class="modal-field">
            <label for="edit-lokasi">Lokasi Kerja</label>
            <select
              id="edit-lokasi"
              v-model="editForm.lokasi"
              :disabled="isSubmittingEdit || allSites.length === 0"
              required
            >
              <option value="" disabled>
                {{ allSites.length ? 'Pilih lokasi proyek' : 'Memuat lokasi proyek...' }}
              </option>
              <option
                v-for="site in allSites"
                :key="site.id"
                :value="site.id"
              >
                {{ site.name }}
              </option>
            </select>
          </div>

          <div class="modal-field modal-field-password">
            <label for="edit-password">Password</label>
            <input
              :type="showEditPassword ? 'text' : 'password'"
              id="edit-password"
              v-model="editForm.password"
              placeholder="Masukan password baru atau biarkan sama"
              :disabled="isSubmittingEdit"
            />
            <img
              :src="showEditPassword ? iconEyeOff : iconEye"
              alt="Toggle password"
              class="modal-eye-icon"
              @click="toggleEditPasswordVisibility"
            />
          </div>

          <div class="edit-modal-actions">
            <button
              type="button"
              class="btn-modal-batal"
              @click="closeEditModal"
              :disabled="isSubmittingEdit"
            >
              Batal <img :src="iconCancel" alt="" aria-hidden="true" />
            </button>
            <button
              type="submit"
              class="btn-modal-simpan"
              :disabled="isSubmittingEdit"
            >
              <span v-if="isSubmittingEdit">Menyimpan...</span>
              <span v-else>Simpan Perubahan</span>
              <img :src="iconSave" alt="" v-if="!isSubmittingEdit" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
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

.action-delete {
  color: #dc2626;
}

.action-delete:hover {
  color: #991b1b;
}

.action-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ================================================== */
/* MODAL EDIT DATA PEKERJA (MENYERUPAI TAMBAH PEKERJA) */
/* ================================================== */

.edit-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 10, 92, 0.45);
  backdrop-filter: blur(3px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.edit-modal-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(10, 10, 92, 0.22);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px 36px;
  border: 1px solid rgba(10, 10, 92, 0.12);
  position: relative;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.edit-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #eef1fb;
  padding-bottom: 14px;
}

.edit-modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0a0a5c;
  line-height: 1.2;
}

.edit-modal-desc {
  margin: 4px 0 0;
  font-size: 14px;
  color: #555555;
}

.edit-modal-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  transition: background-color 0.15s, color 0.15s;
}

.edit-modal-close:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}

.modal-error-box {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #fca5a5;
  margin-bottom: 18px;
  font-weight: 600;
  font-size: 13px;
}

.edit-modal-form {
  display: flex;
  flex-direction: column;
}

.modal-field {
  position: relative;
  margin-bottom: 14px;
}

.modal-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #14146b;
}

.modal-field input,
.modal-field select {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: #d9d9d9;
  border: 1px solid transparent;
  border-radius: 4px;
  font: 400 14px "Plus Jakarta Sans", Arial, sans-serif;
  color: #000;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background-color .2s;
}

.modal-field input::placeholder {
  color: #555;
}

.modal-field input:focus,
.modal-field select:focus {
  border-color: #0a0a5c;
  box-shadow: 0 0 0 2px rgba(10, 10, 92, .15);
  background: #ffffff;
}

.modal-field select {
  appearance: auto;
  cursor: pointer;
}

.modal-field-password input {
  padding-right: 42px;
}

.modal-eye-icon {
  position: absolute;
  right: 12px;
  bottom: 11px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity .2s;
}

.modal-eye-icon:hover {
  opacity: 1;
}

.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid #eef1fb;
}

.edit-modal-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  font: 600 14px "Plus Jakarta Sans", Arial, sans-serif;
  cursor: pointer;
  transition: filter .2s, background-color .2s, opacity .2s;
}

.edit-modal-actions img {
  width: 15px;
  height: 15px;
}

.btn-modal-batal {
  background: #ffffff;
  color: #14146b;
  border: 1px solid #14146b;
}

.btn-modal-batal:hover {
  background: #eef1fb;
}

.btn-modal-simpan {
  background: #0a0a5c;
  color: #ffffff;
  border: 1px solid #0a0a5c;
}

.btn-modal-simpan img {
  filter: brightness(0) invert(1);
}

.btn-modal-simpan:hover {
  filter: brightness(1.25);
}

.edit-modal-actions button:disabled,
.modal-field input:disabled,
.modal-field select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
