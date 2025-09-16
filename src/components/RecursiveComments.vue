<script setup lang="ts">
interface HNComment {
  id: number
  by?: string
  text?: string
  time?: number
  type: string
  replies?: HNComment[]
}
const props = defineProps<{
  comment: HNComment
}>()
const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleString()
}

</script>

<template>
  <div class="comment">
    <div class="comment-header">
      <span class="comment-author">{{ comment.by }}</span>
      <span class="comment-time">{{ formatTime(comment.time) }}</span>
    </div>

    <div class="comment-text" v-html="comment.text"></div>

    <!-- Рекурсивный рендеринг ответов -->
    <div class="replies" v-if="comment.replies && comment.replies.length">
      <recursive-comments v-for="reply in comment.replies" :key="reply.id" :comment="reply" />
    </div>
  </div>
</template>
