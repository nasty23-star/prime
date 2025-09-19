<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import RecursiveComments from '@/components/RecursiveComments.vue'
import { dateFormatter } from '@/utils/dateFHelper'

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
const loadingNews = ref(false)
const comments = ref<NHComment[]>([])

const commentsCount = computed(() => {
  return newsItem.value?.descendants ?? 0
})

const fetchNewsItem = async () => {
  loadingNews.value = true
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`)
    newsItem.value = await response.json()
  } catch (error) {
    console.error('Error fetching news item:', error)
  } finally {
    loadingNews.value = false
  }
}

const fetchRootComments = async (commentIds: number[]) => {
  loadingComments.value = true
  try {
    const commentPromises = commentIds.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
        response.json(),
      ),
    )
    const commentsData = await Promise.all(commentPromises)

    comments.value = commentsData
      .filter((comment) => !comment.dead && !comment.deleted)
      .map((comment) => ({
        id: comment.id,
        by: comment.by,
        text: comment.text,
        time: comment.time,
        type: comment.type,
        kids: comment.kids,
        replies: [],
      }))
  } catch (error) {
    console.error('Error fetching root comments:', error)
  } finally {
    loadingComments.value = false
  }
}

const fetchCommentReplies = async (commentId: number, kidsIds: number[]) => {
  try {
    const replyPromises = kidsIds.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
        response.json(),
      ),
    )
    const repliesData = await Promise.all(replyPromises)

    return repliesData
      .filter((reply) => !reply.dead && !reply.deleted)
      .map((reply) => ({
        id: reply.id,
        by: reply.by,
        text: reply.text,
        time: reply.time,
        type: reply.type,
        kids: reply.kids,
        replies: [],
      }))
  } catch (error) {
    console.error('Error fetching comment replies:', error)
    return []
  }
}

const refreshComments = async () => {
  if (newsItem.value?.kids) {
    await fetchRootComments(newsItem.value.kids)
  }
}


onMounted(async () => {
  await fetchNewsItem()
  if (newsItem.value?.kids && newsItem.value.kids.length > 0) {
    await fetchRootComments(newsItem.value.kids)
  }
})
</script>

<template>
  <main class="main-container">
    <router-link to="/">
      <Button
        label="Back"
        icon="pi pi-home"
        iconPos="right"
        size="large"
        class="back-btn"
      />
    </router-link>
    <div v-if="loadingNews" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p class="loading-text">Loading news item...</p>
    </div>

    <div v-else-if="newsItem?.deleted" class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <p class="empty-text">News not found</p>
    </div>

    <div v-else-if="newsItem" class="news-detail">
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
              {{ dateFormatter(newsItem.time) }}
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
  <div class="comments-section">
    <div class="comments-header">
      <h3 class="comments-title">
        <i class="pi pi-comments"></i>
        Comments ({{ comments?.length || 0 }})
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

    <div v-else-if="comments.length" class="comments-list">
      <RecursiveComments
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :fetch-replies="fetchCommentReplies"
      />
    </div>

    <div v-else class="no-comments">
      <i class="pi pi-comment"></i>
      <p>No comments yet</p>
    </div>
  </div>
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
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comments-title {
  color: #333;
  margin: 0;
}

.comments-loading {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  justify-content: center;
}

.spinner-small {
  width: 24px;
  height: 24px;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #757575;
}

.no-comments i {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}
</style>
