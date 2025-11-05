<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>Hacker News</header>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

header {
  width: auto;
  background: linear-gradient(135deg, #72beca 0%, #366ea6 100%);
  height: 90px;
  font-size: 24px;
  font-weight: 600;
  color: white;
  padding: 30px;
  padding-left: 60px;
}
</style>
