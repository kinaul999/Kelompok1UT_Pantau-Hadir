<template>
  <div class="main-layout">
    <!-- Sidebar / Navigasi Kiri -->
    <aside class="sidebar">
      <div class="logo">
        <img src="@/assets/images/logo_pantau_hadir.png" alt="Logo" class="logo-img" />
        <div class="logo-text">
          <h2>Pantau Hadir</h2>
          <span>Admin System</span>
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-title">MENU UTAMA</div>
        <router-link to="/admindashboard" class="nav-item">
          <span class="menu-icon">📊</span> Dashboard
        </router-link>
        <router-link to="/pekerjadashboard" class="nav-item">
          <span class="menu-icon">👥</span> Data Pekerja
        </router-link>
        <router-link to="#" class="nav-item">
          <span class="menu-icon">📁</span> Data Proyek
        </router-link>
        <router-link to="#" class="nav-item">
          <span class="menu-icon">✓</span> Absensi
        </router-link>
        <router-link to="/rekapitulasi" class="nav-item active">
          <span class="menu-icon">📋</span> Rekapitulasi
        </router-link>
        <router-link to="#" class="nav-item">
          <span class="menu-icon">📈</span> Laporan
        </router-link>
      </div>

      <div class="nav-group">
        <div class="nav-title">PENGATURAN</div>
        <router-link to="#" class="nav-item">
          <span class="menu-icon">⚙️</span> Pengaturan
        </router-link>
        <a href="#" @click.prevent="logout" class="nav-item">
          <span class="menu-icon">🚪</span> Keluar
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Header Atas -->
      <header class="topbar">
        <div class="page-title">
          <h1>Rekapitulasi Absensi</h1>
          <p>Pantau Hadir / Rekapitulasi Absensi</p>
        </div>
        <div class="admin-profile">
          <div class="admin-avatar">AD</div>
          <div class="admin-info">
            <strong>Administrator</strong>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <!-- Content Body -->
      <section class="content">
        <!-- Breadcrumb / Path -->
        <div class="breadcrumb">
          Dashboard / <strong>Rekapitulasi Absensi</strong>
        </div>

        <!-- Kartu Statistik Absensi -->
        <div class="stats">
          <div class="stat-card">
            <div class="stat-info">
              <p>Total Pekerja</p>
              <h2>{{ attendanceData.length }}</h2>
            </div>
            <div class="stat-icon blue">👥</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <p>Hadir</p>
              <h2>{{ countHadir }}</h2>
            </div>
            <div class="stat-icon green">✓</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <p>Terlambat</p>
              <h2>{{ countTerlambat }}</h2>
            </div>
            <div class="stat-icon orange">⏰</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <p>Izin / Sakit</p>
              <h2>{{ countIzinSakit }}</h2>
            </div>
            <div class="stat-icon red">!</div>
          </div>
        </div>

        <!-- Tabel Rekapitulasi -->
        <div class="table-container">
          <div class="table-header">
            <h3>Data Rekapitulasi Kehadiran</h3>
            <p>Data presensi pekerja proyek tanggal 25 September 2026</p>
          </div>

          <!-- Filter & Tools -->
          <div class="filters">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="🔍 Cari nama pekerja..." 
              class="search-input" 
            />
            <select v-model="selectedStatus" class="filter-select">
              <option value="semua">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
            </select>
            <input type="date" value="2026-09-25" class="date-input" />
            <button class="btn-export">⬇ Export CSV</button>
          </div>

          <!-- Tabel Data Pekerja -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>NAMA PEKERJA</th>
                  <th>TANGGAL</th>
                  <th>JAM MASUK</th>
                  <th>BUKTI MASUK</th>
                  <th>JAM PULANG</th>
                  <th>BUKTI PULANG</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredData" :key="item.no">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="employee-info">
                      <span class="employee-avatar">{{ getInitials(item.nama) }}</span>
                      <span class="employee-name">{{ item.nama }}</span>
                    </div>
                  </td>
                  <td>{{ item.tanggal }}</td>
                  <td>{{ item.jamMasuk }}</td>
                  <td>
                    <button 
                      v-if="item.jamMasuk !== '-'" 
                      class="btn-foto" 
                      @click="viewPhoto(item.nama, 'Masuk', item.jamMasuk)"
                    >📷 Foto</button>
                    <span v-else>-</span>
                  </td>
                  <td>{{ item.jamPulang }}</td>
                  <td>
                    <button 
                      v-if="item.jamPulang !== '-'" 
                      class="btn-foto" 
                      @click="viewPhoto(item.nama, 'Pulang', item.jamPulang)"
                    >📷 Foto</button>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span :class="['status-tag', getStatusClass(item.status)]">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchKeyword = ref('')
const selectedStatus = ref('semua')

// Cek status session login
onMounted(() => {
  const isLoggedIn = localStorage.getItem('statusLogin')
  if (!isLoggedIn) {
    alert('Silakan login terlebih dahulu!')
    router.push('/')
  }
})

// Data 20 Pekerja Lengkap
const attendanceData = ref([
  { no: 1, nama: 'Bambang Cahyadi', tanggal: '25 Sep 2026', jamMasuk: '07:31:20', jamPulang: '16:31:29', status: 'Hadir' },
  { no: 2, nama: 'Ahmad Supriyadi', tanggal: '25 Sep 2026', jamMasuk: '07:15:04', jamPulang: '16:05:12', status: 'Hadir' },
  { no: 3, nama: 'Dedi Rahmadi', tanggal: '25 Sep 2026', jamMasuk: '07:28:45', jamPulang: '16:15:50', status: 'Hadir' },
  { no: 4, nama: 'Budi Santoso', tanggal: '25 Sep 2026', jamMasuk: '07:42:10', jamPulang: '16:45:01', status: 'Hadir' },
  { no: 5, nama: 'Suryo Nugroho', tanggal: '25 Sep 2026', jamMasuk: '08:05:33', jamPulang: '17:02:18', status: 'Terlambat' },
  { no: 6, nama: 'Eko Prasetyo', tanggal: '25 Sep 2026', jamMasuk: '07:20:11', jamPulang: '16:10:40', status: 'Hadir' },
  { no: 7, nama: 'Reza Kurniawan', tanggal: '25 Sep 2026', jamMasuk: '-', jamPulang: '-', status: 'Izin' },
  { no: 8, nama: 'Hendra Wijaya', tanggal: '25 Sep 2026', jamMasuk: '07:35:50', jamPulang: '16:35:10', status: 'Hadir' },
  { no: 9, nama: 'Rizky Ramadhan', tanggal: '25 Sep 2026', jamMasuk: '07:10:00', jamPulang: '16:00:00', status: 'Hadir' },
  { no: 10, nama: 'Agus Setiawan', tanggal: '25 Sep 2026', jamMasuk: '07:25:00', jamPulang: '16:20:00', status: 'Hadir' },
  { no: 11, nama: 'Fajar Hidayat', tanggal: '25 Sep 2026', jamMasuk: '08:12:00', jamPulang: '17:10:00', status: 'Terlambat' },
  { no: 12, nama: 'Gilang Gemilang', tanggal: '25 Sep 2026', jamMasuk: '07:18:00', jamPulang: '16:15:00', status: 'Hadir' },
  { no: 13, nama: 'Hadi Pratama', tanggal: '25 Sep 2026', jamMasuk: '07:30:00', jamPulang: '16:30:00', status: 'Hadir' },
  { no: 14, nama: 'Indra Lessana', tanggal: '25 Sep 2026', jamMasuk: '-', jamPulang: '-', status: 'Sakit' },
  { no: 15, nama: 'Joko Susilo', tanggal: '25 Sep 2026', jamMasuk: '07:22:00', jamPulang: '16:18:00', status: 'Hadir' },
  { no: 16, nama: 'Lukman Hakim', tanggal: '25 Sep 2026', jamMasuk: '07:29:00', jamPulang: '16:28:00', status: 'Hadir' },
  { no: 17, nama: 'Mulyadi', tanggal: '25 Sep 2026', jamMasuk: '07:14:00', jamPulang: '16:04:00', status: 'Hadir' },
  { no: 18, nama: 'Novan Saputra', tanggal: '25 Sep 2026', jamMasuk: '07:33:00', jamPulang: '16:32:00', status: 'Hadir' },
  { no: 19, nama: 'Oky Firmansyah', tanggal: '25 Sep 2026', jamMasuk: '07:40:00', jamPulang: '16:40:00', status: 'Hadir' },
  { no: 20, nama: 'Panji Ramadhan', tanggal: '25 Sep 2026', jamMasuk: '07:11:00', jamPulang: '16:01:00', status: 'Hadir' }
])

// Perhitungan Statistik Otomatis
const countHadir = computed(() => attendanceData.value.filter(i => i.status === 'Hadir').length)
const countTerlambat = computed(() => attendanceData.value.filter(i => i.status === 'Terlambat').length)
const countIzinSakit = computed(() => attendanceData.value.filter(i => i.status === 'Izin' || i.status === 'Sakit').length)

// Filtering Data Pencarian & Dropdown Status
const filteredData = computed(() => {
  return attendanceData.value.filter(item => {
    const matchName = item.nama.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchStatus = selectedStatus.value === 'semua' || item.status === selectedStatus.value
    return matchName && matchStatus
  })
})

// Fungsi Ambil Inisial Nama
const getInitials = (name) => {
  const words = name.split(' ')
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return words[0][0].toUpperCase()
}

// Fungsi Warna Tag Status
const getStatusClass = (status) => {
  if (status === 'Hadir') return 'status-hadir'
  if (status === 'Terlambat') return 'status-terlambat'
  if (status === 'Izin') return 'status-izin'
  if (status === 'Sakit') return 'status-sakit'
  return ''
}

// Action Button Foto
const viewPhoto = (nama, jenis, waktu) => {
  alert(`Bukti foto ${jenis} untuk ${nama} pada pukul${waktu}`)
}

// Action Logout
const logout = () => {
  localStorage.removeItem('statusLogin')
  router.push('/')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar Styling */
.sidebar {
  width: 260px;
  background-color: #1e40af;
  color: #ffffff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.logo-img {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  object-fit: contain;
}

.logo-text h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 700;
}

.logo-text span {
  font-size: 11px;
  opacity: 0.75;
}

.nav-group {
  margin-bottom: 24px;
}

.nav-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-bottom: 8px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 13px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 600;
}

/* Main Content Styling */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: #ffffff;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.page-title h1 {
  font-size: 20px;
  margin: 0;
  color: #0f172a;
}

.page-title p {
  font-size: 12px;
  margin: 2px 0 0 0;
  color: #64748b;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 38px;
  height: 38px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.admin-info strong {
  display: block;
  font-size: 13px;
  color: #0f172a;
}

.admin-info span {
  font-size: 11px;
  color: #64748b;
}

.content {
  padding: 24px 32px;
}

.breadcrumb {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 20px;
}

/* Stats Cards */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-info p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #64748b;
}

.stat-info h2 {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-icon.blue { background: #dbeafe; }
.stat-icon.green { background: #dcfce7; }
.stat-icon.orange { background: #fef9c3; }
.stat-icon.red { background: #fee2e2; }

/* Table Section */
.table-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #0f172a;
}

.table-header p {
  margin: 0 0 20px 0;
  font-size: 12px;
  color: #64748b;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  outline: none;
}

.filter-select, .date-input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  outline: none;
}

.btn-export {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  font-size: 11px;
  color: #64748b;
  background: #f8fafc;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 12px;
  font-size: 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  width: 28px;
  height: 28px;
  background: #e2e8f0;
  color: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.btn-foto {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-hadir { background: #dcfce7; color: #15803d; }
.status-terlambat { background: #fef9c3; color: #a16207; }
.status-izin { background: #ffedd5; color: #c2410c; }
.status-sakit { background: #fee2e2; color: #991b1b; }
</style>