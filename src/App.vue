<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import { ref, onMounted } from 'vue'

const value = ref('')
const title = ref('title')
const raiting = ref(0)
const author = ref('vasya')
const date = ref('15nov')
const url = 'https://hacker-news.firebaseio.com/v0/newstories.json'
const getData = async (url: RequestInfo | URL) => {
  try {
    const response = await fetch(url)

    const json = await response.json()
    const promises = json
      .slice(0, 10)
      .map((id: any) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
          response.json(),
        ),
      )
    const result = await Promise.all(promises)
    console.dir(result)
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error // Re-throw to propagate the error
  }
}

const updateData = () => {
  getData(url)
}

onMounted(() => getData(url))
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
