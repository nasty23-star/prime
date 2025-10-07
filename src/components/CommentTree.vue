<script setup lang="ts">
import Button from 'primevue/button'
import { ref } from 'vue'
import type { NHComment } from '@/types/common'

const props = defineProps<{
  comment: NHComment
  fetchReplies?: (commentId: number, kidsIds: number[]) => Promise<NHComment[]>
}>()

const isLoading = ref(false)
const showReplies = ref(false)
const hasLoadedReplies = ref(false)

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleString()
}

const loadReplies = async () => {
  if (!props.fetchReplies || !props.comment.kids) {
    showReplies.value = !showReplies.value
    return
  }

  // Если replies еще не загружены, загружаем их
  if (!hasLoadedReplies.value) {
    isLoading.value = true
    try {
      const replies = await props.fetchReplies(props.comment.id, props.comment.kids)
      if (replies.length > 0) {
        // Создаем новый объект комментария с replies
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
      <CommentTree
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
  border-radius: 4px;
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
  color: #1976d2;
}

.comment-time {
  color: #757575;
}

.comment-text {
  margin-bottom: 1rem;
  line-height: 1.5;
  color: #333;
}

.comment-text :deep(*) {
  margin: 0.5rem 0;
}

.comment-text :deep(a) {
  color: #1976d2;
  text-decoration: none;
}

.comment-text :deep(a:hover) {
  text-decoration: underline;
}

.replies {
  margin-top: 1rem;
  border-left: 2px solid #ddd;
  padding-left: 1rem;
}

.reply-btn {
  margin-top: 0.5rem;
}
</style>
