<template>
  <view class="cards-board" :class="`board-${activeDrawType}`">
    <view class="board-aura" />
    <view class="board-grid" />
    <view
      v-for="(item, index) in layoutCards" :key="`${item.id}-${index}`" class="spread-card"
      :class="[`slot-${index + 1}`, { 'is-cross-card': activeDrawType === '3' && index === 1, 'is-reversed-card': item.is_reversed }]"
      :style="{
        '--x': item.layout.x,
        '--y': item.layout.y,
        '--rotate': `${item.layout.rotate}deg`,
        '--scale': `${item.layout.scale ?? 1}`,
        '--delay': `${index * 80}ms`,
        '--z-index': `${item.layout.zIndex ?? index + 1}`,
      }"
    >
      <view class="spread-card__face">
        <view class="spread-card__glow" />
        <text class="spread-card__label">{{ item.spreadLabel }}</text>
        <view class="spread-card__body">
          <text class="spread-card__name">{{ item.name }}</text>
        </view>
        <text class="spread-card__status">{{ item.is_reversed ? '逆位' : '正位' }}</text>
      </view>
    </view>

    <view v-if="!layoutCards.length" class="spread-empty">
      牌阵会在这里展开
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { TarotSpreadDisplayCard } from './spread'
import { useTarotInfosStore } from '@/store/sys'
import { getSpreadMeta } from './spread'

interface CardSlotLayout {
  x: string
  y: string
  rotate: number
  scale?: number
  zIndex?: number
}

const props = withDefaults(defineProps<{
  cards?: TarotSpreadDisplayCard[]
  drawType?: tarotSysType['drawType']
}>(), {
  cards: () => [],
})

const sys = useTarotInfosStore()
const activeDrawType = computed(() => props.drawType ?? sys.drawType)
const spreadMeta = computed(() => getSpreadMeta(activeDrawType.value))

const layoutMap: Record<tarotSysType['drawType'], CardSlotLayout[]> = {
  1: [
    { x: '50%', y: '53%', rotate: -2, scale: 1.02, zIndex: 2 },
  ],
  2: [
    { x: '22%', y: '56%', rotate: -8, scale: 0.98, zIndex: 1 },
    { x: '50%', y: '50%', rotate: 0, scale: 1.04, zIndex: 3 },
    { x: '78%', y: '56%', rotate: 8, scale: 0.98, zIndex: 2 },
  ],
  3: [
    { x: '31%', y: '50%', rotate: -4, scale: 1, zIndex: 4 },
    { x: '31%', y: '50%', rotate: 90, scale: 1, zIndex: 5 },
    { x: '31%', y: '22%', rotate: -3, scale: 0.98, zIndex: 3 },
    { x: '31%', y: '78%', rotate: 3, scale: 0.98, zIndex: 3 },
    { x: '14%', y: '50%', rotate: -7, scale: 0.98, zIndex: 2 },
    { x: '48%', y: '50%', rotate: 6, scale: 0.98, zIndex: 2 },
    { x: '79%', y: '18%', rotate: 2, scale: 0.96, zIndex: 1 },
    { x: '79%', y: '38%', rotate: 1, scale: 0.96, zIndex: 1 },
    { x: '79%', y: '58%', rotate: -1, scale: 0.96, zIndex: 1 },
    { x: '79%', y: '78%', rotate: -2, scale: 0.96, zIndex: 1 },
  ],
}

const layoutCards = computed(() => {
  const layouts = layoutMap[activeDrawType.value] ?? layoutMap['1']
  return props.cards.slice(0, spreadMeta.value.count).map((card, index) => ({
    ...card,
    layout: layouts[index] ?? layouts[layouts.length - 1],
  }))
})
</script>

<style scoped lang="scss">
.cards-board {
  position: relative;
  width: 100%;
  margin: 24rpx 0 28rpx;
  border-radius: 34rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 229, 162, 0.22), transparent 42%),
    linear-gradient(180deg, rgba(32, 26, 63, 0.98), rgba(9, 12, 29, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.04);
}

.board-1,
.board-2 {
  height: 400rpx;
}

.board-3 {
  height: 520rpx;
}

.board-aura {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 48% 28%, rgba(255, 224, 148, 0.16), transparent 24%),
    radial-gradient(circle at 16% 78%, rgba(86, 147, 255, 0.12), transparent 18%),
    radial-gradient(circle at 84% 18%, rgba(101, 206, 186, 0.1), transparent 18%);
}

.board-grid {
  position: absolute;
  inset: 24rpx;
  border-radius: 24rpx;
  border: 1rpx dashed rgba(255, 255, 255, 0.08);
}

.spread-card {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 182rpx;
  height: 292rpx;
  transform: translate(-50%, -50%) rotate(var(--rotate)) scale(var(--scale));
  z-index: var(--z-index);
  animation: card-enter 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay);
}

.board-1 .spread-card {
  width: 220rpx;
  height: 338rpx;
}

.board-3 .spread-card {
  width: 124rpx;
  height: 198rpx;
}

.spread-card__face {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 18rpx 16rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 26rpx;
  overflow: hidden;
  color: #f7f1d0;
  border: 2rpx solid rgba(246, 224, 161, 0.4);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
    linear-gradient(160deg, rgba(42, 23, 81, 0.96), rgba(16, 24, 63, 0.98));
  box-shadow:
    0 18rpx 38rpx rgba(0, 0, 0, 0.36),
    inset 0 0 0 2rpx rgba(255, 255, 255, 0.05);
  animation: card-float 5.8s ease-in-out infinite;
  animation-delay: var(--delay);
}

.is-cross-card .spread-card__face {
  padding: 14rpx 18rpx;
}

.is-reversed-card .spread-card__face {
  border-color: rgba(255, 168, 168, 0.42);
  box-shadow:
    0 18rpx 38rpx rgba(0, 0, 0, 0.36),
    inset 0 0 0 2rpx rgba(255, 214, 214, 0.05),
    0 0 18rpx rgba(255, 122, 122, 0.08);
}

.spread-card__glow {
  position: absolute;
  right: -12%;
  bottom: -10%;
  width: 132rpx;
  height: 132rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 221, 146, 0.24), transparent 70%);
  filter: blur(4rpx);
}

.spread-card__label {
  position: relative;
  font-size: 20rpx;
  color: rgba(247, 241, 208, 0.72);
  letter-spacing: 2rpx;
}

.spread-card__body {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spread-card__name {
  font-size: 24rpx;
  line-height: 1.4;
  font-weight: 600;
  text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.28);
}

.spread-card__status {
  position: relative;
  align-self: flex-start;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff6d3;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.is-reversed-card .spread-card__status {
  color: #ffd4d4;
  background: rgba(255, 112, 112, 0.12);
  border-color: rgba(255, 170, 170, 0.18);
}

.board-3 .spread-card__label,
.board-3 .spread-card__status {
  font-size: 16rpx;
}

.board-3 .spread-card__name {
  font-size: 18rpx;
}

.spread-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(247, 241, 208, 0.6);
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 42rpx)) rotate(var(--rotate)) scale(0.84);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(var(--scale));
  }
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8rpx);
  }
}
</style>
