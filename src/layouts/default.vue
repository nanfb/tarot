<template>
  <view :style="{ height: `${safeHeight}px`, width: '100%' }" class="page-bg-color" />
  <view :style="{ height: `${safeHeight}px`, width: '100%' }" />
  <!-- 50px为tabbar高度，注意单位是px -->
  <view class="box-container" :style="{ height: `calc(100vh - 50px - env(safe-area-inset-bottom) - ${safeHeight}px)` }">
    <banner />
    <slot />
  </view>
</template>

<script lang="ts" setup>
import banner from './comp/banner.vue'
// 认定胶囊区域以下为安全区
let safeHeight = 0
if (wx.getMenuButtonBoundingClientRect) {
  safeHeight = wx.getMenuButtonBoundingClientRect().top // 获取胶囊按钮位置信息
}
</script>

<style scoped>
.page-bg-color {
  background: linear-gradient(0deg, #19192c, #444a68);
  position: fixed;
  top: 0px;
  z-index: 999;
}
.box-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 26rpx;
}
</style>
