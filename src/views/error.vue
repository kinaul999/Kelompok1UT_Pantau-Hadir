<script setup>
import logo from '../assets/images/logo-pantau-hadir.svg'
import errorIcon from '../assets/icons/error.svg'
import homeIcon from '../assets/icons/house.svg'
import constructionImage from '../assets/images/images-konstruksi-biru.jpg'
</script>

<template>
  <div class="error-page">
    <header class="error-header">
      <img
        :src="logo"
        alt="Pantau Hadir - Sistem Absensi Pekerja Proyek"
      >
    </header>

    <main class="error-main">
      <div class="error-background" aria-hidden="true">
        <img :src="constructionImage" alt="">
      </div>

      <section class="error-content" aria-labelledby="error-title">
        <h1 id="error-title" class="page-title error-title">
          Mohon maaf!
        </h1>

        <img
          class="error-icon"
          :src="errorIcon"
          alt="Terjadi kesalahan"
        >

        <p class="error-message">
          Tidak bisa terhubung dengan server.
        </p>

        <a href="index.html" class="btn btn-primary error-home-link">
          <img :src="homeIcon" alt="">
          <span>Kembali ke Beranda</span>
        </a>
      </section>
    </main>
  </div>
</template>



<style scoped>
.error-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
  background: var(--color-canvas);
}

.error-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  min-height: 88px;
  padding: var(--space-16) var(--space-32);
}

.error-header img {
  width: 150px;
  height: auto;
  object-fit: contain;
}

.error-main {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 1;
  min-height: 0;
  place-items: center;
  padding: var(--space-32) var(--space-24);
}

.error-background {
  position: absolute;
  z-index: -1;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}


.error-background img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  opacity: 0.58;
}


.error-content {
  display: flex;
  width: min(100%, 600px);
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: clamp(30px, 4vw, var(--text-h1));
  line-height: var(--leading-tight);
  text-transform: capitalize;
}

.error-icon {
  width: min(180px, 38vw);
  height: auto;
  margin: var(--space-24) 0;
  object-fit: contain;
  filter: brightness(0) saturate(100%)
          invert(18%) sepia(91%) saturate(5500%)
          hue-rotate(350deg) brightness(95%) contrast(105%);
}

.error-message {
  margin: 0 0 var(--space-24);
  color: var(--color-text-strong);
  font-size: var(--text-h4);
  line-height: var(--leading-body);
}

.error-home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--control-height);
  position: relative;
  z-index: 2;
}


.error-home-link img {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}


@media (max-width: 600px) {
  .error-header {
    min-height: 72px;
    padding: var(--space-16) var(--space-24);
  }

  .error-header img {
    width: 120px;
  }

  .error-main {
    padding: var(--space-24) var(--space-16);
  }

  .error-background img {
    object-position: center;
    opacity: 0.4;
  }

  .error-icon {
    width: min(150px, 38vw);
    margin: var(--space-16) 0;
  }

  .error-message {
    font-size: 18px;
  }
}
</style>
