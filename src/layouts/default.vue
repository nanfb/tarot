<template>
  <view :style="{ height: `${statusBarHeight}px`, width: '100%' }" />
  <slot />
</template>

<script lang="ts" setup>
const { statusBarHeight } = wx.getWindowInfo()
// getMenuButtonBoundingClientRect  获取胶囊按钮位置信息
</script>
