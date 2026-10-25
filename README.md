> Proyek ini menggunakan satu repositori berkelanjutan untuk Modul 7 dan Modul 8. Dokumentasi, spesifikasi rute, serta **Prompt Log untuk Modul 7 tetap dipertahankan utuh di bagian paling bawah halaman ini** agar memudahkan rekam penilaian modul sebelumnya.
----------------------------------------------------------------------------------------------------------------------------------------
**DOKUMEN PENUGASAN MODUL 8: INTEGRASI DATA DINAMIS & DEPLOYMENT**

**Aplikasi: Pantau Hadir (Sistem Absensi Pekerja Proyek)**

**1\. INFORMASI UTAMA PROYEK**

- **Nama Kelompok:** Kelompok 1 UT
- **Link Repositori GitHub (Publik):** <https://github.com/kinaul999/Kelompok1UT_Pantau-Hadir>
- **Link Live Web Produksi (Vercel):** <https://pantauhadir.vercel.app>

**2\. PENJELASAN SUMBER DATA & LAYANAN (SERVICES USED)**

Aplikasi **Pantau Hadir** pada Modul 8 ini telah sepenuhnya bermigrasi dari data statis (_hardcoded_) menjadi aplikasi berbasis **Data Dinamis (Stateful)** dengan memanfaatkan layanan cloud berikut:

- **Database & Autentikasi Cloud (Supabase):** Digunakan sebagai penyimpanan data utama (_Real-time Database_). Kami mengintegrasikan tabel Workers dan Sites menggunakan _Supabase JS Client_ untuk menangani operasi pengambilan data (_Read/Fetch_) serta penyimpanan data baru (_Write/Insert_).
- **Hosting & Deployment (Vercel):** Digunakan untuk mempublikasikan aplikasi secara otomatis dari repositori GitHub. Keamanan _Database API Key_ dijaga menggunakan mekanisme _Environment Variables_ (.env) yang dienkripsi pada panel kontrol Vercel agar tidak bocor ke publik.

**3\. PANDUAN PENGUJIAN SISTEM & KREDENSIAL AKUN**

Untuk memudahkan Penguji/Mentor dalam melakukan _Usability Testing_, berikut adalah alur rute halaman beserta kredensial akun yang dapat digunakan:

**A. Pengujian Role: Administrator (Admin Flow - Desktop)**

- **Halaman yang Dicoba:** Landing Page > Pilih "Masuk Sebagai Admin" > Masuk Admin > Admin Dashboard > Data Pekerja > Tambah Pekerja > Keluar.
- **Kredensial Login Admin:**
  - **NIK:** ADM001
  - **Kata Sandi:** PSW001
- **Fitur Dinamis yang Dapat Diuji:**
  1. Melihat grafik rekapitulasi data total pekerja secara _real-time_ dari database.
  2. Melakukan pencarian nama karyawan dan penyaringan (_filtering_) status pada halaman rekapitulasi absensi.
  3. Membuka form **Tambah Pekerja**, di mana pilihan rute "Lokasi Kerja" sudah ditarik secara dinamis dari tabel Sites Supabase.
  4. Mencoba memasukkan data pekerja baru dan memeriksa apakah data tersebut beneran tersimpan di database.

**B. Pengujian Role: Pekerja (Worker Flow - Mobile)**

- **Halaman yang Dicoba:** Landing Page > Pilih "Masuk Sebagai Pekerja" > Masuk Pekerja > Pekerja Dashboard > Ambil Foto & Absen > Keluar
- **Kredensial Login Pekerja:**
  - **NIK:** P0002
  - **Kata Sandi (Password):** workers2
- **Fitur Dinamis yang Dapat Diuji:**
  - Melakukan validasi form.
  - Melakukan submit absensi kehadiran masuk/pulang proyek.

**4\. LOG PROMPT AI & CATATAN PERBAIKAN MANUAL**

Sesuai dengan regulasi penggunaan teknologi pendukung, berikut adalah dokumentasi interaksi dengan AI Tools selama pengembangan Modul 8:

- **Log Prompt**
  - _\[TambahPekerja.vue\] check errors for this file cause this page isn't loading in browser. make sure input fields corresponds to database_
  - _in \[DataPekerja.vue\] make the "aksi" to "\[edit\]" and "\[hapus\]" corresponds to database. make the "\[edit\]" action becomes a modal that mimics the \[TambahPekerja.vue\] page that will send updated data to database_
- **Catatan Perbaikan Manual:**
  - **Row-Level Security (RLS):** Melakukan konfigurasi manual kebijakan _Security Policy_ (perintah ALL dengan ekspresi true) pada dashboard Supabase agar aplikasi web di Vercel diizinkan melakukan operasi modifikasi data secara aman menggunakan _Anon Key_.
  - **Layout Responsif:** Menyempurnakan struktur wadah layout admin yang sempat _clashing_ dan memasang banner informasi deteksi layar mobile (@media (max-width: 1024px)) agar pengalaman pengguna di desktop tetap maksimal.

---------------------------------------------------------------------------------------------------------------

---------------------------------------------------------------------------------------------------------------
PROMPT LOG TUGAS 7
KELOMPOK 1 UT



Dikerjakan oleh: KINTAN AULIA
style.css
Prompt: TUGAS 5 - Prototype.fig create a style.css styling guide based on this figma prototype

PekerjaLogin
Prompt:
> [antislop](slashCommand;antislop) Tolong konversikan kode HTML halaman login pekerja konstruksi berikut menjadi komponen Vue 3 utuh menggunakan Composition API (<script setup>).

Ketentuan Wajib:
1. Masukkan kerangka UI ke dalam tag <template>. Pastikan tata letak dan token visual mengikuti design system global dari 'src/style.css' yang sudah ada (gunakan kelas .login-card, .btn-primary, .input, dll).
2. Di dalam <script setup>, buat state reaktif (menggunakan ref) untuk menampung input Nomor Induk Pekerja dan Sandi.
3. Tulis fungsi 'handleLogin' yang bersih tanpa komentar tidak berguna. Fungsi ini harus memicu event emit '@login-success' ketika tombol masuk diklik oleh pengguna.
4. Terapkan prinsip antislop: Jangan tambahkan library external baru, optimalkan manipulasi DOM lewat data binding Vue, dan hilangkan script tag bawaan HTML lama.

Berikut kode HTML-nya:
[menyalin isi pekerja-login.html]



PekerjaDashboard
Prompt:
> /antislop [CONTEXT: antislop-ai standards active. Clean high fidelity code]

Tolong konversikan kode HTML dashboard pekerja konstruksi ini menjadi komponen Vue 3 (Composition API) utuh di dalam satu file .vue.

Ketentuan Wajib:
1. Kerangka UI dimasukkan ke tag <template> dan wajib dibungkus oleh kelas `.mobile-shell` agar visualnya berbentuk bingkai HP mobile presisi sesuai Figma Modul 5 dan terhubung ke 'src/style.css'.
2. Implementasikan minimal 2 Aksi Interaktif Stateful Dinamis menggunakan state reaktif Vue (ref):
   - Aksi 1: Menu hamburger / Navigation Drawer samping yang bisa dibuka-tutup secara dinamis saat ikon menu diklik (gunakan v-if atau toggle class).
   - Aksi 2: Tombol absensi kehadiran. Jika diklik, ubah status state untuk memunculkan Pop-up Modal tiruan yang menampilkan kamera aktif (menggunakan kelas `.camera-frame`) untuk simulasi deteksi wajah pekerja.
3. Gunakan gambar/ikon dari path folder baru kita: `src/assets/icons/` dan `src/assets/images/`.

Berikut kode HTML-nya:
[menyalin isi pekerja-dashboard.html]

Refaktorisasi:
> Mengubah bagian waktu server yang sebelumnya dikunci mati menggunakan tanggal statis: new Date('2026-10-02...') mengikuti pekerja-dashboard.html, menjadi mengikuti waktu lokal.
> Mengubah modal popup kamera template hitam menjadi stream kamera depan asli dan simulasi aksi deteksi wajah dan pengambilan absen.

AbsenSukses
Prompt:
[antislop](slashCommand;antislop) [CONTEXT: antislop-ai standards active. Clean high fidelity code. Strictly avoid placeholder methods or bloated divs]

Tolong konversikan kode HTML halaman sukses absensi pekerja konstruksi berikut menjadi komponen Vue 3 utuh menggunakan Composition API (<script setup>).

Ketentuan Wajib:
1. Kerangka UI dimasukkan ke tag <template> dan harus dibungkus oleh kelas `.mobile-shell` agar visualnya konsisten berbentuk bingkai HP mobile serta terhubung ke design system global 'src/style.css' dengan gambar terlampir sebagai referensi prototype.
2. Di dalam <script setup>, daftarkan fungsi pemancar sinyal (defineEmits) bernama 'logout-trigger'.
3. Buat fungsi 'handleLogoutClick' yang bersih tanpa komentar sampah. Fungsi ini harus memicu event emit 'logout-trigger' ketika tombol kembali diklik oleh pekerja untuk melompat kembali ke landing page.
4. Gunakan aset gambar/ikon dari path folder baru kita: `src/assets/icons/` dan `src/assets/images/` untuk menggantikan file gambar lama.
5. Terapkan prinsip antislop-ai: Kode harus efisien, ringkas, dan langsung siap pakai untuk prototipe interaktif lokal.

Berikut kode HTML murni minggu lalu:
[absen-sukses.html]

DataPekerja
/antislop [CONTEXT: antislop-ai standards active. Clean high fidelity code. Strictly avoid placeholder methods or bloated divs]

Tolong konversikan kode HTML halaman sukses absensi pekerja konstruksi berikut menjadi komponen Vue 3 utuh menggunakan Composition API (<script setup>).

Ketentuan Wajib:
1. Kerangka UI dimasukkan ke tag <template> dan harus dibungkus oleh kelas `.mobile-shell` agar visualnya konsisten berbentuk bingkai HP mobile serta terhubung ke design system global 'src/style.css'.
2. Di dalam <script setup>, daftarkan fungsi pemancar sinyal (defineEmits) bernama 'admin-logout-trigger', ‘rekapitulasi-absen-trigger’, ‘admin-dashboard-trigger’.
3. Buat fungsi 'handleLogoutClick', ‘handleRekapClick’, ‘handleDashboardClick’yang bersih tanpa komentar sampah. Fungsi ini harus memicu event emit 'admin-logout-trigger', ‘rekapitulasi-absen-trigger’, ‘admin-dashboard-trigger’ ketika tombol kembali diklik oleh pekerja untuk melompat kembali ke landing page, rekapitulasi absen page, dan dashboard page.
4. Gunakan aset gambar/ikon dari path folder baru kita: `src/assets/icons/` dan `src/assets/images/` untuk menggantikan file gambar lama.
5. Terapkan prinsip antislop-ai: Kode harus efisien, ringkas, dan langsung siap pakai untuk prototipe interaktif lokal.

Berikut kode HTML murni minggu lalu:
[data-pekerja.html]


AdminDashboard
Prompt:
Tolong konversikan kode HTML halaman admin dashboard berikut menjadi komponen Vue 3 utuh menggunakan Composition API (<script setup>)

 Ketentuan Wajib:
1. Masukkan kerangka UI ke dalam tag <template>. Pastikan tata letak dan token visual mengikuti design system global dari 'src/style.css' yang sudah ada (gunakan kelas .login-card, .btn-primary, .input, dll).
2. Gunakan Composition API melalui `<script setup>`. Manfaatkan `ref` dan `computed` jika diperlukan untuk mengelola tanggal, waktu, total pekerja, jumlah hadir, jumlah tidak hadir, dan persentase kehadiran. Jangan menggunakan JavaScript DOM manipulation secara manual.
3. Pertahankan tiga kartu statistik, yaitu Total Pekerja, Hadir, dan Tidak Hadir. Gunakan data contoh awal 45 pekerja, 45 hadir, dan 0 tidak hadir. Hitung persentase kehadiran secara otomatis berdasarkan data tersebut. Pastikan nilai statistik mudah diubah pada pengembangan berikutnya.
4. Pertahankan penggunaan logo, ikon, dan ilustrasi konstruksi dari path aset yang tersedia pada HTML asli. Jangan mengganti gambar dengan gambar baru, emoji, atau placeholder. Pastikan seluruh gambar tampil dengan ukuran, posisi, dan proporsi yang sesuai. Jika path aset perlu disesuaikan dengan struktur proyek Vue, jelaskan perubahan yang diperlukan.

Berikut kode HTML-nya:
[menyalin isi admin-dashboard.html]

Refaktorisasi:
>Memperbaiki tampilan tombol Keluar agar berbentuk kotak dengan latar putih, border, dan sudut membulat.
>Menyesuaikan ukuran dan styling ilustrasi konstruksi pada banner agar lebih proporsional.

Error
Prompt:
Tolong konversikan kode HTML halaman Error berikut menjadi komponen Vue 3 yang utuh menggunakan Composition API (`<script setup>`).

Ketentuan Wajib:
1. Masukkan seluruh kerangka UI ke dalam tag `<template>`. Pastikan tata letak, warna, tipografi, spacing, tombol, dan token visual mengikuti design system global dari `src/style.css` yang sudah tersedia di repository. Gunakan kembali variabel CSS, class, dan komponen yang relevan jika tersedia. Jangan membuat ulang styling global atau mengubah desain halaman lain.
2. Gunakan Vue 3 Composition API melalui `<script setup>`. Gunakan `ref` atau `computed` hanya jika diperlukan. Hindari manipulasi DOM manual dan jangan menambahkan logika JavaScript yang tidak dibutuhkan oleh halaman Error/Galat.
3. Tampilan Error/Galat: Pertahankan struktur dan desain visual dari HTML asli, termasuk judul atau kode error, pesan penjelasan, ilustrasi atau ikon, serta tombol tindakan yang tersedia. Pastikan hierarki informasi jelas, tampilan rapi, dan pengguna mudah memahami bahwa halaman sedang menampilkan kondisi error.
4. Pertahankan seluruh tautan dan tombol sesuai dengan HTML asli. Pastikan tombol seperti Kembali, Coba Lagi, atau Kembali ke Dashboard hanya digunakan jika memang tersedia pada desain atau kode sumber. Jangan mengarang alamat halaman, fungsi tombol, atau perilaku navigasi baru. Jika terdapat tombol tindakan, gunakan navigasi yang sesuai dengan struktur proyek Vue yang sudah ada.
5. Pertahankan penggunaan ikon, logo, ilustrasi, dan aset lain dari path yang tersedia pada HTML asli. Jangan mengganti aset dengan gambar baru, emoji, atau placeholder. Jika path perlu disesuaikan dengan struktur proyek Vue/Vite, periksa direktori aset terlebih dahulu dan jelaskan perubahan yang diperlukan.

Berikut kode HTML-nya:
[menyalin isi admin-dashboard.html]


Refaktorisasi:
>Mengubah warna ikon error menjadi merah dan ikon rumah pada tombol menjadi putih.
>Menyesuaikan ukuran ikon, jarak antar elemen, dan posisi konten agar lebih seimbang.

Landingpage
Prompt:
Tolong konversikan kode HTML halaman Landing Page berikut menjadi komponen Vue 3 utuh menggunakan Composition API (`<script setup>`).
Ketentuan Wajib:
1. Struktur dan Design System: Masukkan kerangka UI ke dalam tag <template>. Pastikan tata letak dan token visual mengikuti design system global dari 'src/style.css' yang sudah ada (gunakan kelas .login-card, .btn-primary, .input, dll). Gunakan kembali variabel CSS, class, dan komponen yang relevan jika tersedia. Jangan membuat ulang sistem desain atau mengubah styling global yang dapat memengaruhi halaman lain.
2. Halaman landing page hanya berfungsi sebagai halaman awal untuk memilih jenis pengguna yang akan masuk ke sistem Pantau Hadir. Sediakan dua pilihan utama, yaitu Masuk sebagai Pekerja dan Masuk sebagai Admin. 
3. Pertahankan penggunaan logo, ikon, ilustrasi, dan aset lain dari path yang tersedia pada HTML asli. Jangan mengganti aset dengan gambar baru, emoji, atau placeholder. Jika path aset perlu disesuaikan dengan struktur proyek Vue/Vite, periksa direktori aset terlebih dahulu dan jelaskan perubahan yang diperlukan.
4. Gunakan Vue 3 Composition API melalui `<script setup>`. Karena landing page hanya berfungsi sebagai halaman pemilihan jenis pengguna, jangan menambahkan `ref`, `computed`, atau logika JavaScript jika memang tidak diperlukan. Gunakan navigasi yang sesuai dengan struktur proyek yang sudah ada.
Berikut kode HTML-nya:
[menyalin isi landingpage.html]
Refaktorisasi:
>Mengubah warna ikon Admin dan Pekerja menjadi putih menggunakan CSS filter.
>Menyesuaikan tampilan kartu pilihan, border, dan bayangan.
>Menambahkan efek hover dan interaksi tombol


RekapitulasiAbsen (Agil Prasetya)
Prompt:
> Tolong konversikan kode HTML halaman Rekapitulasi Absensi berikut menjadi komponen Vue 3 utuh menggunakan Composition API (`<script setup>`).
Ketentuan Wajib:
1. Masukkan kerangka UI ke dalam tag <template>. Pastikan tata letak dan token visual mengikuti design system global dari 'src/style.css' yang sudah ada.
2. Gunakan Vue 3 Composition API melalui `<script setup>`. Manfaatkan `ref` dan `computed` untuk mengelola data rekapitulasi absensi, pencarian, dan pemfilteran daftar kehadiran pekerja secara reaktif tanpa manipulasi DOM manual.
3. Sediakan tabel/daftar rekapitulasi absensi yang dinamis dengan fitur pencarian dan modal detail foto/bukti absensi saat baris atau tombol detail diklik.
4. Pertahankan logo, ikon, dan aset pendukung dari path folder `src/assets/`.
Berikut kode HTML-nya:
[menyalin isi rekapitulasiabsen.html]
Refaktorisasi:
>Menyesuaikan impor dan penamaan komponen menjadi `rekapitulasiabsen.vue` di `App.vue`.
>Mengatasi konflik penggabungan file (`.gitignore`, `README.md`, `index.html`, `package.json`, `App.vue`) pada branch `dev` menggunakan opsi `--allow-unrelated-histories` dan `checkout --ours`.
>Menyelaraskan styling modal detail absensi dan elemen tabel rekapitulasi agar konsisten dengan token visual global pada `src/style.css`.
