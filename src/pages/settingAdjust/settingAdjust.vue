<template>
  <view class="container">
    <view class="hero">
      <view class="hero-title">
        抽牌配置
      </view>
      <view class="hero-subtitle">
        保存后会同步首页默认牌阵和解读人物，历史记录也会按当前设置写入。
      </view>
      <view class="hero-pills">
        <view class="pill">
          {{ currentSpreadName }}
        </view>
        <view class="pill subtle">
          {{ currentCharacterName }}
        </view>
      </view>
    </view>

    <view v-for="group in configLayout" :key="group.key" class="config-group">
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
            {{ item.icon }}
          </view>
          <view class="spread-name">
            {{ item.name }}
          </view>
          <view class="spread-desc">
            {{ item.desc }}
          </view>
          <view v-if="currentSpread === item.id" class="selected-mark" />
        </view>
      </view>

      <view v-else class="character-container">
        <view
          v-for="item in group.list" :key="item.id" class="character-card"
          :class="[`card-${item.id}`, { 'is-selected': currentCharacter === item.id }]" @tap="selectCharacter(item.id)"
        >
          <view class="char-avatar">
            {{ item.name[0] }}
          </view>

          <view class="char-info">
            <view class="char-header">
              <text class="char-name">{{ item.name }}</text>
              <text class="char-style" :class="`style-${item.id}`">{{ item.styleTag }}</text>
            </view>
            <text class="char-desc">{{ item.desc }}</text>
          </view>

          <view v-if="currentCharacter === item.id" class="char-check">
            当前
          </view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="save-btn" :disabled="isSaving" @tap="saveConfig">
        {{ isSaving ? '保存中...' : '保存配置' }}
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { updateTarotPreferences } from '@/api/tarot'
import { useGlobalLoading } from '@/hooks/useLoading'
import { useTarotInfosStore } from '@/store/sys'
import { useUserStore } from '@/store/user'

const { showLoading, hideLoading } = useGlobalLoading()
const sys = useTarotInfosStore()
const userStore = useUserStore()
const isSaving = ref(false)

definePage({
  layout: 'needloginDefaultHaveBack',
  style: {
    navigationBarTitleText: '配置',
    navigationStyle: 'custom',
  },
})

const spreadIdMap: Record<tarotSysType['drawType'], 'single' | 'three' | 'celtic'> = {
  1: 'single',
  2: 'three',
  3: 'celtic',
}

const drawTypeMap: Record<'single' | 'three' | 'celtic', tarotSysType['drawType']> = {
  single: '1',
  three: '2',
  celtic: '3',
}

const characterIdMap: Record<tarotSysType['role'], 'sinan' | 'encore'> = {
  1: 'sinan',
  2: 'encore',
}

const roleMap: Record<'sinan' | 'encore', tarotSysType['role']> = {
  sinan: '1',
  encore: '2',
}

const configLayout = [
  {
    name: '选择牌阵',
    key: 'spread',
    subtitle: 'Spread',
    list: [
      { id: 'single', name: '单牌指引', desc: '快速回答一个问题，适合日常状态确认。', icon: '✦' },
      { id: 'three', name: '三牌阵', desc: '用过去、现在、未来整理事件脉络。', icon: '◈' },
      { id: 'celtic', name: '凯尔特十字', desc: '适合复杂问题，信息更完整。', icon: '✧' },
    ],
  },
  {
    name: '解读人物',
    key: 'character',
    subtitle: 'Reader',
    list: [
      {
        id: 'sinan',
        name: '司南',
        styleTag: '冷静 / 直给',
        desc: '更偏理性拆解，适合想快速理清问题核心的时候。',
      },
      {
        id: 'encore',
        name: '安可',
        styleTag: '温柔 / 感受',
        desc: '更偏情绪共鸣，适合想听一段有陪伴感的解读。',
      },
    ],
  },
] as const

const currentSpread = computed(() => spreadIdMap[sys.drawType])
const currentCharacter = computed(() => characterIdMap[sys.role])
const currentSpreadName = computed(() => configLayout[0].list.find(item => item.id === currentSpread.value)?.name ?? '单牌指引')
const currentCharacterName = computed(() => configLayout[1].list.find(item => item.id === currentCharacter.value)?.name ?? '司南')

onLoad(() => {
  syncRemotePreferences()
})

async function syncRemotePreferences() {
  showLoading('同步当前配置...')
  try {
    await userStore.fetchUserInfo()
  }
  catch (error) {
    console.error('sync user preferences failed', error)
  }
  finally {
    hideLoading()
  }
}

function selectSpread(id: 'single' | 'three' | 'celtic') {
  sys.setDrawType(drawTypeMap[id])
}

function selectCharacter(id: 'sinan' | 'encore') {
  sys.setRole(roleMap[id])
}

async function saveConfig() {
  if (isSaving.value) {
    return
  }

  isSaving.value = true
  showLoading('保存配置...')

  try {
    const response = await updateTarotPreferences({
      role: sys.role,
      drawType: sys.drawType,
    })

    userStore.setUserInfo({
      ...userStore.userInfo,
      ...response,
    })
    userStore.applyTarotPreferences(response)

    uni.showToast({
      title: '配置已保存',
      icon: 'success',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 350)
  }
  catch (error) {
    console.error('save tarot preferences failed', error)
    uni.showToast({
      title: '保存失败，请稍后重试',
      icon: 'none',
    })
  }
  finally {
    isSaving.value = false
    hideLoading()
  }
}
</script>

<style scoped lang="scss">
.container {
  min-height: 100%;
  color: #fff;
  padding: 24rpx 24rpx 180rpx;
  box-sizing: border-box;
}

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
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.68);
}

.hero-pills {
  display: flex;
  gap: 14rpx;
  flex-wrap: wrap;
  margin-top: 20rpx;
}

.pill {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #fff2bf;
  background: rgba(255, 221, 143, 0.12);
}

.pill.subtle {
  color: rgba(227, 240, 255, 0.86);
  background: rgba(112, 154, 255, 0.16);
}

.config-group {
  margin-top: 28rpx;
}

.group-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 22rpx;
  gap: 14rpx;
}

.group-title {
  font-size: 34rpx;
  font-weight: 600;
}

.group-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.46);
  text-transform: uppercase;
}

.spread-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
}

.spread-card {
  position: relative;
  min-height: 236rpx;
  padding: 24rpx 20rpx;
  border-radius: 24rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.spread-card.is-selected {
  background: linear-gradient(180deg, rgba(255, 222, 143, 0.12), rgba(255, 255, 255, 0.04));
  border-color: rgba(255, 220, 132, 0.42);
  transform: translateY(-4rpx);
  box-shadow: 0 14rpx 26rpx rgba(0, 0, 0, 0.16);
}

.spread-icon {
  font-size: 44rpx;
}

.spread-name {
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.spread-desc {
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.62);
}

.selected-mark {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #ffd977;
  box-shadow: 0 0 16rpx rgba(255, 217, 119, 0.56);
}

.character-container {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.character-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 24rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
}

.character-card.is-selected {
  border-color: rgba(125, 177, 255, 0.34);
  box-shadow: 0 14rpx 26rpx rgba(0, 0, 0, 0.16);
}

.char-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.card-sinan .char-avatar {
  background: rgba(74, 136, 255, 0.18);
}

.card-encore .char-avatar {
  background: rgba(255, 139, 139, 0.18);
}

.char-info {
  width: 65%;
}

.char-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.char-name {
  font-size: 30rpx;
  font-weight: 600;
}

.char-style {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.74);
}

.style-sinan {
  background: rgba(74, 136, 255, 0.16);
  color: #bcd6ff;
}

.style-encore {
  background: rgba(255, 139, 139, 0.16);
  color: #ffd0d0;
}

.char-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.66);
}

.char-check {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff2bf;
  background: rgba(255, 221, 143, 0.12);
}

.action-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 30rpx 24rpx;
  padding-bottom: calc(30rpx + var(--safe-area-inset-bottom));
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(8, 10, 24, 0.96) 70%, rgba(8, 10, 24, 0));
}

.save-btn {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #0e122a;
  background: linear-gradient(135deg, #ffd978, #ffbf6f);
  box-shadow: 0 14rpx 26rpx rgba(255, 191, 111, 0.24);
}
</style>
