<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
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
  descendants?: number // число общих
  kids?: number[]
}

const newsItem = ref<NewsItem | null>(null)
const route = useRoute()
const router = useRouter()
const itemId = route.params.id

const commentsCount = computed(() => {
  return newsItem.value?.descendants ?? 0
})

const fetchNewsItem = async () => {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`)
    newsItem.value = await response.json()
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
  <main class="main-container">
    <Button
      label="Back"
      icon="pi pi-home"
      iconPos="right"
      size="large"
      @click="backToMain"
      class="back-btn"
    />
    <div v-if="!newsItem" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p class="loading-text">Loading news item...</p>
    </div>

    <div v-else-if="newsItem?.deleted" class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <p class="empty-text">Новости нет</p>
    </div>

    <div v-else class="news-detail">
      <Card class="detail-card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-hashtag header-icon"></i>
            <span class="id-badge">ID: {{ newsItem.id }}</span>
          </div>
        </template>

        <template #title>
          <div class="title-container">
            <span class="title-label">News Title:</span>
            <h1 class="news-title">{{ newsItem.title }}</h1>
          </div>
        </template>

        <template #content>
          <div class="card-content">
            <div class="info-item">
              <i class="pi pi-star info-icon"></i>
              <span class="info-label">Rating:</span>
              <span class="info-value">{{ newsItem.score }} points</span>
            </div>

            <div class="info-item">
              <i class="pi pi-user info-icon"></i>
              <span class="info-label">Author:</span>
              <span class="info-value">{{ newsItem.by }}</span>
            </div>
            <div v-if="newsItem.url" class="info-item">
              <i class="pi pi-link info-icon"></i>
              <span class="info-label">URL:</span>
              <a :href="newsItem.url" target="_blank" class="news-url">{{ newsItem.url }}</a>
            </div>
          </div>

          <div class='info-item'>
            <i class="pi pi-lcomments info-icon"></i>
            <span class="info-label">Comments count:</span>
              <span class="info-value">{{ commentsCount }}</span>

          </div>
        </template>

        <template #footer>
          <div class="card-footer">
            <i class="pi pi-calendar footer-icon"></i>
            <span class="date-text">
              {{
                new Date(newsItem.time * 1000).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </span>
          </div>
        </template>
      </Card>
      <div v-if="newsItem.text" class="news-text-content">
        <h3>Content:</h3>
        <div class="text-content" v-html="newsItem.text"></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.back-btn {
  background: linear-gradient(45deg, #3732b3, #4ecdc4);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-text {
  font-size: 1.2rem;
  font-weight: 500;
}

.news-detail {
  max-width: 800px;
  margin: 0 auto;
}

.detail-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.header-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.id-badge {
  background: linear-gradient(45deg, #3732b3, #4ecdc4);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.title-container {
  padding: 0 1.5rem;
}

.title-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-title {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}

.card-content {
  padding: 1rem 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.info-item:hover {
  background: rgba(102, 126, 234, 0.12);
}

.info-icon {
  color: #667eea;
  font-size: 1.1rem;
  min-width: 20px;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 60px;
}

.info-value {
  color: #2d3748;
  font-weight: 500;
}

.news-url {
  color: #667eea;
  text-decoration: none;
  word-break: break-all;
}

.news-url:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-top: 1px solid #e2e8f0;
}

.footer-icon {
  color: #718096;
  font-size: 1rem;
}

.date-text {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
}

.news-text-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.news-text-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.text-content {
  line-height: 1.6;
  color: #4a5568;
}

.text-content >>> * {
  margin-bottom: 1rem;
}

.text-content >>> a {
  color: #667eea;
  text-decoration: none;
}

.text-content >>> a:hover {
  text-decoration: underline;
}

/* Адаптивность */
@media (max-width: 768px) {
  .main-container {
    padding: 15px;
  }

  .news-detail {
    max-width: 100%;
  }

  .news-title {
    font-size: 1.3rem;
  }

  .card-header {
    padding: 1rem 1rem 0;
  }

  .title-container {
    padding: 0 1rem;
  }

  .card-content {
    padding: 0.5rem 1rem;
  }

  .news-text-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .back-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .id-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
