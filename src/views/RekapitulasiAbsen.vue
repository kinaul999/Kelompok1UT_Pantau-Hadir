<script setup>
import { ref, computed } from 'vue'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'
import iconLogOut from '../assets/icons/log-out.svg'
import iconScanFace from '../assets/icons/scan-face.svg'
import iconSquarePen from '../assets/icons/square-pen.svg'
import iconUsers from '../assets/icons/users.svg'
import imgKonstruksi from '../assets/images/images-konstruksi-biru-removebg-preview.png';
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
]);

const handleLogoutClick = () => emit('admin-logout-trigger');
const handleRekapClick = () => emit('rekapitulasi-absen-trigger');
const handleDashboardClick = () => emit('admin-dashboard-trigger');
const handleDataPekerjaClick = () => emit('data-pekerja-trigger');

// Data Presensi langsung dari file Excel (20 entri)
const listPresensi = ref([
  { No: 1, Nama: 'Bambang Cahyadi', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:31:20', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:31:29', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 2, Nama: 'Ahmad Supriyadi', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:15:04', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:05:12', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 3, Nama: 'Dedi Rahmadi', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:28:45', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:15:50', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 4, Nama: 'Budi Santoso', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:42:10', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:45:01', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 5, Nama: 'Suryo Nugroho', Tanggal: '25 Sep 2026', 'Jam Masuk': '08:05:33', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '17:02:18', 'Bukti Pulang': '[Foto]', Status: 'Terlambat' },
  { No: 6, Nama: 'Eko Prasetyo', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:20:11', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:10:40', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 7, Nama: 'Reza Kurniawan', Tanggal: '25 Sep 2026', 'Jam Masuk': '-', 'Bukti Masuk': '-', 'Jam Pulang': '-', 'Bukti Pulang': '-', Status: 'Izin' },
  { No: 8, Nama: 'Hendra Wijaya', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:35:50', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:35:10', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 9, Nama: 'Muhammad Agung', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:18:22', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:08:44', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 10, Nama: 'Rizky Ramadhan', Tanggal: '25 Sep 2026', 'Jam Masuk': '-', 'Bukti Masuk': '-', 'Jam Pulang': '-', 'Bukti Pulang': '-', Status: 'Sakit' },
  { No: 11, Nama: 'Agus Setiawan', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:25:14', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:20:05', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 12, Nama: 'Fajar Hidayat', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:11:40', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:02:19', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 13, Nama: 'Gilang Gemilang', Tanggal: '25 Sep 2026', 'Jam Masuk': '08:12:05', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '17:10:42', 'Bukti Pulang': '[Foto]', Status: 'Terlambat' },
  { No: 14, Nama: 'Hadi Pratama', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:30:00', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:30:15', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 15, Nama: 'Indra Lesmana', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:40:18', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:40:55', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 16, Nama: 'Joko Susilo', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:22:31', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:12:08', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 17, Nama: 'Kiki Hermawan', Tanggal: '25 Sep 2026', 'Jam Masuk': '-', 'Bukti Masuk': '-', 'Jam Pulang': '-', 'Bukti Pulang': '-', Status: 'Izin' },
  { No: 18, Nama: 'Lukman Hakim', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:29:10', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:25:30', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 19, Nama: 'Mulyadi', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:14:52', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:01:45', 'Bukti Pulang': '[Foto]', Status: 'Hadir' },
  { No: 20, Nama: 'Novan Saputra', Tanggal: '25 Sep 2026', 'Jam Masuk': '07:38:04', 'Bukti Masuk': '[Foto]', 'Jam Pulang': '16:38:12', 'Bukti Pulang': '[Foto]', Status: 'Hadir' }
]);

const searchQuery = ref('');
const selectedStatus = ref('');
const isModalOpen = ref(false);
const modalTitle = ref('');

// Computed untuk menyaring data berdasarkan pencarian nama & filter status
const filteredData = computed(() => {
  return listPresensi.value.filter(item => {
    const matchName = item.Nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = selectedStatus.value ? item.Status === selectedStatus.value : true;
    return matchName && matchStatus;
  });
});

// Fungsi menghitung jumlah kategori status
const countStatus = (status) => {
  return listPresensi.value.filter(item => item.Status === status).length;
};

// Penentu kelas warna badge status
const getStatusClass = (status) => {
  switch (status) {
    case 'Hadir': return 'badge-success';
    case 'Terlambat': return 'badge-warning';
    case 'Izin': return 'badge-info';
    case 'Sakit': return 'badge-danger';
    default: return 'badge-secondary';
  }
};

// Handler Modal Foto
const showProof = (nama, jenis) => {
  modalTitle.value = `${jenis} - ${nama}`;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const currentPage = ref(1);
const itemsPerPage = 15;

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage))
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const goToFirstPage = () => goToPage(1);
const prevPage = () => goToPage(currentPage.value - 1);
const nextPage = () => goToPage(currentPage.value + 1);
const goToLastPage = () => goToPage(totalPages.value);

const handleExport = () => {
  const headers = ['No', 'Nama', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status'];
  const rows = filteredData.value.map(item =>
    [item.No, item.Nama, item.Tanggal, item['Jam Masuk'], item['Jam Pulang'], item.Status]
      .map(value => `"${String(value).replaceAll('"', '""')}"`)
      .join(',')
  );
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rekap-absensi.csv';
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="layout-admin rekapitulasi-desktop">
    <aside class="sidebar admin-sidebar">
      <div class="sidebar-logo">
        <img
          :src="logoPantauHadir"
          alt="Pantau Hadir - Sistem Absensi Pekerja Proyek"
          class="brand-logo"
        />
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi Utama Admin">
        <button type="button" class="nav-item" @click="handleDashboardClick">
          <img :src="iconScanFace" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          class="nav-item is-active"
          aria-current="page"
          @click="handleRekapClick"
        >
          <img :src="iconSquarePen" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Rekap Absensi</span>
        </button>

        <button type="button" class="nav-item" @click.prevent="handleDataPekerjaClick">
          <img :src="iconUsers" alt="" width="26" height="26" class="nav-icon" aria-hidden="true" />
          <span>Data Pekerja</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button type="button" class="btn-logout" @click="handleLogoutClick">
          <img :src="iconLogOut" alt="" width="18" height="18" aria-hidden="true" />
          <span>Keluar</span>
        </button>
        <div class="sidebar-copy">
          <p>© 2026 Pantau Hadir App</p>
          <small>Sistem Absensi Pekerja Proyek</small>
        </div>
      </div>
    </aside>

    <div class="admin-main-wrap">
      <header class="app-header">
        <h2 class="company-title">PT. Jalan Baru</h2>
        <div class="admin-profile">
          <span class="admin-label">Admin</span>
          <div class="avatar-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="avatar-icon">
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

      <main class="rekap-content">
        <div class="content-header">
          <div>
            <h1 class="page-title">Rekapitulasi Absensi</h1>
            <p class="subtitle">Data presensi harian karyawan</p>
          </div>

          <div class="header-actions">
            <label class="filter-control">
              <img :src="iconFunnel" alt="" width="16" height="16" aria-hidden="true" :style="{ filter: 'invert(1)' }" />
              <select v-model="selectedStatus" aria-label="Filter status" @change="currentPage = 1">
                <option value="">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
              </select>
            </label>

            <button type="button" class="btn-header-action" @click="handleExport">
              <img :src="iconFileDown" alt="" width="18" height="18" class="icon-white" aria-hidden="true" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        <div class="search-bar-container">
          <div class="search-input-box">
            <img :src="iconSearch" alt="" width="18" height="18" class="search-icon" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              class="search-field"
              placeholder="Cari nama karyawan"
              @input="currentPage = 1"
            />
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Nama</th>
                <th scope="col">Tanggal</th>
                <th scope="col">Jam Masuk</th>
                <th scope="col">Bukti Masuk</th>
                <th scope="col">Jam Pulang</th>
                <th scope="col">Bukti Pulang</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="item.No">
                <td>{{ item.No }}</td>
                <td class="font-medium">{{ item.Nama }}</td>
                <td>{{ item.Tanggal }}</td>
                <td>{{ item['Jam Masuk'] }}</td>
                <td>
                  <button
                    v-if="item['Bukti Masuk'] !== '-'"
                    type="button"
                    class="btn-bukti"
                    @click="showProof(item.Nama, 'Masuk')"
                  >
                    Lihat Foto
                  </button>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>{{ item['Jam Pulang'] }}</td>
                <td>
                  <button
                    v-if="item['Bukti Pulang'] !== '-'"
                    type="button"
                    class="btn-bukti"
                    @click="showProof(item.Nama, 'Pulang')"
                  >
                    Lihat Foto
                  </button>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(item.Status)]">
                    {{ item.Status }}
                  </span>
                </td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="8" class="empty-state">
                  Data presensi tidak ditemukan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav class="pagination-container" aria-label="Navigasi halaman tabel">
          <button
            type="button"
            class="page-btn"
            aria-label="Halaman pertama"
            :disabled="currentPage === 1"
            @click="goToFirstPage"
          >
            <img :src="iconArrowLeftToLine" alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="page-btn"
            aria-label="Halaman sebelumnya"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            <img :src="iconArrowLeft" alt="" aria-hidden="true" />
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
            <img :src="iconArrowRight" alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="page-btn"
            aria-label="Halaman terakhir"
            :disabled="currentPage === totalPages"
            @click="goToLastPage"
          >
            <img :src="iconArrowRightToLine" alt="" aria-hidden="true" />
          </button>
        </nav>

        <div class="illustration-bottom" aria-hidden="true">
          <img :src="imgKonstruksi" alt="" class="illustration-silhouette" />
        </div>
      </main>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3>Bukti Presensi {{ modalTitle }}</h3>
        <div class="photo-placeholder">
          <span>[Pratinjau Foto {{ modalTitle }}]</span>
        </div>
        <button type="button" class="btn-close" @click="closeModal">Tutup</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-24);
  flex-wrap: wrap;
}

.header-section h2 {
  color: var(--color-primary);
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.nav-button {
  min-height: 40px;
  padding: 8px 16px;
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--radius-pill);
  font-weight: 700;
  cursor: pointer;
}

.nav-button:focus-visible,
.btn-bukti:focus-visible,
.btn-close:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 2px;
}

.nav-button-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.nav-button-secondary {
  background: var(--color-surface);
  color: var(--color-primary);
}

.filter-card,
.table-responsive {
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
}

.data-table th {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.data-table tbody tr:nth-child(even) {
  background: #f7f8fc;
}

@media (max-width: 640px) {
  .rekapitulasi-container {
    grid-template-columns: 200px 1fr;
  }

  .filter-group {
    min-width: 100%;
    flex-direction: column;
  }

  .form-input,
  .form-select {
    min-height: var(--control-height);
  }
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

.filter-card {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 280px;
}

.form-input, .form-select {
  padding: 8px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input { flex: 1; }
.form-input:focus, .form-select:focus { border-color: #3b82f6; }

.summary-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pill-total { background-color: #e2e8f0; color: #334155; }
.pill-hadir { background-color: #dcfce7; color: #166534; }
.pill-terlambat { background-color: #fef9c3; color: #854d0e; }
.pill-izin { background-color: #e0f2fe; color: #075985; }

.table-responsive {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.data-table th {
  background-color: #f1f5f9;
  color: #475569;
  padding: 12px 16px;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.font-medium { font-weight: 500; }
.text-muted { color: #94a3b8; }
.text-center { text-align: center; }

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success { background-color: #dcfce7; color: #15803d; }
.badge-warning { background-color: #fef9c3; color: #a16207; }
.badge-info { background-color: #e0f2fe; color: #0369a1; }
.badge-danger { background-color: #fee2e2; color: #b91c1c; }

.btn-bukti {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-bukti:hover {
  background: #e2e8f0;
}

/* Modal CSS */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
  text-align: center;
}

.photo-placeholder {
  height: 180px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  margin: 16px 0;
}

.btn-close {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
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

.rekapitulasi-desktop {
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) minmax(0, 1fr);
  min-height: 100vh;
}

.admin-main-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
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
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  font: inherit;
  font-weight: 700;
}

.filter-control select {
  max-width: 130px;
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
  width: 100%;
  height: 44px;
  padding: 0 16px 0 42px;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  font: inherit;
}

.table-card {
  position: relative;
  z-index: 2;
  width: 100%;
  overflow-x: auto;
  border: 2px solid var(--color-primary);
  background: #fff;
}

.data-table {
  width: 100%;
  min-width: 760px;
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
  background: var(--color-primary);
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
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700;
}

.badge-success { background: #c8f5d0; color: #0b7a28; }
.badge-warning { background: #f8d7b0; color: #a34200; }
.badge-info { background: #e0f2fe; color: #075985; }
.badge-danger { background: #f7c9c9; color: #b91c1c; }

.btn-bukti {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
}

.empty-state {
  padding: 24px;
  color: #64748b;
}

.pagination-container {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
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
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-primary);
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

.modal-backdrop {
  z-index: 10;
}

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

@media (max-width: 600px) {
  .rekapitulasi-desktop {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none;
  }

  .rekap-content {
    padding: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
