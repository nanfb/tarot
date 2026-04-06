<template>
  <view class="container">
    <view v-for="(group, index) in configLayout" :key="index" class="config-group">
      <view class="group-header">
        <text class="group-title">{{ group.name }}</text>
        <text class="group-subtitle">{{ group.subtitle }}</text>
      </view>

      <view v-if="group.key === 'spread'" class="spread-container">
        <view
          v-for="item in group.list" :key="item.id" class="spread-card"
          :class="{ 'is-selected': currentSpread === item.id }" @tap="selectSpread(item.id)"
        >
          <view class="spread-icon">
            <text class="iconfont">{{ item.icon }}</text>
          </view>
          <view class="spread-content">
            <text class="spread-name">{{ item.name }}</text>
            <text class="spread-desc">{{ item.desc }}</text>
          </view>
          <view v-if="currentSpread === item.id" class="selected-mark">
            <text class="inner-tick"></text>
          </view>
        </view>
      </view>

      <view v-else-if="group.key === 'character'" class="character-container">
        <view
          v-for="item in group.list" :key="item.id" class="character-card"
          :class="[`card-${item.id}`, { 'is-selected': currentCharacter === item.id }]" @tap="selectCharacter(item.id)"
        >
          <view class="char-avatar-placeholder">
            <text class="char-legacy">{{ item.name[0] }}</text>
          </view>

          <view class="char-info">
            <view class="char-header">
              <text class="char-name">{{ item.name }}</text>
              <text class="char-style" :class="`style-${item.id}`">{{ item.styleTag }}</text>
            </view>
            <text class="char-desc">{{ item.desc }}</text>
          </view>

          <view class="select-glow"></view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="save-btn">
        保存配置
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useGlobalLoading } from '@/hooks/useLoading'
import { httpGet } from '@/http/http'

const { showLoading, hideLoading } = useGlobalLoading()
definePage({
  layout: 'defaultHaveBack',
  style: {
    navigationBarTitleText: '配置',
    navigationStyle: 'custom',
  },
})

const urls = {
  getConfig: '/api/user/config',
}
onLoad(() => {
  getConfig()
})

function getConfig() {
  showLoading('获取配置信息...')
  httpGet(urls.getConfig).then((res) => {

  }).finally(() => {
    hideLoading()
  })
}

// 当前选中的状态（将来应该从 Pinia 或 Storage 读取）
const currentSpread = ref('single')
const currentCharacter = ref('sinan')

// 增加更多的配置元数据
const configLayout: any = [
  {
    name: '选择牌阵',
    key: 'spread',
    subtitle: 'Spread Type',
    list: [
      { id: 'single', name: '单牌指引', desc: '每日启示/快速解答', icon: '🎴' },
      { id: 'three', name: '三圣杯', desc: '过去/现在/未来', icon: '🏆' },
      { id: 'celtic', name: '凯尔特十字', desc: '深度剖析/全面运势', icon: '✝️' },
    ],
  },
  {
    name: '契约占卜师',
    key: 'character',
    subtitle: 'Diviner',
    list: [
      {
        id: 'sinan',
        name: '司南',
        styleTag: '中式·严谨',
        desc: '宿命观，透过星象与易理看穿迷雾，言语犀利。',
        color: '#1a3b5c', // 司南的主色调：深蓝
      },
      {
        id: 'encore',
        name: '安可',
        styleTag: '西式·灵动',
        desc: '直觉系，擅长解析梦境与潜意识，温柔共情。',
        color: '#5c1a3b', // 安可的主色调：复古红
      },
    ],
  },
]

// 交互逻辑
function selectSpread(id: string) {
  currentSpread.value = id
}

function selectCharacter(id: string) {
  currentCharacter.value = id
}
</script>

<style scoped>
/* 基础容器 */
.container {
  color: #e0e0e0;
  padding: 0 30rpx;
  box-sizing: border-box;
}

/* 分组标题样式 */
.config-group {
  margin-bottom: 50rpx;
}

.group-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 30rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #d4af37;
  /* 黄金强调色 */
}

.group-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 15rpx;
  letter-spacing: 2rpx;
}

.group-subtitle {
  font-size: 24rpx;
  color: #888;
  text-transform: uppercase;
}

/* --- 1. 抽牌类型（横向卡片） --- */
.spread-container {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.spread-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

/* 选中状态 */
.spread-card.is-selected {
  background: rgba(212, 175, 55, 0.1);
  /* 金色背景 */
  border-color: #d4af37;
  box-shadow: 0 0 15rpx rgba(212, 175, 55, 0.3);
  transform: translateY(-4rpx);
}

.spread-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  opacity: 0.8;
}

.is-selected .spread-icon {
  opacity: 1;
  transform: scale(1.1);
}

.spread-content {
  display: flex;
  flex-direction: column;
}

.spread-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8rpx;
}

.spread-desc {
  font-size: 22rpx;
  color: #aaa;
  line-height: 1.3;
}

.is-selected .spread-desc {
  color: #ccc;
}

/* 选中标记 */
.selected-mark {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background-color: #d4af37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner-tick {
  width: 16rpx;
  height: 8rpx;
  border-left: 3rpx solid #101014;
  border-bottom: 3rpx solid #101014;
  transform: rotate(-45deg);
  margin-top: -4rpx;
}

/* --- 2. 占卜角色（大型卡片） --- */
.character-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.character-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

/* 角色特定的选中边框和光晕 */
.card-sinan.is-selected {
  border-color: #3498db;
  /* 司南 科技/神秘蓝 */
  box-shadow: 0 0 20rpx rgba(52, 152, 219, 0.4);
}

.card-encore.is-selected {
  border-color: #e74c3c;
  /* 安可 热情/灵动红 */
  box-shadow: 0 0 20rpx rgba(231, 76, 60, 0.4);
}

/* 角色头像占位 */
.char-avatar-placeholder {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.card-sinan .char-avatar-placeholder {
  background: rgba(52, 152, 219, 0.1);
  border-color: rgba(52, 152, 219, 0.3);
}

.card-encore .char-avatar-placeholder {
  background: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.3);
}

.char-legacy {
  font-size: 50rpx;
  font-family: 'Courier New', Courier, monospace;
  /* 营造一种复古感 */
  color: rgba(255, 255, 255, 0.6);
}

.char-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.char-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.char-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-right: 15rpx;
}

.char-style {
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

/* 角色专属标签颜色 */
.style-sinan {
  background: rgba(52, 152, 219, 0.2);
  color: #85c1e9;
}

.style-encore {
  background: rgba(231, 76, 60, 0.2);
  color: #f1948a;
}

.char-desc {
  font-size: 24rpx;
  color: #aaa;
  line-height: 1.4;
}

/* 底部动作条 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30rpx 50rpx;
  padding-bottom: calc(30rpx + var(--safe-area-inset-bottom));
  background: linear-gradient(to top, #101014 80%, rgba(16, 16, 20, 0));
  box-sizing: border-box;
  z-index: 10;
}

.save-btn {
  background: #d4af37;
  color: #101014;
  font-weight: 600;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  box-shadow: 0 6rpx 20rpx rgba(212, 175, 55, 0.4);
}

.save-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 10rpx rgba(212, 175, 55, 0.4);
}
</style>
