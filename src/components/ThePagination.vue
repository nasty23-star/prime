<script setup lang="ts">
import { computed, watch } from 'vue'

// interface Props {
// currentPage: number,
// itemsPerPage: number

// }
// Состояние пагинации

const props = defineProps(['currentPage', 'itemsPerPage', 'cards'])
const emit = defineEmits(['computedChange', 'update:currentPage'])

const paginatedItems = computed(() => {
  const startIndex = (props.currentPage - 1) * props.itemsPerPage
  const endIndex = startIndex + props.itemsPerPage
  return props.cards.slice(startIndex, endIndex)
})

// Отслеживаем изменения computed и эмитим событие
watch(
  paginatedItems,
  (newValue) => {
    emit('computedChange', newValue)
  },
  { immediate: true },
)

// const emit = defineEmits<{
//   (e: 'update:modelValue', value: string): void
//   (e: 'blur'): void
// }>()
// const currentPage = ref(1)
// const itemsPerPage = ref(5)

// Опции для выбора количества элементов
//const itemsPerPageOptions = ref([5, 10, 15, 20])

// Вычисляем сколько будет страниц
const totalPages = computed(() => {
  return Math.ceil(props.cards.length / props.itemsPerPage)
})

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}

// Генерация номеров страниц для отображения
const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, props.currentPage.value - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})
</script>
<template>
  <div class="pagination-container">
    <div class="pagination-controls">
      <!-- Селектор количества элементов -->
      <!-- <div class="items-per-page-selector">
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
        </div> -->

      <!-- Информация о странице -->
      <div class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
        <span class="total-items">(Total card quantity: {{ props.cards.length }})</span>
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
</template>
<style scoped>
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
</style>
