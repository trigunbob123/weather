<template>
  <div id="app" class="weather-app">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
#app {
  min-height: 100vh;
}
</style>