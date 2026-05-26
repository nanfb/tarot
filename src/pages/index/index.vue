<template>
  <view class="page">
    <view class="normal-mask" :class="{ mask }" />
    <view id="content">
      <view class="hero-card">
        <view class="hero-badge">
          {{ activeSpreadMeta.title }}
        </view>
        <view class="hero-title">
          跟随直觉抽一组牌
        </view>
        <view class="hero-subtitle">
          {{ activeSpreadMeta.subtitle }}
        </view>
        <image class="hero-image" :src="sys.role === '1' ? img1 : img2" />
      </view>

      <view class="session-card mt-50rpx w-85%">
        <view class="session-head">
          <view class="session-tag">
            {{ activeSpreadMeta.title }}
          </view>
          <view class="session-tag subtle">
            {{ roleLabel }}
          </view>
        </view>
        <view class="session-text">
          {{ drawSummary || '点击下方按钮开始抽取' }}
        </view>
      </view>

      <input v-model.trim="userInput" class="input mt-30rpx w-85%" type="text" placeholder="把你此刻最在意的问题留在这里" />

      <view class="draw-btn mt-50rpx w-85%" @click="drawCards">
        <view class="decoration">
          <view class="moon i-line-md:moon-filled-alt-loop" />
          <view class="tarot i-arcticons:tarot-stars animate-spin animate-duration-120s animate-reverse" />
        </view>
        <view class="center">
          抽
          <view class="star i-line-md:star-alt-filled" />
          牌
        </view>
      </view>
    </view>

    <CardPanel
      ref="card_ref"
      :roleLabel="roleLabel"
      :mask="{ maskShow, maskHide }"
      :ai-resolve="aiResolve"
      :interpretation-text="interpretationText"
      :is-interpreting="isInterpreting"
      :has-interpretation="drawResolved"
    />
  </view>
</template>

<script setup lang="ts">
import { throttle } from 'lodash-es'
import { useGlobalLoading } from '@/hooks/useLoading'
import { httpPost } from '@/http/http'
import { useTarotInfosStore } from '@/store/sys'
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils'
import CardPanel from './components/card.vue'
import { buildDisplayCards, formatDrawSummary, getSpreadMeta } from './components/spread'

const img1 = 'https://im.gurl.eu.org/file/AgACAgEAAxkDAAEBevxp09zr-dDk1bFvGxt-VZ7q1bNgbQACqwxrG4nwoUYVFhI0D1yYGQEAAwIAA3cAAzsE.jpg'
const img2 = 'https://im.gurl.eu.org/file/AgACAgEAAxkDAAEBev1p090tEG_XGtg6F4s34bo37U8zcgACrAxrG4nwoUZrXy5b4cVpywEAAwIAA3cAAzsE.jpg'

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const roleNameMap: Record<tarotSysType['role'], string> = {
  1: '司南',
  2: '安可',
}

const baseUrl = getEnvBaseUrl()
const urls = {
  draw: '/api/tarot/draw',
  aiInterpret: `${baseUrl}/api/tarot/aiInterpret`,
}

const { showLoading, hideLoading } = useGlobalLoading()
const sys = useTarotInfosStore()
const tokenStore = useTokenStore()

const activeSpreadMeta = computed(() => getSpreadMeta(sys.drawType))
const roleLabel = computed(() => roleNameMap[sys.role] ?? roleNameMap['1'])

const card_ref = ref<InstanceType<typeof CardPanel> | null>(null)
const drawResults = ref<Card[]>([])
const drawResolved = ref(false)
const drawSummary = ref('')
const interpretationText = ref('')
const isInterpreting = ref(false)
const userInput = ref('')

async function drawCards() {
  if (isInterpreting.value) {
    uni.showToast({
      title: '请等待当前解读完成',
      icon: 'none',
    })
    return
  }

  showLoading(`正在展开${activeSpreadMeta.value.title}...`)
  drawResults.value = []
  drawResolved.value = false
  drawSummary.value = ''
  interpretationText.value = ''

  try {
    const res = await httpPost<{ cards: Card[] }>(urls.draw, {
      type: sys.drawType,
    })

    drawResults.value = res.cards ?? []
    if (!drawResults.value.length) {
      throw new Error('draw api returned empty cards')
    }

    drawSummary.value = formatDrawSummary(drawResults.value, sys.drawType)
    card_ref.value?.show({
      cards: buildDisplayCards(drawResults.value, sys.drawType),
    })
  }
  catch (error) {
    console.error('draw cards failed', error)
    uni.showToast({
      title: '抽牌失败，请稍后再试',
      icon: 'none',
    })
  }
  finally {
    hideLoading()
  }
}

const decoder = new TextDecoder('utf-8')
const scrollToBottom = throttle(() => {
  nextTick(() => {})
}, 100)

function aiResolve() {
  if (!drawResults.value.length) {
    uni.showToast({
      title: '请先抽牌',
      icon: 'none',
    })
    return
  }

  if (drawResolved.value) {
    uni.showToast({
      title: '本次牌阵已经解读过了',
      icon: 'none',
    })
    return
  }
  if (isInterpreting.value) {
    return
  }

  showLoading('正在整理解读...')
  interpretationText.value = ''
  isInterpreting.value = true

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = tokenStore.updateNowTime().validToken
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const requestTask = wx.request({
    url: urls.aiInterpret,
    method: 'POST',
    header: headers,
    data: {
      cards: drawResults.value,
      userNotes: userInput.value,
      inInterpret_role: sys.role,
      drawType: sys.drawType,
    },
    enableChunked: true,
    success: (res) => {
      if (res.statusCode !== 200) {
        uni.showToast({
          icon: 'none',
          title: '解读请求失败',
          duration: 1200,
        })
        return
      }

      drawResolved.value = true
    },
    fail: (error) => {
      console.error('interpret request failed', error)
      uni.showToast({
        icon: 'none',
        title: '解读失败，请稍后重试',
      })
    },
    complete: () => {
      hideLoading()
      isInterpreting.value = false
    },
  })

  let byteBuffer = new Uint8Array(0)
  let pendingText = ''

  requestTask.onChunkReceived((res) => {
    hideLoading()

    const newChunk = new Uint8Array(res.data)
    const combined = new Uint8Array(byteBuffer.length + newChunk.length)
    combined.set(byteBuffer)
    combined.set(newChunk, byteBuffer.length)

    let end = combined.length
    while (end > 0 && (combined[end - 1] & 0xC0) === 0x80) {
      end--
    }

    if (end > 0) {
      const lastByte = combined[end - 1]
      let expectedLen = 1

      if ((lastByte & 0xE0) === 0xC0)
        expectedLen = 2
      else if ((lastByte & 0xF0) === 0xE0)
        expectedLen = 3
      else if ((lastByte & 0xF8) === 0xF0)
        expectedLen = 4

      if (combined.length - end + 1 < expectedLen) {
        end--
      }
    }

    const safePart = combined.slice(0, end)
    byteBuffer = combined.slice(end)

    if (safePart.length > 0) {
      pendingText += decoder.decode(safePart)
    }

    while (pendingText.includes('\n\n')) {
      const separatorIndex = pendingText.indexOf('\n\n')
      const fullLine = pendingText.slice(0, separatorIndex).trim()
      pendingText = pendingText.slice(separatorIndex + 2)

      if (!fullLine.startsWith('data: ')) {
        continue
      }

      try {
        const jsonStr = fullLine.slice(6).trim()
        if (!jsonStr || jsonStr === '[DONE]')
          continue

        const result = JSON.parse(jsonStr)
        interpretationText.value += result.content ?? ''
        scrollToBottom()
      }
      catch (error) {
        console.warn('parse stream chunk failed', fullLine, error)
      }
    }
  })
}

const mask = ref(false)

function maskShow() {
  mask.value = true
}

function maskHide() {
  mask.value = false
}
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  color: #fff;

  .normal-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .mask {
    pointer-events: auto !important;
    overflow: hidden;
    touch-action: none;
    background-color: #000000;
    opacity: 0.1;
  }
}

#content {
  height: 100%;
  padding: 200rpx 24rpx 56rpx;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
}

.hero-card {
  width: 85%;
  height: 280rpx;
  padding: 30rpx 30rpx 34rpx;
  border-radius: 34rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(255, 226, 154, 0.18), transparent 32%),
    linear-gradient(155deg, rgba(27, 29, 74, 0.82), rgba(11, 17, 38, 0.86));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20rpx 44rpx rgba(7, 9, 21, 0.32);
  position: relative;
  overflow: hidden;
}

.hero-badge {
  display: inline-flex;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #ffe8ac;
  background: rgba(255, 219, 130, 0.12);
  border: 1px solid rgba(255, 219, 130, 0.18);
}

.hero-title {
  margin-top: 18rpx;
  font-size: 42rpx;
  font-weight: 600;
  line-height: 1.25;
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
}

.hero-image {
  position: absolute;
  right: -24rpx;
  bottom: -32rpx;
  width: 210rpx;
  height: 210rpx;
  border-radius: 28rpx;
  opacity: 0.18;
  transform: rotate(-10deg);
}

.session-card {
  box-sizing: border-box;
  padding: 24rpx 28rpx;
  border-radius: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.12), rgba(26, 24, 65, 0.16));
  backdrop-filter: blur(15rpx);
}

.session-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-wrap: wrap;
}

.session-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: #fff2bf;
  background: rgba(255, 221, 143, 0.12);
}

.session-tag.subtle {
  color: rgba(227, 240, 255, 0.86);
  background: rgba(112, 154, 255, 0.16);
}

.session-text {
  margin-top: 18rpx;
  white-space: pre-wrap;
  font-size: 24rpx;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.82);
}

.input {
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.14);
  height: 88rpx;
  padding: 0 30rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.1), rgba(26, 24, 65, 0.12));
  backdrop-filter: blur(15rpx);
  color: #fff;
  font-size: 28rpx;

  &:focus-within {
    outline: none;
    border-color: rgba(135, 179, 232, 0.76);
    box-shadow: 0 0 18rpx rgba(96, 145, 255, 0.18);
  }
}

.draw-btn {
  height: 164rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  border-radius: 28rpx;
  background: linear-gradient(150deg, rgba(41, 27, 102, 0.4), rgba(14, 57, 76, 0.28));
  border: 2rpx solid rgba(224, 231, 255, 0.12);
  color: #f0fdfa;
  position: relative;
  box-shadow: 0 0 12rpx rgba(224, 231, 255, 0.22);
  overflow: hidden;
  backdrop-filter: blur(8px);

  .center {
    display: flex;
    align-items: center;
    gap: 14rpx;
    font-weight: 600;
    letter-spacing: 6rpx;
  }

  .decoration {
    .moon {
      position: absolute;
      font-size: 38rpx;
      bottom: 28rpx;
      right: 28rpx;
      color: #e0e7ff;
    }

    .tarot {
      position: absolute;
      font-size: 188rpx;
      top: -106rpx;
      left: -80rpx;
      color: rgba(225, 220, 121, 0.9);
    }
  }

  .star {
    font-size: 26rpx;
    color: #e1dc79;
  }
}
</style>
