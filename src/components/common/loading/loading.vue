<template>
  <view
    v-if="loading"
    class="bg fixed inset-0 z-10001 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
    @touchmove.stop.prevent="() => { }" @click.stop="() => { }"
  >
    <view class="card-container relative h-120rpx w-80rpx">
      <view class="card-face card-front shadow-[0_0_15rpx_rgba(168,85,247,0.5)]">
        <view class="text-40rpx text-purple-200" :class="[frontIcon]" />
      </view>

      <view
        v-for="n in 6" :key="n" class="card-layer"
        :style="{ transform: `translateZ(${(1.8 - n * 0.6).toFixed(1)}rpx)` }"
      />

      <view class="card-face card-back shadow-[0_0_15rpx_rgba(59,130,246,0.5)]">
        <view class="text-40rpx text-blue-200" :class="[backIcon]" />
      </view>
    </view>

    <text v-if="title" class="mt-4 animate-pulse text-sm text-purple-100/80 tracking-widest">
      {{ title }}
    </text>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  loading?: boolean
  title?: string
  frontIcon?: string
  backIcon?: string
}
// i-line-md-star-alt-twotone i-line-md-moon-filled-alt-loop
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  title: '命运感知中...',
  frontIcon: 'i-line-md-moon-filled-alt-loop',
  backIcon: 'i-line-md-star-alt-filled',
})
</script>

<style scoped>
.bg {
  backdrop-filter: blur(10rpx);
}

.card-container {
  transform-style: preserve-3d;
  perspective: 1000px;
  animation: card-flip 2.5s infinite ease-in-out;
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(192, 132, 252, 0.5);
  border-radius: 12rpx;
  background-color: #1a1a2e;
  backface-visibility: hidden;
}

/* 中间层公共样式 */
.card-layer {
  position: absolute;
  inset: 0;
  background-color: #11111f;
  border-radius: 12rpx;
  border-left: 1px solid rgba(192, 132, 252, 0.1);
  border-right: 1px solid rgba(192, 132, 252, 0.1);
}

.card-front {
  z-index: 2;
  transform: rotateY(0deg) translateZ(2rpx);
}

.card-back {
  transform: rotateY(180deg) translateZ(2rpx);
}

@keyframes card-flip {
  0% {
    transform: rotateY(0deg);
  }

  50% {
    transform: rotateY(180deg);
  }

  100% {
    transform: rotateY(360deg);
  }
}
</style>
