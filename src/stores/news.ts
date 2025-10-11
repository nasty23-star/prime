import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { NewsItem } from '@/types/common.ts'
import { useDataStore } from './data'
export const useNewsStore = defineStore('news', () => {
  const newsItem = ref<NewsItem | null>(null)
  const loadingComments = ref(false)
  const loadingNews = ref(false)

  const dataStore = useDataStore()

  // Функция для получения айди карточки новости
  const getNewsItemFromData = (itemId: string | string[]) => {
    const id = Number(Array.isArray(itemId) ? itemId[0] : itemId)
    return dataStore.dataCards.find((card) => card.id === id)
  }

  const fetchNewsItem = async (itemId: string | string[]) => {
    loadingNews.value = true
    try {
      const id = Array.isArray(itemId) ? itemId[0] : itemId

      // Сначала пытаемся найти в локальных данных
      const localItem = getNewsItemFromData(id)
      if (localItem) {
        newsItem.value = localItem
        return
      }

      // Если не нашли локально, делаем запрос к API
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      newsItem.value = await response.json()
    } catch (error) {
      console.error('Error fetching news item:', error)
    } finally {
      loadingNews.value = false
    }
  }

  const fetchComments = async (kidsIds: number[]) => {
    try {
      const commentsPromises = kidsIds.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) =>
          response.json(),
        ),
      )
      const commentsData = await Promise.all(commentsPromises)

      return commentsData
        .filter((comment) => !comment.dead && !comment.deleted)
        .map((comment) => ({
          id: comment.id,
          by: comment.by,
          text: comment.text,
          time: comment.time,
          type: comment.type,
          kids: comment.kids,
        }))
    } catch (error) {
      console.error('Error fetching comment replies:', error)
      return []
    }
  }

  return {
    getNewsItemFromData,
    newsItem,
    loadingComments,
    loadingNews,
    fetchComments,
    fetchNewsItem,
  }
})
