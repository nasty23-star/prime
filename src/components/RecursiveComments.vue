<script setup lang="ts">
import Button from 'primevue/button'
import { ref } from 'vue'

interface HNComment {
  id: number
  by?: string
  text?: string
  time?: number
  type: string
  kids?: number[]
  replies?: HNComment[]
}

const props = defineProps<{
  comment: HNComment
  fetchReplies?: (commentId: number, kidsIds: number[]) => Promise<HNComment[]>
}>()

const isLoading = ref(false)
const showReplies = ref(false)
const hasLoadedReplies = ref(false)

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleString()
}

const loadReplies = async () => {
  if (!props.fetchReplies || !props.comment.kids || hasLoadedReplies.value) {
    showReplies.value = !showReplies.value
    return
  }

  if (!props.comment.replies || props.comment.replies.length === 0) {
    isLoading.value = true
    try {
      const replies = await props.fetchReplies(props.comment.id, props.comment.kids)
      if (replies.length > 0) {
        props.comment.replies = replies
        hasLoadedReplies.value = true
      }
    } catch (error) {
      console.error('Error loading replies:', error)
    } finally {
      isLoading.value = false
    }
  }

  showReplies.value = !showReplies.value
}
</script>

<template>
  <div class="comment">
    <div class="comment-header">
      <span class="comment-author">{{ comment.by || 'Anonymous' }}</span>
      <span class="comment-time">{{ formatTime(comment.time) }}</span>
    </div>

    <div class="comment-text" v-html="comment.text"></div>

    <Button
      v-if="comment.kids && comment.kids.length > 0"
      :label="`${showReplies ? 'Hide' : 'Show'} replies (${comment.kids.length})`"
      @click="loadReplies"
      :loading="isLoading"
      size="small"
      class="reply-btn"
    />

    <!-- Рекурсивный рендеринг ответов -->
    <div v-if="showReplies && comment.replies && comment.replies.length" class="replies">
      <RecursiveComments
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :fetch-replies="fetchReplies"
      />
    </div>
  </div>
</template>

<style scoped>
.comment {
  border-left: 3px solid #e0e0e0;
  padding: 1rem;
  margin: 0.5rem 0;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.comment-author {
  font-weight: bold;
}

.comment-text {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.replies {
  margin-left: 2rem;
  margin-top: 1rem;
  border-left: 2px solid #ddd;
}

.reply-btn {
  margin-top: 0.5rem;
}
</style>
