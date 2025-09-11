<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
interface NewsItem {
  id: number
  by: string
  title: string
  score: number
  time: number
  url?: string
  text?: string
  deleted?: boolean
}
const newsItem = ref<NewsItem | null>(null)
const route = useRoute()
const router = useRouter()
const emit = defineEmits()
const cards = ref({})
const itemId = route.params.id

const fetchNewsItem = async () => {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`)
    newsItem.value = await response.json()
    cards.value = newsItem
  } catch (error) {
    console.error('Error fetching news item:', error)
  }
}
const backToMain = () => {
  router.push('/')
}
onMounted(() => {
  fetchNewsItem()
})
</script>
<template>
  <Button label="Back" icon="pi pi-home" iconPos="right" size="large" @click="backToMain" />
  <div v-if="!newsItem"><ProgressSpinner /></div>
  <div v-else-if="newsItem?.deleted">Новости нет</div>
  <div v-else>
    <Card>
      <template #header>
        {{ newsItem?.id }}
      </template>
      <template #title>{{ newsItem?.title }}</template>

      <template #content>
        <div class="score">{{ newsItem?.score }}</div>
        <div class="author">{{ newsItem?.by }}</div>
      </template>
      <template #footer>
        {{ newsItem?.url }}
      </template>
    </Card>
  </div>
</template>

<style></style>
