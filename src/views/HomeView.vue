<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { onMounted } from 'vue'
import { dateFormatter } from '../utils/dateHelper.ts'
import { useDataStore } from '@/stores/data.ts'

const dataStore = useDataStore()

onMounted(() => {
  dataStore.getData()
})
</script>

<template>
  <main class="main-container">
    <header class="header">
      <Button
        label="Update News"
        icon="pi pi-refresh"
        iconPos="right"
        size="large"
        @click="dataStore.updateData"
        :loading="dataStore.loading"
        class="update-btn"
      />
    </header>

    <div v-if="dataStore.loading" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p class="loading-text">Loading latest news...</p>
    </div>
    <div v-else-if="dataStore.dataCards.length > 0" class="news-grid">
      <router-link
        v-for="card in dataStore.dataCards"
        :key="card.id"
        :to="`/news/${card.id}`"
      >
        <Card
          class="news-card"
          :class="{
            visited: dataStore.visitedCards.includes(card.id),
          }"
        >
          <template #header>
            <div class="card-header">
              <i class="pi pi-bolt header-icon"></i>
            </div>
          </template>

          <template #title>
            <div class="title-container">
              <span class="title-label">News Title:</span>
              <h3 class="news-title">
                {{ card.title }}
              </h3>
            </div>
          </template>

          <template #content>
            <div class="card-content">
              <div class="info-item">
                <i class="pi pi-star info-icon"></i>
                <span class="info-label">Rating:</span>
                <span class="info-value">{{ card.score }}</span>
              </div>

              <div class="info-item">
                <i class="pi pi-user info-icon"></i>
                <span class="info-label">Author:</span>
                <span class="info-value">{{ card.by }}</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="card-footer">
              <i class="pi pi-calendar footer-icon"></i>
              <span class="date-text">{{ dateFormatter(card.time) }}</span>
            </div>
          </template>
        </Card>
      </router-link>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <p class="empty-text">No news available</p>
    </div>
  </main>
</template>

<style scoped>
.main-container {
  min-height: calc(100dvh - 140px);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.update-btn {
  background: linear-gradient(45deg, #3732b3, #4ecdc4);
  border: 1px solid #f1f1f3;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  color: #FFFFFF;
}

.update-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border: none;
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
  color: #3732b3;
  font-size: 1.2rem;
  font-weight: 500;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.news-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.news-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
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
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 100px;
}

a {
  text-decoration: none;
}

.visited {
  opacity: 0.7;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #3732b3;
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

/* Адаптивность */
@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .main-container {
    padding: 15px;
  }

  .news-title {
    font-size: 1.1rem;
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
}

@media (max-width: 480px) {
  .update-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
