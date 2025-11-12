<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import CommentTree from '@/components/CommentTree.vue'
import { dateFormatter } from '@/utils/dateHelper'
import { useNewsStore } from '@/stores/news'
import { useDataStore } from '@/stores/data'
import type { NHComment } from '@/types/common'

const newsStore = useNewsStore()
const dataStore = useDataStore()
const route = useRoute()
const comments = ref<NHComment[]>([])
const isLoadingComments = ref(false)

const loadComments = async () => {
  if (newsStore.newsItem?.kids && newsStore.newsItem.kids.length > 0) {
    isLoadingComments.value = true
    comments.value = await newsStore.fetchComments(newsStore.newsItem?.kids)
    isLoadingComments.value = false
  }
}
onMounted(async () => {
  await newsStore.fetchNewsItem(route.params.id)
  if (newsStore.newsItem) {
    dataStore.markAsVisited(newsStore.newsItem.id)

    loadComments()
  }
})
</script>

<template>
  <main class="main-container">
    <div v-if="newsStore.loadingNews" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p class="text">Loading news item...</p>
    </div>

    <div v-else-if="newsStore.newsItem?.deleted" class="empty-state">
      <i class="pi pi-inbox icon"></i>
      <p class="text">News not found</p>
    </div>

    <div v-else-if="newsStore.newsItem" class="news-detail">
      <Card class="card">
        <template #header>
          <div class="card-header">
            <i class="pi pi-hashtag icon"></i>
            <Button
              :icon="dataStore.favouriteCards.includes(newsStore.newsItem.id) ? 'pi pi-heart-fill' : 'pi pi-heart'"
              iconPos="right"
              size="large"
              @click="dataStore.toggleFavourite(newsStore.newsItem.id)"
              :title="
                dataStore.favouriteCards.includes(newsStore.newsItem.id) ? 'Убрать из избранного' : 'Добавить в избранное'
              "
              class="favourite-btn"
              :style="{ opacity: newsStore.newsItem.favourite ? 0.5 : 1 }"
            />
          </div>
        </template>

        <template #title>
          <div class="title-container">
            <span class="label">News Title:</span>
            <h1 class="title">
              {{ newsStore.newsItem.title }}
            </h1>
          </div>
        </template>

        <template #content>
          <div class="card-content">
            <div class="info-item">
              <i class="pi pi-star icon"></i>
              <span class="label">Rating:</span>
              <span class="value">{{ newsStore.newsItem.score }} points</span>
            </div>

            <div class="info-item">
              <i class="pi pi-user icon"></i>
              <span class="label">Author:</span>
              <span class="value">{{ newsStore.newsItem.by }}</span>
            </div>
            <div v-if="newsStore.newsItem.url" class="info-item">
              <i class="pi pi-link icon"></i>
              <span class="label">URL:</span>
              <a :href="newsStore.newsItem.url" target="_blank" class="url">{{
                newsStore.newsItem.url
              }}</a>
            </div>
          </div>

          <div class="info-item">
            <i class="pi pi-comments icon"></i>
            <span class="label">Comments count:</span>
            <span class="value">{{ comments.length }}</span>
          </div>
        </template>

        <template #footer>
          <div class="card-footer">
            <i class="pi pi-calendar icon"></i>
            <span class="date">
              {{ dateFormatter(newsStore.newsItem.time) }}
            </span>
          </div>
        </template>
      </Card>

      <div v-if="newsStore.newsItem.text" class="news-content">
        <h3>Content:</h3>
        <div class="text" v-html="newsStore.newsItem.text"></div>
      </div>
    </div>
  </main>
  <div v-if="!newsStore.loadingNews" class="comments-section">
    <div class="header">
      <h3 class="title">
        <i class="pi pi-comments"></i>
        Comments ({{ comments?.length || 0 }})
      </h3>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        iconPos="right"
        @click="loadComments"
        class="refresh-btn"
        :loading="isLoadingComments"
        size="small"
      />
    </div>

    <div v-if="isLoadingComments" class="comments-loading">
      <ProgressSpinner class="spinner" />
      <span>Loading comments...</span>
    </div>

    <div v-else-if="comments.length" class="comments-list">
      <CommentTree v-for="comment in comments" :key="comment.id" :comment="comment" />
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-bottom: 30px;
  color: #ffffff;
}

.back-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  & .spinner {
    width: 50px;
    height: 50px;
    margin-bottom: 20px;
  }

  & .text {
    font-size: 1.2rem;
    font-weight: 500;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #3732b3;

  & .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }

  & .text {
    font-size: 1.2rem;
    font-weight: 500;
  }
}

.news-detail {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;

  & .info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: rgba(102, 126, 234, 0.08);
    border-radius: 12px;
    transition: background-color 0.2s ease;

    & .icon {
      color: #667eea;
      font-size: 1.1rem;
      min-width: 20px;
    }

    & .label {
      font-weight: 600;
      color: #4a5568;
      min-width: 60px;
    }

    & .value {
      color: #2d3748;
      font-weight: 500;
    }
  }

  & .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0;

    & .icon {
      font-size: 1.5rem;
      color: #667eea;
    }
  }

  .title-container {
    padding: 0 1.5rem;

    & .title-label {
      display: block;
      font-size: 0.8rem;
      color: #666;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    & .title {
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.4;
      margin: 0;
    }
  }

  .card-content {
    padding: 1rem 1.5rem;

    & .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: rgba(102, 126, 234, 0.08);
      border-radius: 12px;
      transition: background-color 0.2s ease;

      & .icon {
        color: #667eea;
        font-size: 1.1rem;
        min-width: 20px;
      }

      & .label {
        font-weight: 600;
        color: #4a5568;
        min-width: 60px;
      }

      & .value {
        color: #2d3748;
        font-weight: 500;
      }

      & .url {
        color: #667eea;
        text-decoration: none;
        word-break: break-all;
      }

      & .url:hover {
        text-decoration: underline;
      }
    }

    .info-item:hover {
      background: rgba(102, 126, 234, 0.12);
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-top: 1px solid #e2e8f0;

    & .icon {
      color: #718096;
      font-size: 1rem;
    }

    & .date {
      color: #4a5568;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

.news-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  h3 {
    color: #2d3748;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  & .text {
    line-height: 1.6;
    color: #4a5568;
  }

  .text :deep() * {
    margin-bottom: 1rem;
  }

  .text :deep() a {
    color: #667eea;
    text-decoration: none;
  }

  .text :deep() a:hover {
    text-decoration: underline;
  }
}

/* Стили для секции комментариев */
.comments-section {
  max-width: 800px;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 auto;

  & .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    & .title {
      color: #333;
      margin: 0;
    }
  }
}

.comments-loading {
  display: flex;
  flex-direction: column;

  & .spinner {
    width: 24px;
    height: 24px;
  }
}
.no-comments {
  text-align: center;
  padding: 2rem;
  color: #757575;

  i {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
  }
}
</style>
