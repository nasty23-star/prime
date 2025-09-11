<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()

interface NewsItem {
  id: number
  by: string
  title: string
  score: number
  time: number
  url?: string
  text?: string
}
const value = ref('')
const url = 'https://hacker-news.firebaseio.com/v0/newstories.json'
let dataCards = ref<NewsItem[]>([])
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
    dataCards.value = result
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const toItemNews = (itemId: number) => {
  router.push({
    name: 'news-item',
    params: { id: itemId.toString() },
  })
}
const updateData = () => {
  getData(url)
}

onMounted(() => getData(url))
</script>

<template>
  <main>
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
      <div v-if="dataCards.length < 1" class="spinner"><ProgressSpinner /></div>
      <div v-else>
        <Card
          v-for="card in dataCards"
          :key="card?.id"
          :title="card.title"
          :by="card.by"
          :score="card.score"
          :time="card.time"
          class="card"
          @click="toItemNews(card.id)"
        >
          <template #header>
            <i class="pi pi-bolt"></i>
          </template>
          <template #title>{{ card.title }}</template>

          <template #content>
            <div class="score">{{ card.score }}</div>
            <div class="author">{{ card.by }}</div>
          </template>
          <template #footer>
            {{ formatDate(card.time) }}
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
