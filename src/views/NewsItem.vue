<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import RecursiveComments from '@/components/RecursiveComments.vue'

interface NewsItem {
  id: number
  by: string
  title: string
  score: number
  time: number
  url?: string
  text?: string
  deleted?: boolean
  descendants?: number
  kids?: number[]
}

interface NHComment {
  id: number

  by?: string

  text?: string

  time?: number

  type: string

  kids?: number[]

  deleted?: boolean

  dead?: boolean

  replies?: NHComment[]
}

const newsItem = ref<NewsItem | null>(null)
const route = useRoute()
const router = useRouter()
const itemId = route.params.id
const loadingComments = ref(false)
const comments = ref<NHComment[]>([])
const commentsCount = computed(() => {
  return newsItem.value?.descendants ?? 0
})

const fetchNewsItem = async () => {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`)
    newsItem.value = await response.json()
    // После загрузки новости загружаем комментарии
    if (newsItem.value?.kids && newsItem.value.kids.length > 0) {
      await fetchRootComments(newsItem.value.kids)
    }
  } catch (error) {
    console.error('Error fetching news item:', error)
  }
}
// Функция для загрузки корневых комментариев
const fetchRootComments = async (commentIds: number[]) => {
  loadingComments.value = true
  try {
    const commentPromises = commentIds.map((id) => fetchComments(id))
    const rootComments = await Promise.all(commentPromises)
    comments.value = rootComments.filter((comment): comment is NHComment => comment !== null)
  } catch (error) {
    console.error('Error fetching root comments:', error)
  } finally {
    loadingComments.value = false
  }
}

const fetchComments = async (id: number) => {
  try {
    loadingComments.value = true
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    const json = await response.json()
    const item = json

    if (item.dead || item.deleted) {
      return null
    }

    const comment: NHComment = {
      id: item.id,

      by: item.by,

      text: item.text,

      time: item.time,

      type: item.type,

      replies: [],
    }

    if (item.kids && item.kids.length > 0) {
      const childPromises = item.kids.map((childId: number) => fetchComments(childId))
      const childComments = await Promise.all(childPromises)
      comment.replies = childComments.filter((child): child is NHComment => child !== null)
    }

    return comment
  } catch (error) {
    console.error('Error fetching comments:', error)
  } finally {
    loadingComments.value = false
  }
}

const refreshComments = async () => {}

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

          <div class="info-item">
            <i class="pi pi-comments info-icon"></i>
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

      <!-- Секция комментариев -->
      <div class="comments-section">
        <div class="comments-header">
          <h3 class="comments-title">
            <i class="pi pi-comments"></i>
            Comments ({{ comments?.length || null }})
          </h3>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            iconPos="right"
            @click="refreshComments"
            class="refresh-btn"
            :loading="loadingComments"
            size="small"
          />
        </div>

        <div v-if="loadingComments" class="comments-loading">
          <ProgressSpinner class="spinner-small" />
          <span>Loading comments...</span>
        </div>

        <div v-else-if="comments?.length" class="comments-list">
          <RecursiveComments v-for="comment in comments" :key="comment.id" :comment="comment" />
        </div>

        <div v-else class="no-comments">
          <i class="pi pi-comment"></i>
          <p>No comments yet</p>
        </div>
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
  margin-bottom: 30px;
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

/* Стили для секции комментариев */
.comments-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.comments-title {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-title .pi {
  color: #667eea;
}

.refresh-btn {
  background: linear-gradient(45deg, #48bb78, #38a169);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}

.refresh-btn:hover {
  background: linear-gradient(45deg, #38a169, #2f855a);
  transform: translateY(-1px);
}

.comments-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #718096;
}

.spinner-small {
  width: 30px;
  height: 30px;
  margin-bottom: 1rem;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #a0aec0;
  text-align: center;
}

.no-comments .pi {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-comments p {
  font-size: 1.1rem;
  margin: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

  .comments-section {
    padding: 1.5rem;
  }

  .comments-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .comments-title {
    font-size: 1.3rem;
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

  .comments-section {
    padding: 1rem;
  }
}
</style>

<style>
/* Глобальные стили для комментариев */
.comment-item {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  border-color: #cbd5e0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.comment-author {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
}

.comment-time {
  color: #718096;
  font-size: 0.85rem;
  font-weight: 500;
}

.comment-text {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.comment-text >>> p {
  margin-bottom: 0.75rem;
}

.comment-text >>> a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.comment-text >>> a:hover {
  text-decoration: underline;
}

.comment-text >>> code {
  background: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.comment-text >>> pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.comment-text >>> pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.comment-replies {
  margin-left: 2rem;
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 3px solid #667eea;
  border-radius: 2px;
}

/* Индикатор вложенности */
.comment-level-1 {
  margin-left: 0;
}
.comment-level-2 {
  margin-left: 2rem;
}
.comment-level-3 {
  margin-left: 4rem;
}
.comment-level-4 {
  margin-left: 6rem;
}
.comment-level-5 {
  margin-left: 8rem;
}

/* Для очень глубоких веток */
.comment-level-6-plus {
  margin-left: 10rem;
}

/* Анимация появления комментариев */
.comment-enter-active {
  transition: all 0.3s ease;
}

.comment-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* Темная тема поддержка */
@media (prefers-color-scheme: dark) {
  .comment-item {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-color: #4a5568;
  }

  .comment-header {
    border-color: #4a5568;
  }

  .comment-author {
    color: #e2e8f0;
  }

  .comment-text {
    color: #cbd5e0;
  }

  .comment-text >>> code {
    background: #4a5568;
    color: #e2e8f0;
  }
}
</style>
