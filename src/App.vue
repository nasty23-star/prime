<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const screenWidth = ref(window.innerWidth)

const updateWidth = () => {
  screenWidth.value = window.innerWidth
}

const isTabletAndMore = computed(() => screenWidth.value > 600)

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<template>
  <div class="wrapper">
    <header>
      <div class="header-container">
        <div class="header">Hacker News</div>
        <nav class="navigation">
          <router-link to="/favourite" class="nav-link" :class="{ active: $route.path === '/home' }"
            ><i class="pi pi-heart icon"></i>
            <span v-if="isTabletAndMore">Избранное</span></router-link
          >
          <router-link to="/" class="nav-link">
            <i class="pi pi-home icon"></i>
            <span v-if="isTabletAndMore">Главная</span></router-link
          >
        </nav>
      </div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  margin: auto;
}

nav {
  gap: 10px;
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
    padding-top: 10px;
    text-decoration: none;
    width: 40px;
    height: 40px;
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

@media (min-width: 600px) {
  .header-container {
    padding-left: 40px;
    padding-right: 40px;
  }
  nav {
    a {
      width: 86px;
    }
  }
}
</style>
