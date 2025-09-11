<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}
.spinner {
  display: flex;
}
header {
  display: flex;
  justify-content: center;
  margin: 20px;
}
.card {
  width: auto;
  overflow: hidden;
  padding: 20px;
}
i {
  display: flex;
  justify-content: center;
}
.score {
  margin-top: 4px;
}
.author {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
