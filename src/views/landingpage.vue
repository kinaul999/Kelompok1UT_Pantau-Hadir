<script setup>
import logo from '../assets/images/logo-pantau-hadir.svg'
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
    <header class="landing-header">
      <img
        class="landing-logo"
        :src="logo"
        width="200"
        alt="Logo Pantau Hadir"
      >
      <h1>Pantau Hadir</h1>
      <p>Sistem Absensi Pekerja Proyek</p>
    </header>

    <main class="landing-main">
      <section class="login-card landing-card" aria-labelledby="user-choice-heading">
        <h2 id="user-choice-heading">Masuk Sebagai</h2>
        <p class="landing-description">Silakan pilih jenis pengguna untuk melanjutkan.</p>

        <nav aria-label="Pilih jenis pengguna">
          <ul class="role-options">
            <li>
              <button 
                type="button" 
                @click="handleAdminClick" 
                class="role-card role-option w-full"
              >
                <img :src="adminIcon" alt="" aria-hidden="true">
                <span>Masuk sebagai Admin</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                @click="handlePekerjaClick" 
                class="role-card role-option w-full"
              >
                <img :src="workerIcon" alt="" aria-hidden="true">
                <span>Masuk sebagai Pekerja</span>
              </button>
            </li>
          </ul>
        </nav>
      </section>
    </main>

    <footer class="landing-footer">
      <p>&copy; 2026 Pantau Hadir. Hak cipta dilindungi.</p>
    </footer>
  </div>
</template>

<style scoped>

.role-option {
  border: none;
  cursor: pointer;
  width: 100%;
}

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

.role-option {
  display: flex;
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
  text-decoration: none;
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

@media (prefers-reduced-motion: reduce) {
  .role-option {
    transition: none;
  }

  .role-option:hover,
  .role-option:active {
    transform: none;
  }
}


.role-option img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.role-option span {
  font-size: var(--text-body);
  font-weight: 700;
  line-height: var(--leading-body);
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

@media (max-width: 540px) {
  
.landing-header {
  padding-bottom: 0;
}

.landing-logo {
  margin-bottom: var(--space-12);
}

.landing-header p {
  margin-top: var(--space-4);
}

.landing-main {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

.landing-card {
  margin-top: var(--space-16);
  margin-bottom: var(--space-16);
}

.landing-footer {
  padding-top: var(--space-8);
}
}
</style>