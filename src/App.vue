<template>
  <div id="app">
    <!-- Tag ini akan menampilkan halaman secara dinamis berdasarkan URL (Login/Rekapitulasi) -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Reset dasar untuk seluruh aplikasi */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, Helvetica, sans-serif;
}
</style>