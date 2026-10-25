
<script setup>
import iconLogOut from '../assets/icons/log-out.svg'
import logoPantauHadir from '../assets/images/logo-pantau-hadir.svg'

const emit = defineEmits(['logout-trigger'])

const handleLogoutClick = () => {
  emit('logout-trigger')
}
</script>

<template>
  <div class="mobile-shell">
    <header class="success-topbar">
      <nav aria-label="Navigasi Header">
        <button
          type="button"
          class="btn-exit"
          aria-label="Keluar ke halaman utama"
          @click="handleLogoutClick"
        >
          <img
            :src="iconLogOut"
            alt=""
            width="20"
            height="20"
            aria-hidden="true"
          />
          <span>Keluar</span>
        </button>
      </nav>
    </header>

    <main class="success-main">
      <section
        class="success-content"
        aria-labelledby="success-heading"
      >
        <div
          class="success-badge"
          role="img"
          aria-label="Tanda Berhasil"
        >
          <svg
            class="check-glyph"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12.5L9.5 18L20 6.5"
              stroke="#ffffff"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1 id="success-heading" class="success-title">
          ABSEN ANDA TERKIRIM!
        </h1>
      </section>
    </main>

    <footer class="success-footer">
      <img
        :src="logoPantauHadir"
        alt="Logo Pantau Hadir - Sistem Absensi Pekerja Proyek"
        width="140"
        height="76"
        class="brand-logo"
      />
    </footer>
  </div>
</template>

<style scoped>
.mobile-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.success-topbar {
  flex-shrink: 0;
  background-color: var(--color-header, #f58220);
  padding: 12px 20px;
}

.success-topbar nav {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn-exit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-primary, #080264);
  border: 2px solid var(--color-primary, #080264);
  border-radius: var(--radius-sm, 8px);
  padding: 8px 18px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
}

.btn-exit:hover {
  background-color: #f2f4fa;
}

.btn-exit:focus-visible {
  outline: 3px solid var(--color-primary, #080264);
  outline-offset: 2px;
}

.btn-exit:active {
  transform: scale(0.98);
}

.success-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.success-badge {
  width: 136px;
  height: 136px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #00d616;
  border: 2.5px solid #00d616;
  outline: 2px solid #00d616;
  outline-offset: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto 20px;
}

.check-glyph {
  width: 70px;
  height: 70px;
}

.success-title {
  font-family: var(--font-family, sans-serif);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--color-text-strong, #111111);
  text-align: center;
  letter-spacing: 0.02em;
  margin: 0;
}

.success-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 16px 20px 24px;
  margin-top: auto;
}

.brand-logo {
  display: block;
  width: 140px;
  max-width: 100%;
  height: auto;
}

@media (max-width: 480px) {
  .success-main {
    padding: 20px 16px;
  }

  .success-badge {
    width: 120px;
    height: 120px;
  }

  .check-glyph {
    width: 62px;
    height: 62px;
  }

  .success-title {
    font-size: 20px;
  }
}
</style>
