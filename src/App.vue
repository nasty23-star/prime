<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import { ref } from 'vue'

const value = ref('')
const updateData = () => {
  console.log('click')
}
</script>

<template>
  <Button label="Update" icon="pi pi-refresh" iconPos="bottom" @click="updateData" />
  <div>
    <Card style="width: 25rem; overflow: hidden">
      <template #header>
        <img alt="user header" src="" />
      </template>
      <template #title>Advanced Card</template>
      <template #subtitle>Card subtitle</template>
      <template #content>
        <p class="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error
          repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa
          ratione quam perferendis esse, cupiditate neque quas!
        </p>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-1">
          <Button label="Cancel" severity="secondary" variant="outlined" class="w-full" />
          <Button label="Save" class="w-full" />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
div {
  display: flex;
  align-items: center;
}
</style>
