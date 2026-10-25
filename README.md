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
