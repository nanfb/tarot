<template>
  <z-paging ref="pagingRef" v-model="records" :paging-style="{ paddingTop: `${safeHeight}px` }" safe-area-inset-bottom :show-scrollbar="false" :fixed="true" @query="fetchHistory">
    <!-- <template #top>
      <view class="hero-wrapper">
        <view class="hero">
          <view class="hero-title">
            历史记录
          </view>
          <view class="hero-subtitle">
            只展示已经完成解读的记录，方便回看每一次抽牌的脉络。
          </view>
        </view>
      </view>
    </template> -->

    <view class="history-list">
      <view v-for="record in records" :key="record.id" class="history-card" @click="toggleDrawer(record.id)">
        <view class="history-card__top">
          <view class="history-card__tags">
            <view class="tag">
              {{ getDrawTypeName(record.drawType) }}
            </view>
            <view class="tag" :class="record.role === '1' ? 'sinan' : 'anke'">
              {{ getRoleName(record.role) }}
            </view>
          </view>
          <view class="history-card__time">
            {{ formatTime(record.createdAt) }}
          </view>
        </view>

        <view class="chips">
          <view
            v-for="card in record.cards" :key="`${record.id}-${card.id}-${card.spreadLabel}`" class="chip"
            :class="{ reversed: card.isReversed }"
          >
            {{ card.spreadLabel }} · {{ card.name }} · {{ card.isReversed ? '逆位' : '正位' }}
          </view>
        </view>

        <view v-if="record.userNotes" class="question-block">
          <view class="section-title">
            提问
          </view>
          <view class="section-text limit-lines" :class="{ 'is-expanded': expandedId === record.id }">
            {{ record.userNotes }}
          </view>
        </view>

        <view v-show="expandedId === record.id" class="drawer-content">
          <view class="section">
            <view class="section-title">
              牌阵内容
            </view>
            <view class="section-text">
              {{ record.cardsContent }}
            </view>
          </view>

          <view v-if="record.interpretation" class="section">
            <view class="section-title">
              解读
            </view>
            <view class="section-text emphasis">
              {{ record.interpretation }}
            </view>
          </view>
        </view>

        <view class="drawer-indicator">
          {{ expandedId === record.id ? '收起详情' : '展开解读' }}
        </view>
      </view>
    </view>

    <template #empty>
      <view class="empty-wrapper">
        <view class="empty">
          <view class="empty-title">
            暂无已解读记录
          </view>
          <view class="empty-copy">
            完成一次抽牌并解读后，这里会自动出现对应的历史记录。
          </view>
        </view>
      </view>
    </template>
  </z-paging>
</template>

<script lang="ts" setup>
import type { TarotHistoryRecord } from '@/api/tarot'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { getTarotHistory } from '@/api/tarot'
// 移除 useGlobalLoading，因为 z-paging 自带局部 loading 状态

definePage({
  layout: 'needloginDefaultHaveBack',
  style: {
    navigationBarTitleText: '历史记录',
    navigationStyle: 'custom',
  },
})
let safeHeight = 0
if (wx.getMenuButtonBoundingClientRect) {
  // +50 是保留返回按钮的高度，模板上写了但是z-paging好像没有顶开，这里重新写下
  safeHeight = wx.getMenuButtonBoundingClientRect().top + 50 // 获取胶囊按钮位置信息
}
// z-paging 的 ref 实例
const pagingRef = ref<any>(null)
const records = ref<TarotHistoryRecord[]>([])
const expandedId = ref<number | null>(null)

const drawTypeNameMap: Record<tarotSysType['drawType'], string> = {
  1: '单牌指引 ✦',
  2: '三牌阵 ◈',
  3: '凯尔特十字 ✧',
}

const roleNameMap: Record<tarotSysType['role'], string> = {
  1: '司南',
  2: '安可',
}

// 注意：移除了 onShow 里面的 fetchHistory 调用。
// z-paging 挂载后会自动触发一次 @query 绑定的事件。

// 接收 z-paging 传入的页码和条数
async function fetchHistory(pageNo: number, pageSize: number) {
  try {
    const response = await getTarotHistory({ pageNo, pageSize })
    const validList = (response.list ?? []).filter((item: any) => item.interpretation?.trim())

    // 将请求结果传给 z-paging 组件
    pagingRef.value?.complete(validList)

    // 每次请求新数据时重置展开状态
    expandedId.value = null
  }
  catch (error) {
    console.error('fetch history failed', error)
    // 请求失败时，通知 z-paging 结束请求状态并展示错误/重试 UI
    pagingRef.value?.complete(false)
  }
}

function toggleDrawer(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatTime(value: string) {
  return dayjs(value).format('YYYY.MM.DD HH:mm')
}

function getDrawTypeName(drawType: tarotSysType['drawType']) {
  return drawTypeNameMap[drawType] ?? drawTypeNameMap['1']
}

function getRoleName(role: tarotSysType['role']) {
  return roleNameMap[role] ?? roleNameMap['1']
}
</script>

<style scoped lang="scss">
.hero {
  padding: 30rpx;
  border-radius: 30rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 225, 145, 0.18), transparent 36%),
    linear-gradient(155deg, rgba(29, 32, 76, 0.82), rgba(10, 15, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18rpx 42rpx rgba(7, 9, 21, 0.26);
}

.hero-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.68);
}

.history-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.history-card {
  padding: 28rpx 28rpx 20rpx;
  border-radius: 28rpx;
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.12), rgba(26, 24, 65, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15rpx);
  transition: all 0.3s ease;
  color: #fff;
}

.history-card:active {
  transform: scale(0.98);
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.18), rgba(26, 24, 65, 0.24));
}

.history-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.history-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff2bf;
  background: rgba(255, 221, 143, 0.12);
  box-sizing: border-box;
}

/* 司南 (Sinan) - 清冷/理性蓝 */
.sinan {
  color: #73b8f5;
  border: 1px solid #77c0ff;
  background-color: rgba(115, 184, 245, 0.15);
}

/* 安可 (Anke) - 热情/感性粉 */
.anke {
  color: #f89a9a;
  border: 1px solid #ff7171;
  background-color: rgba(248, 154, 154, 0.15);
}
.history-card__time {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.58);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.chip {
  padding: 10rpx 16rpx;
  border-radius: 18rpx;
  font-size: 22rpx;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.84);
  background: rgba(255, 255, 255, 0.06);
}

.chip.reversed {
  color: #ffd1d1;
  background: rgba(255, 112, 112, 0.12);
}

.question-block,
.section {
  margin-top: 24rpx;
}

.section-title {
  font-size: 22rpx;
  color: rgba(255, 232, 176, 0.88);
  margin-bottom: 10rpx;
}

.section-text {
  white-space: pre-wrap;
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
}

.section-text.emphasis {
  color: rgba(255, 255, 255, 0.92);
}

.limit-lines {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.limit-lines.is-expanded {
  -webkit-line-clamp: unset;
}

.drawer-content {
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  margin-top: 24rpx;
  padding-top: 10rpx;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer-indicator {
  margin-top: 20rpx;
  text-align: center;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

/* 适配 z-paging 空状态的排版 */
.empty-wrapper {
  padding: 0 24rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  padding: 70rpx 32rpx;
  border-radius: 28rpx;
  text-align: center;
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.1), rgba(26, 24, 65, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
}

.empty-copy {
  margin-top: 16rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.64);
}
</style>
