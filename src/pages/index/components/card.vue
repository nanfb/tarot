<template>
  <view class="content" :class="{ show: isShow }" @touchmove.stop.prevent>
    <view class="card-shell">
      <view class="spread-header">
        <view class="spread-title">
          {{ spreadMeta.title }}
        </view>
        <view class="spread-subtitle">
          {{ spreadMeta.subtitle }}
        </view>
      </view>

      <Cards :cards="cardInformation.cards" />

      <scroll-view class="panel-scroll" scroll-y>
        <view class="detail-list">
          <view
            v-for="item in cardInformation.cards"
            :key="`${item.id}-${item.spreadLabel}`"
            class="detail-item"
          >
            <view class="detail-top">
              <view class="detail-label">
                {{ item.spreadLabel }}
              </view>
              <view class="detail-name">
                {{ item.name }}
              </view>
              <view
                class="detail-status"
                :class="{ reversed: item.is_reversed }"
              >
                {{ item.is_reversed ? "逆位" : "正位" }}
              </view>
            </view>
            <view class="detail-desc">
              {{ item.desc || "暂无对应释义" }}
            </view>
          </view>
        </view>

        <view class="reading-panel">
          <view class="reading-header">
            <view class="reading-title">
              问问{{ props.roleLabel }}
            </view>
            <view
              class="reading-tag"
              :class="{ pending: !hasInterpretation && !isInterpreting }"
            >
              {{ interpretationStateText }}
            </view>
          </view>

          <view class="reading-body">
            <view v-if="interpretationText" class="reading-content">
              {{ interpretationText }}
            </view>
            <view v-else class="reading-placeholder">
              {{
                isInterpreting
                  ? "正在整理这次抽牌的讯息，请稍等片刻。"
                  : "点击下方按钮后，解读内容会显示在这里。"
              }}
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="operate">
      <view class="operate-btn ghost" @click="close">
        收起
      </view>
      <view
        class="operate-btn primary"
        :class="{ disabled: isInterpreting || hasInterpretation }"
        @click="Interpretation"
      >
        {{
          isInterpreting
            ? "解读中..."
            : hasInterpretation
              ? "已完成解读"
              : "解读"
        }}
      </view>
    </view>

    <view class="close-btn" @click="close">
      <view class="i-carbon-close" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { TarotSpreadDisplayCard } from './spread'
import { useTarotInfosStore } from '@/store/sys'
import Cards from './cards.vue'
import { getSpreadMeta } from './spread'

const props = withDefaults(
  defineProps<{
    mask?: {
      maskShow: () => void
      maskHide: () => void
    }
    aiResolve: () => void
    interpretationText?: string
    isInterpreting?: boolean
    hasInterpretation?: boolean
    roleLabel?: string
  }>(),
  {
    interpretationText: '',
    isInterpreting: false,
    hasInterpretation: false,
  },
)
const isShow = ref(false)

watchEffect(() => {
  if (!props.mask)
    return

  if (isShow.value) {
    props.mask.maskShow()
  }
  else {
    props.mask.maskHide()
  }
})

const sys = useTarotInfosStore()
const spreadMeta = computed(() => getSpreadMeta(sys.drawType))
const interpretationStateText = computed(() => {
  if (props.isInterpreting)
    return '生成中 ···'
  if (props.hasInterpretation)
    return '已完成 √'
  return '待开始'
})

const cardInformation = ref<ShowParams>({ cards: [] })

interface ShowParams {
  cards: TarotSpreadDisplayCard[]
}

function show(params: ShowParams) {
  cardInformation.value = {
    cards: params.cards,
  }
  isShow.value = true
}

function close() {
  isShow.value = false
  restoration()
}

function restoration() {
  cardInformation.value = { cards: [] }
}

function Interpretation() {
  if (props.isInterpreting || props.hasInterpretation) {
    return
  }
  props.aiResolve()
}

defineExpose({
  show,
  close,
})
</script>

<style scoped lang="scss">
.content {
  width: 88%;
  height: 75vh;
  transition: all 0.8s;
  left: 50%;
  transform: translateX(-50%);
  top: -80vh;
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  box-sizing: border-box;
  z-index: 20;
  opacity: 1;
}

.card-shell {
  width: 100%;
  height: 90%;
  padding: 28rpx;
  color: #f7f4e8;
  box-sizing: border-box;
  border-radius: 40rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    linear-gradient(180deg, rgba(22, 26, 59, 0.98), rgba(8, 11, 27, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  // box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.32);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.spread-header {
  margin-bottom: 8rpx;
}

.spread-title {
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.spread-subtitle {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(247, 244, 232, 0.68);
}

.panel-scroll {
  flex: 1;
  min-height: 0;
  padding-right: 4rpx;
}

.detail-list {
  padding-bottom: 8rpx;
}

.detail-item {
  padding: 22rpx 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.detail-label {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 224, 159, 0.16);
  color: #ffe8b0;
  font-size: 20rpx;
}

.detail-name {
  font-size: 28rpx;
  font-weight: 600;
}

.detail-status {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #90f0d0;
  background: rgba(71, 186, 153, 0.14);
}

.detail-status.reversed {
  color: #ffc1bf;
  background: rgba(255, 108, 108, 0.14);
}

.detail-desc {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(247, 244, 232, 0.8);
}

.reading-panel {
  margin-top: 18rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, rgba(255, 249, 234, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.reading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.reading-title {
  font-size: 28rpx;
  font-weight: 600;
}

.reading-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(108, 149, 255, 0.18);
  color: #dce7ff;
  font-size: 20rpx;
}

.reading-tag.pending {
  background: rgba(255, 217, 128, 0.14);
  color: #ffe5a3;
}

.reading-body {
  margin-top: 18rpx;
}

.reading-content {
  white-space: pre-wrap;
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(247, 244, 232, 0.9);
}

.reading-placeholder {
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(247, 244, 232, 0.54);
}

.operate {
  display: grid;
  grid-template-columns: 180rpx 1fr;
  gap: 18rpx;
}

.operate-btn {
  height: 96rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  backdrop-filter: blur(10rpx);
}

.operate-btn.ghost {
  color: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
}

.operate-btn.primary {
  color: #fff;
  background: linear-gradient(135deg, rgba(90, 123, 212, 0.888), rgba(88, 164, 183, 0.737));
  box-shadow: 0 16rpx 30rpx rgba(74, 129, 255, 0.24);
}

.operate-btn.primary.disabled {
  opacity: 0.56;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  top: 14rpx;
  right: 14rpx;
  border-radius: 50%;
  background: rgba(244, 126, 126, 0.774);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  position: absolute;
}

.show {
  top: 90rpx;
}
</style>
