<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, onMounted, ref } from 'vue'
import { dateFormatter } from '@/utils/dateHelper'
import { useDataStore } from '@/stores/data'
import router from '@/router'

const dataStore = useDataStore()

const toNewsItem = (itemId: number) => {
  router.push({
    name: 'news-item',
    params: { id: itemId.toString() },
  })
}

// Состояние пагинации
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Опции для выбора количества элементов
const itemsPerPageOptions = ref([5, 10, 15, 20])

// Вычисляемые свойства
const totalPages = computed(() => {
  return Math.ceil(dataStore.dataCards.length / itemsPerPage.value)
})

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return dataStore.dataCards.slice(startIndex, endIndex)
})

// Функции для пагинации
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Генерация номеров страниц для отображения
const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

onMounted(() => {
  if (dataStore.newNewsIds) {
    dataStore.getNewsIds()
  }
  dataStore.getData()
})
</script>

<template>
  <main class="main-container">
    <!-- Кнопка обновление данных -->
    <div class="button">
      <Button
        label="Update News"
        icon="pi pi-refresh icon"
        iconPos="right"
        size="large"
        @click="dataStore.getData"
        :loading="dataStore.loading"
        class="update-btn"
      />
    </div>

    <!-- Пагинация сверху -->
    <div class="pagination-container">
      <div class="pagination-controls">
        <!-- Селектор количества элементов -->
        <div class="items-per-page-selector">
          <label for="itemsPerPage">Items per page:</label>
          <select
            id="itemsPerPage"
            v-model="itemsPerPage"
            @change="currentPage = 1"
            class="page-select"
          >
            <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Информация о странице -->
        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
          <span class="total-items">(Total: {{ dataStore.dataCards.length }})</span>
        </div>
      </div>

      <!-- Навигация по страницам -->
      <div class="pagination-navigation">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="pagination-btn pagination-prev"
        >
          <i class="pi pi-chevron-left"></i>
          Previous
        </button>

        <!-- Номера страниц -->
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>

          <!-- Многоточие если страниц много -->
          <span v-if="totalPages > visiblePages[visiblePages.length - 1]" class="page-ellipsis">
            ...
          </span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn pagination-next"
        >
          Next
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Контент -->
    <div v-if="dataStore.loading" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p class="loading-text">Loading latest news...</p>
    </div>

    <div v-else-if="dataStore.dataCards.length > 0" class="grid">
      <Card
        v-for="card in paginatedItems"
        :key="card.id"
        class="card"
        :class="{
          visited: dataStore.visitedCards.includes(card.id),
        }"
        @click="toNewsItem(card.id)"
      >
        <!-- Остальной контент карточки без изменений -->
        <template #header>
          <div class="card-header">
            <i class="pi pi-bolt icon"></i>
            <Button
              :icon="card.favourite ? 'pi pi-heart-fill' : 'pi pi-heart'"
              iconPos="right"
              size="large"
              @click="dataStore.toggleFavourite(card.id, $event)"
              :title="card.favourite ? 'Убрать из избранного' : 'Добавить в избранное'"
              class="favourite-btn"
            />
          </div>
        </template>

        <template #title>
          <div class="title-container">
            <span class="label">News Title:</span>
            <h3 class="title">
              {{ card.title }}
            </h3>
          </div>
        </template>

        <template #content>
          <div class="card-content">
            <div class="info-item">
              <i class="pi pi-star icon"></i>
              <span class="label">Rating:</span>
              <span class="value">{{ card.score }}</span>
            </div>

            <div class="info-item">
              <i class="pi pi-user icon"></i>
              <span class="label">Author:</span>
              <span class="value">{{ card.by }}</span>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="card-footer">
            <i class="pi pi-calendar icon"></i>
            <span class="date">{{ dateFormatter(card.time) }}</span>
          </div>
        </template>
      </Card>
    </div>
    <!-- Если нет карточек -->
    <div v-else class="empty-state">
      <i class="pi pi-inbox icon"></i>
      <p class="text">No news available</p>
    </div>

    <!-- Пагинация снизу (дублируется для удобства) -->
    <div class="pagination-container pagination-bottom">
      <div class="pagination-navigation">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="pagination-btn pagination-prev"
        >
          <i class="pi pi-chevron-left"></i>
          Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="pagination-btn pagination-next"
        >
          Next
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-container {
  min-height: calc(100dvh - 140px);
  padding: 20px;

  & .button {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    height: 60px;

    & .update-btn {
      background: linear-gradient(45deg, #3732b3, #4ecdc4);
      border-radius: 12px;
      padding: 1rem 2rem;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      color: #ffffff;
    }

    .update-btn:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      border: none;
    }
  }

  /* Стили для пагинации */
  .pagination-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }

  .pagination-bottom {
    margin-top: 2rem;
    margin-bottom: 0;
  }

  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .items-per-page-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .page-select {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      color: #2d3748;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      &:hover {
        border-color: #667eea;
      }
    }
  }

  .pagination-info {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;

    .total-items {
      color: #718096;
      font-weight: 500;
    }
  }

  .pagination-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #667eea;
    border-radius: 10px;
    background: white;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
    justify-content: center;

    &:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: #cbd5e0;
      color: #a0aec0;
    }

    .pi {
      font-size: 0.8rem;
    }
  }

  .page-numbers {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0 1rem;
  }

  .page-btn {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #4a5568;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 45px;

    &:hover:not(.active) {
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-1px);
    }

    &.active {
      background: linear-gradient(45deg, #3732b3, #4ecdc4);
      border-color: #3732b3;
      color: white;
      box-shadow: 0 4px 15px rgba(55, 50, 179, 0.3);
    }
  }

  .page-ellipsis {
    padding: 0.75rem 0.5rem;
    color: #718096;
    font-weight: 600;
  }

  /* Остальные существующие стили */
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

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 25px;
    max-width: 1200px;
    margin: 0 auto;
    justify-items: center;

    & a {
      text-decoration: none;
    }

    & .visited {
      opacity: 0.7;
    }

    .card {
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      max-width: 450px;

      & .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 1.5rem 0;

        & .icon {
          font-size: 1.5rem;
          color: #667eea;
        }

        & .favourite-btn {
          background-color: #667eea;
        }
      }
      .title-container {
        padding: 0 1.5rem;

        & .label {
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
          font-size: 1.3rem;
          font-weight: 700;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 90px;
          max-width: 254px;
        }
      }

      .card-content {
        padding: 1rem 1.5rem;

        & .info-item {
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
            margin-left: 4px;
            margin-right: 4px;
          }

          & .value {
            color: #2d3748;
            font-weight: 500;
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

    .card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
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

  /* Адаптивность для пагинации */
  @media (max-width: 768px) {
    .pagination-controls {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .pagination-navigation {
      flex-direction: column;
      gap: 1rem;
    }

    .page-numbers {
      order: -1;
      margin: 0;
    }

    .pagination-btn {
      min-width: 120px;
    }
  }

  @media (max-width: 480px) {
    .pagination-container {
      padding: 1rem;
    }

    .page-numbers {
      gap: 0.1rem;
    }

    .page-btn {
      min-width: 40px;
      padding: 0.6rem 0.8rem;
      font-size: 0.9rem;
    }

    .items-per-page-selector {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  /* Существующие медиа-запросы */
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .main-container {
      padding: 15px;
    }

    .title {
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

  @media (min-width: 900px) {
    .card {
      width: 400px;
    }
  }

  @media (min-width: 1000px) {
    .card {
      width: 450px;
    }
  }

  @media (min-width: 1180px) {
    .card {
      width: 350px;
    }
  }
}
</style>
