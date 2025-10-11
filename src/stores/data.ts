import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { NewsItem } from '@/types/common.ts'

export const useDataStore = defineStore('data', () => {
  const dataCards = ref<NewsItem[]>([])
  const loading = ref(false)
  const visitedCards = ref<number[]>([])
  const newsIds = ref<number[]>([])
  const newNewsIds = ref(<number[]>[])
  const urlForIds = 'https://hacker-news.firebaseio.com/v0/newstories.json'
  const getData = async () => {
    try {
      loading.value = true
      const responseIds = await fetch(urlForIds)
      const jsonIds = await responseIds.json()

      // Сохраняем айди новостей, чтоб позже проверять на актуальность
      newsIds.value = jsonIds.slice(0, 100)

      const promises = newsIds.value.map((id: number) =>
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

  const getNewsIds = async () => {
    try {
      loading.value = true
      const responseIds = await fetch(urlForIds)
      const jsonIds = await responseIds.json()

      // Сохраняем айди новостей, чтоб позже проверять на актуальность
      newNewsIds.value = jsonIds.slice(0, 100)

      // Проверяем есть ли новые айди, чтобы не обновлять данные целиком, а только по новым айди запросом

      const newsIdsConst = newsIds.value
      const newsSet = new Set(newsIdsConst)
      const diffBetweenArrays = newNewsIds.value.filter((item: number) => !newsSet.has(item))

      if (diffBetweenArrays.length > 0) {
        const newPromises = diffBetweenArrays.map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
            response.json(),
          ),
        )
        const resultedItems = await Promise.all(newPromises)

        dataCards.value = [
          ...resultedItems, // Новые карточки в начале
          ...dataCards.value.slice(0, -diffBetweenArrays.length), // Старые карточки (без последних N)
        ]
        // Обновляем список ID
        newsIds.value = newNewsIds.value
      }
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

  return {
    getData,
    loading,
    dataCards,
    markAsVisited,
    visitedCards,
    newsIds,
    getNewsIds,
    newNewsIds,
  }
})
