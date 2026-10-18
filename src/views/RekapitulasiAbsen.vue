<template>
  <div class="rekapitulasi-container">
    <div class="header-section">
      <h2>Rekapitulasi Absensi Pegawai</h2>
      <p class="subtitle">Data presensi harian karyawan berdasarkan rekam data sistem</p>
    </div>

    <!-- Section Filter & Pencarian -->
    <div class="filter-card">
      <div class="filter-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama karyawan..."
          class="form-input"
        />
        <select v-model="selectedStatus" class="form-select">
          <option value="">Semua Status</option>
          <option value="Hadir">Hadir</option>
          <option value="Terlambat">Terlambat</option>
          <option value="Izin">Izin</option>
          <option value="Sakit">Sakit</option>
        </select>
      </div>
      <div class="summary-pills">
        <span class="pill pill-total">Total: {{ listPresensi.length }}</span>
        <span class="pill pill-hadir">Hadir: {{ countStatus('Hadir') }}</span>
        <span class="pill pill-terlambat">Terlambat: {{ countStatus('Terlambat') }}</span>
        <span class="pill pill-izin">Izin/Sakit: {{ countStatus('Izin') + countStatus('Sakit') }}</span>
      </div>
    </div>

    <!-- Tabel Data Presensi -->
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Bukti Masuk</th>
            <th>Jam Pulang</th>
            <th>Bukti Pulang</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.No">
            <td>{{ item.No }}</td>
            <td class="font-medium">{{ item.Nama }}</td>
            <td>{{ item.Tanggal }}</td>
            <td>{{ item.JamMasuk }}</td>
            <td>
              <button
                v-if="item['Bukti Masuk'] !== '-'"
                class="btn-bukti"
                @click="showProof(item.Nama, 'Masuk')"
              >
                📷 Lihat Foto
              </button>
              <span v-else class="text-muted">-</span>
            </td>
            <td>{{ item['Jam Pulang'] }}</td>
            <td>
              <button
                v-if="item['Bukti Pulang'] !== '-'"
                class="btn-bukti"
                @click="showProof(item.Nama, 'Pulang')"
              >
                📷 Lihat Foto
              </button>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(item.Status)]">
                {{ item.Status }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td colspan="8" class="text-center empty-state">
              Data presensi tidak ditemukan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Pratinjau Foto Bukti -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <h3>Bukti Presensi {{ modalTitle }}</h3>
        <div class="modal-body">
          <div class="photo-placeholder">
            <span>[Pratinjau Foto {{ modalTitle }}]</span>
          </div>
        </div>
        <button class="btn-close" @click="closeModal">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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
</script>

<style scoped>
.rekapitulasi-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
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
</style>
