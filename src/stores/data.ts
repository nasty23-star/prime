import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { NewsItem } from '@/types/common.ts'

export const useDataStore = defineStore('data', () => {
  const dataCards = ref<NewsItem[]>([])
  const loading = ref(false)
  const visitedCards = ref<number[]>([])
  const getData = async () => {
    const url = 'https://hacker-news.firebaseio.com/v0/newstories.json'
    try {
      loading.value = true
      const response = await fetch(url)
      const json = await response.json()

      const promises = json
        .slice(0, 100)
        .map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
            response.json(),
          ),
        )

      const result = await Promise.all(promises)
      dataCards.value = result.filter((item) => item !== null)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  }


  // Забираем из локал стораджа отмеченные карточки, если они есть
  const initVisitedCards = () => {
    const fromStorage = localStorage.getItem('visitedCards')
    if (fromStorage) {
      visitedCards.value = JSON.parse(fromStorage)
    }
  }

  // Инициализируем сразу при создании стора
  initVisitedCards()

  // Отмечаем карточку, которую посетили
  const markAsVisited = (itemId: number) => {
    if (!visitedCards.value.includes(itemId)) {
      visitedCards.value.push(itemId)
    }
    localStorage.setItem('visitedCards', JSON.stringify(visitedCards.value))
  }

  return { getData, loading, dataCards, markAsVisited, visitedCards }
})
