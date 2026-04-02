<template>
  <view class="bg-container">
    <meteor />
    <view
      v-for="n in 18"
      :key="n"
      class="star"
      :style="getRandomStyle(n)"
    >
      <text class="i-line-md:star-alt-filled text-24rpx text-white/40" />
    </view>
  </view>
</template>

<script setup>
import meteor from './meteor.vue'
// 简单的随机位置生成逻辑
function getRandomStyle(index) {
  const top = `${Math.floor(Math.random() * 100)}%`
  const left = `${Math.floor(Math.random() * 95)}%`

  const scale = (Math.random() * 0.5 + 0.5).toFixed(2)
  const duration = `${(Math.random() * 3 + 2).toFixed(1)}s`
  const delay = `${index * 0.5}s`

  return {
    position: 'absolute',
    top,
    left,
    transform: `scale(${scale})`,
    animationDuration: duration,
    animationDelay: delay,
  }
}
</script>

<style scoped>
.bg-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, #1a1a2e 0%, #0d0d14 100%);
  overflow: hidden;
  color: #fff;
  pointer-events: none !important;
  overflow: hidden;
}

.star {
  /* 增加一个微弱的呼吸效果 */
  animation: flare 3s infinite ease-in-out;
}

@keyframes flare {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>
