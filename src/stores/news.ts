import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { NewsItem, NHComment } from '@/types/common.ts'
import { useDataStore } from './data'
export const useNewsStore = defineStore('news', () => {
  const newsItem = ref<NewsItem | null>(null)
  const loadingComments = ref(false)
  const loadingNews = ref(false)
  const comments = ref<NHComment[]>([])

  const commentsCount = computed(() => {
    return newsItem.value?.descendants ?? 0
  })

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

  const fetchCommentReplies = async (kidsIds: number[]) => {
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
  return {
    getNewsItemFromData,
    newsItem,
    refreshComments,
    loadingComments,
    loadingNews,
    fetchCommentReplies,
    fetchRootComments,
    fetchNewsItem,
    comments,
    commentsCount,
  }
})
