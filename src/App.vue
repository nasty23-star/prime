<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="wrapper">
    <header>
      <div class="header">Hacker News</div>
      <nav class="navigation">
        <router-link to="/favourite" class="nav-link" :class="{ active: $route.path === '/home' }"
          ><i class="pi pi-heart icon"></i> Избранное</router-link
        >
        <router-link to="/" class="nav-link">
          <i class="pi pi-home icon"></i>
          Главная</router-link
        >
      </nav>
    </header>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
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
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
}

nav {
  gap: 10px;
  padding-right: 60px;
  height: 70px;
  display: flex;

  align-items: center;
  font-weight: 500;
  font-size: 15px;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 4px;
    padding-top: 4px;
    text-decoration: none;
    width: 86px;
    color: #ffffff;
  }

  a:hover {
    color: #111751;
  }

  a:active {
    color: #111751;
  }
}

.router-link-active {
  color: #111751;
}

@media (min-width: 420px) {
  .container {
    padding: 20px;
  }
}
</style>
