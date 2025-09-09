<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import { ref } from 'vue'

const value = ref('')
const title = ref('title')
const raiting = ref(0)
const author = ref('vasya')
const date = ref('15nov')
const updateData = () => {
  console.log('click')
}
</script>

<template>
  <div class="container">
    <header>
      <Button
        label="Update"
        icon="pi pi-refresh"
        iconPos="right"
        size="large"
        @click="updateData"
      />
    </header>
    <div>
      <Card class="card">
        <template #header>
          <i class="pi pi-bolt"></i>
        </template>
        <template #title>{{ title }}</template>

        <template #content>
          <div class="raiting">{{ raiting }}</div>
          <div class="author">{{ author }}</div>
        </template>
        <template #footer>
          {{ date }}
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
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
.raiting {
  margin-top: 4px;
}
.author {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
