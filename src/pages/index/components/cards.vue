<template>
  <view>
  </view>
</template>

<script lang="ts" setup>
import { useTarotInfosStore } from '@/store/sys'

const drawType = computed(() => useTarotInfosStore().drawType)
</script>
