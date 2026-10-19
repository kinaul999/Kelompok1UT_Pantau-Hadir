<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import logo from '../assets/images/logo-pantau-hadir.svg'
import constructionImage from '../assets/images/images-konstruksi-biru.jpg'
import hardHatIcon from '../assets/icons/hard-hat.svg'
import checkIcon from '../assets/icons/circle-check.svg'
import absentIcon from '../assets/icons/circle-x.svg'
import logoutIcon from '../assets/icons/log-out.svg'
import usersIcon from '../assets/icons/users.svg'

const totalWorkers = ref(45)
const presentWorkers = ref(45)
const now = ref(new Date())

const absentWorkers = computed(() => Math.max(0, totalWorkers.value - presentWorkers.value))
const attendancePercentage = computed(() => (
  totalWorkers.value > 0
    ? Math.round((presentWorkers.value / totalWorkers.value) * 100)
    : 0
))

const dateLabel = computed(() => new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
}).format(now.value))

const timeLabel = computed(() => `${new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
}).format(now.value)} WIB`)

let clockInterval

onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(clockInterval)
})

const emit = defineEmits([
  'admin-logout-trigger',
  'data-pekerja-trigger',
  'rekapitulasi-absen-trigger',
  'admin-dashboard-trigger'
])
</script>

<template>
  <div class="layout-admin dashboard-shell">
    <aside class="sidebar dashboard-sidebar">
      <div class="sidebar-logo dashboard-brand">
        <img :src="logo" alt="Logo Pantau Hadir">
      </div>

      <nav class="dashboard-nav" aria-label="Navigasi utama">
        <a href="#dashboard" class="nav-item active is-active" aria-current="page" @click.prevent="emit('admin-dashboard-trigger')">
          <span class="nav-icon" aria-hidden="true">▦</span>
          <span>Dashboard</span>
        </a>
        <a href="#rekap" class="nav-item" @click.prevent="emit('rekapitulasi-absen-trigger')">
          <span class="nav-icon" aria-hidden="true">▤</span>
          <span>Rekapitulasi Absensi</span>
        </a>
        <a href="#data-pekerja" class="nav-item" @click.prevent="emit('data-pekerja-trigger')">
          <span class="nav-icon" aria-hidden="true">♙</span>
          <span>Data Pekerja</span>
        </a>
      </nav>

      <div class="sidebar-footer dashboard-sidebar-footer">
        <a href="#keluar" class="logout-button" @click.prevent="emit('admin-logout-trigger')">
          <img :src="logoutIcon" alt="">
          <span>Keluar</span>
        </a>
        <p class="sidebar-copy dashboard-copyright">
          © 2026 Pantau Hadir<br>
          Sistem Absensi Pekerja Proyek
        </p>
      </div>
    </aside>

    <main class="main dashboard-main">
      <header class="topbar">
        <div class="company-name">PT. Jalan Baru</div>
        <div class="admin-profile">
          <span>Administrator</span>
          <div class="profile-avatar">
            <img :src="usersIcon" alt="Profil administrator">
          </div>
        </div>
      </header>

      <section class="dashboard-content">
        <div class="page-heading">
          <div>
            <span class="eyebrow">RINGKASAN AKTIVITAS</span>
            <h1>Dashboard</h1>
            <p>Selamat datang kembali, Administrator!</p>
          </div>
        </div>

        <div class="datetime-bar" aria-live="off">
          <div class="date-info">
            <span class="info-dot" aria-hidden="true"></span>
            <div>
              <span class="info-label">Tanggal</span>
              <strong>{{ dateLabel }}</strong>
            </div>
          </div>
          <div class="time-info">
            <span class="info-label">Waktu saat ini</span>
            <strong>{{ timeLabel }}</strong>
          </div>
        </div>

        <div class="statistics-grid">
          <article class="stat-card">
            <div class="stat-icon icon-total">
              <img :src="hardHatIcon" alt="">
            </div>
            <div class="stat-details">
              <p>Total Pekerja</p>
              <h2>{{ totalWorkers }}</h2>
              <span class="stat-caption">Pekerja terdaftar</span>
            </div>
          </article>

          <article class="stat-card">
            <div class="stat-icon icon-present">
              <img :src="checkIcon" alt="">
            </div>
            <div class="stat-details">
              <p>Hadir</p>
              <h2>{{ presentWorkers }}</h2>
              <span class="stat-caption">
                <span class="status-dot" aria-hidden="true"></span>
                {{ attendancePercentage }}% dari total pekerja
              </span>
            </div>
          </article>

          <article class="stat-card">
            <div class="stat-icon icon-absent">
              <img :src="absentIcon" alt="">
            </div>
            <div class="stat-details">
              <p>Tidak Hadir</p>
              <h2>{{ absentWorkers }}</h2>
              <span class="stat-caption">
                {{ totalWorkers > 0 ? Math.round((absentWorkers / totalWorkers) * 100) : 0 }}% dari total pekerja
              </span>
            </div>
          </article>
        </div>

        <section class="project-banner" aria-label="Informasi proyek">
          <div class="banner-content">
            <span class="banner-label">PANTAU HADIR</span>
            <h2>Proyek terpantau,<br>Pekerja terdata.</h2>
            <p>
              Kelola kehadiran pekerja proyek dengan lebih mudah dan terorganisir.
            </p>
          </div>
          <div class="banner-illustration">
            <img :src="constructionImage" alt="">
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
}

.dashboard-sidebar {
  min-height: 100vh;
  padding: var(--space-32) 0 var(--space-24);
}

.dashboard-brand img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  overflow: hidden;
}


.dashboard-nav {
  display: grid;
  gap: var(--space-8);
}

.dashboard-nav .nav-item {
  min-height: 52px;
  gap: 12px;
  margin-right: var(--space-16);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transition: background-color 160ms ease;
}

.dashboard-nav .nav-item:not(.is-active):hover {
  background: rgba(255, 255, 255, 0.45);
}

.nav-icon {
  width: 22px;
  flex: 0 0 22px;
  font-size: 20px;
  line-height: 1;
  text-align: center;
}

.dashboard-sidebar-footer {
  padding-top: var(--space-24);
}


.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: calc(100% - 32px);
  min-height: 44px;
  margin: 0 16px 16px;
  padding: 10px 16px;

  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid rgba(8, 2, 100, 0.2);
  border-radius: var(--radius-sm);

  font-weight: 700;
  text-decoration: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 160ms ease,
              box-shadow 160ms ease;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow-panel);
}

.logout-button:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}

.logout-button img {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}


.dashboard-copyright {
  margin-bottom: 0;
  line-height: 1.6;
}

.dashboard-main {
  min-height: 100vh;
}

.topbar {
  min-height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-16);
  padding: 0 var(--space-40);
  background: var(--color-header);
  color: var(--color-text-inverse);
  font-weight: 700;
}

.company-name {
  font-size: 18px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--color-surface);
}

.profile-avatar img {
  width: 22px;
  height: 22px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-32);
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-40);
}

.page-heading h1 {
  margin: 4px 0 8px;
  color: var(--color-primary);
  font-size: clamp(32px, 4vw, var(--text-h1));
  font-weight: 800;
  line-height: var(--leading-tight);
}

.page-heading p {
  margin: 0;
  color: var(--color-muted);
}

.eyebrow,
.banner-label {
  color: var(--color-secondary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.datetime-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-24);
  padding: var(--space-16) var(--space-24);
  border: var(--border-width) solid rgba(8, 2, 100, 0.12);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-dot,
.status-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 50%;
  background: var(--color-success);
}

.date-info > div,
.time-info {
  display: grid;
  gap: 2px;
}

.info-label {
  color: var(--color-muted);
  font-size: 13px;
}

.datetime-bar strong {
  color: var(--color-primary);
  font-size: 15px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-24);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-16);
  min-width: 0;
  padding: var(--space-24);
  border: var(--border-width) solid rgba(8, 2, 100, 0.1);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.stat-icon {
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  place-items: center;
  border-radius: var(--radius-md);
}

.stat-icon img {
  width: 28px;
  height: 28px;
}

.icon-total {
  background: rgba(93, 45, 235, 0.12);
}

.icon-present {
  background: var(--color-status-hadir-bg);
}

.icon-absent {
  background: var(--color-status-absen-bg);
}

.stat-details {
  min-width: 0;
}

.stat-details p {
  margin: 0 0 2px;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 600;
}

.stat-details h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-caption {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  color: var(--color-muted);
  font-size: 12px;
}

.status-dot {
  width: 7px;
  height: 7px;
  flex-basis: 7px;
  background: var(--color-status-hadir-text);
}

.project-banner {
  position: relative;
  display: flex;
  min-height: 270px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: var(--space-32) var(--space-40);
  border-radius: var(--radius-xl);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.banner-content {
  position: relative;
  z-index: 1;
  max-width: 470px;
}

.banner-label {
  color: #c5c9e8;
}

.banner-content h2 {
  margin: 10px 0;
  color: var(--color-text-inverse);
  font-size: clamp(27px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.15;
}

.banner-content p {
  max-width: 390px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.banner-illustration {
  align-self: stretch;
  width: min(44%, 420px);
  min-height: 180px;
}

.banner-illustration img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
}

@media (max-width: 1023px) {
  .dashboard-sidebar {
    min-height: auto;
    padding: var(--space-16);
  }

  .dashboard-brand {
    padding: 0 var(--space-16) var(--space-16);
  }

  .dashboard-brand img {
    width: 150px;
    height: 56px;
  }

  .dashboard-nav {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 4px;
  }

  .dashboard-nav .nav-item {
    margin: 0;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }

  .dashboard-sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-16);
    padding: var(--space-16);
  }

  .dashboard-copyright {
    margin-top: 0;
  }

  .topbar {
    padding: 0 var(--space-24);
  }

  .dashboard-content {
    padding: var(--space-32) var(--space-24);
  }
}

@media (max-width: 700px) {
  .dashboard-nav .nav-item {
    gap: 7px;
    padding: 9px;
    font-size: 13px;
  }

  .nav-icon {
    width: 18px;
    flex-basis: 18px;
  }

  .datetime-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-16);
  }

  .statistics-grid {
    grid-template-columns: 1fr;
    gap: var(--space-16);
  }

  .stat-card {
    padding: var(--space-16);
  }

  .project-banner {
    min-height: 360px;
    align-items: flex-start;
    flex-direction: column;
    padding: var(--space-24);
  }

  .banner-illustration {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 68%;
    height: 190px;
    opacity: 0.85;
  }

  .banner-content {
    max-width: 100%;
  }

  .banner-content p {
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .dashboard-sidebar {
    display: block;
  }

  .dashboard-nav {
    display: grid;
  }

  .dashboard-nav .nav-item {
    margin-right: 0;
    padding: 10px 12px;
  }

  .dashboard-sidebar-footer {
    align-items: flex-start;
    padding: var(--space-16) 0 0;
  }

  .dashboard-copyright {
    font-size: 10px;
  }

  .topbar {
    padding: 0 var(--space-16);
    font-size: 14px;
  }

  .company-name {
    font-size: 15px;
  }

  .admin-profile {
    gap: 8px;
  }

  .dashboard-content {
    gap: var(--space-24);
    padding: var(--space-24) var(--space-16);
  }
}
</style>