
<script setup>
import logo from '../assets/images/logo-pantau-hadir.webp'
import adminIcon from '../assets/icons/monitor-speaker.svg'
import workerIcon from '../assets/icons/hard-hat.svg'

const emit = defineEmits(['select-admin', 'select-pekerja'])

const handleAdminClick = () => {
  emit('select-admin')
}

const handlePekerjaClick = () => {
  emit('select-pekerja')
}
</script>

<template>
  <div class="landing-page">

    <!-- HEADER -->
    <header class="landing-header">
      <img
  :src="logo"
  alt="Logo Pantau Hadir"
  class="landing-logo"
  width="512"
  height="512"
  fetchpriority="high"
  decoding="async"
/>

      <h1>Pantau Hadir</h1>

      <p>Sistem Absensi Pekerja Proyek</p>
    </header>

    <!-- PILIHAN LOGIN -->
    <main class="landing-main">
      <section
        class="login-card landing-card"
        aria-labelledby="user-choice-heading"
      >
        <div class="card-heading">
          <h2 id="user-choice-heading">Masuk Sebagai</h2>

          <p class="landing-description">
            Silakan pilih jenis pengguna untuk melanjutkan.
          </p>
        </div>

        <nav aria-label="Pilih jenis pengguna">
          <ul class="role-options">

            <!-- LOGIN ADMIN -->
            <li>
              <button
                type="button"
                class="role-option"
                @click="handleAdminClick"
              >
                <span class="role-icon">
                  <img
                    :src="adminIcon"
                    alt=""
                    aria-hidden="true"
                  >
                </span>

                <span class="role-text">
                  Masuk sebagai Admin
                </span>

                <svg
                  class="role-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </li>

            <!-- LOGIN PEKERJA -->
            <li>
              <button
                type="button"
                class="role-option"
                @click="handlePekerjaClick"
              >
                <span class="role-icon">
                  <img
                    :src="workerIcon"
                    alt=""
                    aria-hidden="true"
                  >
                </span>

                <span class="role-text">
                  Masuk sebagai Pekerja
                </span>

                <svg
                  class="role-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </li>

          </ul>
        </nav>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <p>&copy; 2026 Pantau Hadir. Hak cipta dilindungi.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ========================================
   LANDING PAGE - DESKTOP
======================================== */

.landing-page {
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  flex-direction: column;
  background: var(--color-canvas);
}

.landing-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-32) var(--space-24) 0;
  text-align: center;
}

.landing-logo {
  display: block;
  width: min(200px, 55vw);
  height: auto;
  margin-bottom: var(--space-16);
}

.landing-header h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(32px, 5vw, var(--text-h1));
  font-weight: 800;
  line-height: var(--leading-tight);
}

.landing-header p {
  margin: var(--space-8) 0 0;
  color: var(--color-muted);
}

.landing-main {
  display: grid;
  flex: 1;
  place-items: center;
  padding: var(--space-24);
}

.landing-card {
  width: min(560px, 100%);
  margin: var(--space-24) auto;
  padding: var(--space-32);
  text-align: center;
  border: 1px solid rgba(8, 2, 100, 0.06);
  box-shadow: 0 12px 32px rgba(8, 2, 100, 0.10);
}

.landing-card h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--text-h3);
  font-weight: 800;
  line-height: var(--leading-tight);
}

.landing-description {
  margin: var(--space-8) 0 var(--space-24);
  color: var(--color-muted);
}

.role-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-16);
  margin: 0;
  padding: 0;
  list-style: none;
}

.role-options li {
  min-width: 0;
}

.role-option {
  display: flex;
  width: 100%;
  min-height: 150px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-16);
  padding: var(--space-24);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(8, 2, 100, 0.10);
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.role-option:hover {
  background: var(--color-secondary);
  box-shadow: 0 12px 24px rgba(8, 2, 100, 0.18);
  transform: translateY(-3px);
}

.role-option:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(8, 2, 100, 0.12);
}

.role-option:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 4px;
}

.role-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-option img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.role-text {
  font-size: var(--text-body);
  font-weight: 700;
  line-height: var(--leading-body);
}

.role-arrow {
  display: none;
}

.landing-footer {
  padding: 0 var(--space-24) var(--space-24);
  color: var(--color-muted);
  text-align: center;
}

.landing-footer p {
  margin: 0;
  font-size: var(--text-caption);
}

/* ========================================
   ANIMASI
======================================== */

@media (prefers-reduced-motion: reduce) {
  .role-option {
    transition: none;
  }

  .role-option:hover,
  .role-option:active {
    transform: none;
  }
}

/* ========================================
   TABLET
======================================== */

@media (max-width: 768px) {
  .landing-header {
    padding-top: 28px;
  }

  .landing-logo {
    width: 170px;
  }

  .landing-card {
    max-width: 500px;
  }
}

/* ========================================
   MOBILE
======================================== */

@media (max-width: 540px) {
  .landing-page {
    min-height: 100vh;
    min-height: 100svh;
    justify-content: flex-start;
  }

  .landing-header {
    padding: 24px 20px 0;
  }

  .landing-logo {
    width: 175px;
    margin-bottom: 14px;
  }

  .landing-header h1 {
    font-size: 29px;
  }

  .landing-header p {
    margin-top: 5px;
    font-size: 14px;
  }

  .landing-main {
    display: flex;
    flex: 1;
    align-items: flex-start;
    justify-content: center;
    padding: 30px 20px 20px;
  }

  .landing-card {
    box-sizing: border-box;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    padding: 26px 20px;
    border-radius: 20px;
    box-shadow: 0 10px 28px rgba(8, 2, 100, 0.10);
  }

  .landing-card h2 {
    font-size: 25px;
  }

  .landing-description {
    max-width: 280px;
    margin: 8px auto 22px;
    font-size: 13px;
    line-height: 1.5;
  }

  .role-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .role-option {
    box-sizing: border-box;
    width: 100%;
    min-height: 76px;
    flex-direction: row;
    justify-content: flex-start;
    gap: 15px;
    padding: 16px 18px;
    border-radius: 13px;
    text-align: left;
  }

  .role-option:hover {
    transform: none;
  }

  .role-option:active {
    transform: scale(0.98);
  }

  .role-option img {
    width: 32px;
    height: 32px;
  }

  .role-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
    text-align: left;
  }

  .role-arrow {
    display: block;
    width: 19px;
    height: 19px;
    flex-shrink: 0;
  }

  .landing-footer {
    padding: 8px 16px 20px;
  }

  .landing-footer p {
    font-size: 11px;
  }
}

/* ========================================
   HP LAYAR KECIL
======================================== */

@media (max-width: 360px) {
  .landing-header {
    padding-top: 20px;
  }

  .landing-logo {
    width: 150px;
  }

  .landing-header h1 {
    font-size: 26px;
  }

  .landing-main {
    padding: 24px 14px 16px;
  }

  .landing-card {
    padding: 22px 16px;
  }

  .landing-card h2 {
    font-size: 23px;
  }

  .role-option {
    min-height: 70px;
    padding: 14px;
  }
}
</style>
