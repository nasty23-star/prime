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
  background: #3732b3;
  height: 90px;
  font-size: 24px;
  font-weight: 600;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  color: white;
  padding: 30px;
  padding-left: 60px;
}
</style>
