<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="wrapper">
    <header><div class="header">Hacker News</div></header>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

header {
  width: auto;
  background: linear-gradient(135deg, #72beca 0%, #366ea6 100%);
  height: 70px;
  font-size: 24px;
  font-weight: 600;
  color: white;
  padding-left: 60px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
