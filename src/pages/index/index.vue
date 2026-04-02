<!-- eslint-disable no-cond-assign -->
<template>
  <view class="page">
    <view class="normal-mask" :class="{ mask: mask }" />
    <view class="check-role" :class="{ select: isSelect, unselect: !isSelect }" @click="debouncedHandleClick">
      <view class="text-white">
        选择角色
      </view>
      <view class="card">
        <view class="inner" :class="{ flip: !isFlip }">
          <image class="img front" src="https://picui.ogmua.cn/s1/2026/03/23/69c12da27dd94.webp" />
          <image class="img back" src="https://picui.ogmua.cn/s1/2026/03/23/69c1340136c65.webp" />
        </view>
      </view>
    </view>

    <view id="content">
      <view class="banner">
        <image src="https://picui.ogmua.cn/s1/2026/03/23/69c12da27dd94.webp" />
      </view>

      <input v-model.trim="userInput" class="input mt-30rpx" type="text" placeholder="请在心中默念您的困惑或者在此输入">

      <scroll-view class="coninter mt-30rpx w-80%" scroll-y scroll-with-animation :scroll-top="scrollTop">
        {{ responseText ? responseText : '点击下方按钮抽牌~' }}
      </scroll-view>
      <view class="draw-btn mt-30rpx" @click="drawCards">
        <view class="decoration">
          <view class="moon i-line-md:moon-filled-alt-loop" />
          <view class="tarot i-arcticons:tarot-stars animate-spin animate-duration-120s animate-reverse" />
        </view>
        <view class="center">
          抽
          -
          <view class="star i-line-md:star-alt-filled" />
          -
          牌
        </view>
      </view>
    </view>
    <card ref="card_ref" :mask="{ maskShow, maskHide }" :aiResolve="aiResolve" />
    <loading v-bind="loading_config" />
  </view>
</template>

<script setup lang="ts">
import { debounce, throttle } from 'lodash-es'
import { useLocalLoading } from '@/hooks/useLocalLoading'
import { httpPost } from '@/http/http'
import { useTarotInfosStore } from '@/store/sys'
import { getEnvBaseUrl } from '@/utils'
import card from './components/card.vue'

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

// #region init
const { loading_config, showLoading, hideLoading } = useLocalLoading()
const sys = useTarotInfosStore()
// #endregion

const isFlip = computed(
  () => sys.role === '1',
)
const isSelect = ref(false)
const debouncedHandleClick = debounce(handlecheck, 800, {
  leading: true,
  trailing: false,
})
function handlecheck() {
  if (isSelect.value)
    sys.role === '1' ? sys.setRole('2') : sys.setRole('1')
  else
    isSelect.value = true
}
watch(isFlip, () => {
  setTimeout(() => {
    isSelect.value = false
  }, 800)
})

console.log(isFlip.value, sys.role)
const baseUrl = getEnvBaseUrl()
// 卡片组件
const card_ref = ref<InstanceType<typeof card> | null>(null)

// 抽牌
const responseText = ref('')
const drawResult = ref<any>(null)

function drawCards() {
  showLoading('正在感知命运...')
  drawResult.value = null
  responseText.value = ''
  httpPost<{ cards: Card[] }>('/api/tarot/draw', { type: sys.role }).then((res) => {
    drawResult.value = res.cards[0]
    drawResult.value.sign = false
    responseText.value += `牌面：${drawResult.value.name_cn} (${drawResult.value.is_reversed ? '逆位' : '正位'})`
    card_ref.value?.show({
      name: drawResult.value.name_cn,
      is_reversed: drawResult.value.is_reversed,
      desc: drawResult.value.is_reversed ? drawResult.value.description_reversed : drawResult.value.description_upright,
    })
  }).catch((err) => {
    console.error('抽牌失败', err)
  }).finally(() => {
    hideLoading()
  })
}
// 解读
const scrollTop = ref(0)
const scrollToBottom = throttle(() => {
  nextTick(() => {
    scrollTop.value = scrollTop.value === 99999 ? 99998 : 99999
  })
}, 100)
const decoder = new TextDecoder('utf-8')
const userInput = ref('')
function aiResolve() {
  if (!drawResult.value) {
    uni.showToast({
      title: '请先抽牌',
      icon: 'error',
    })
    return
  }
  if (drawResult.value.sign) {
    uni.showToast({
      title: '此牌面已解析过了，请先抽牌',
      icon: 'error',
    })
    return
  }
  showLoading('正在解读中ing...')
  responseText.value += `\n解析：`
  const requestTask = wx.request({
    url: `${baseUrl}/api/tarot/aiInterpret`,
    method: 'POST',
    data: { cards: [drawResult.value], userNotes: userInput.value, inInterpret_role: sys.role },
    enableChunked: true, // 开启分块传输模式
    success: (res) => {
      if (res.statusCode !== 200) {
        uni.showToast({
          icon: 'none',
          title: '请求错误',
          duration: 1000,
        })
        return
      }
      else {
        drawResult.value.sign = true // 标记当前牌面已经解析过了
      }
    },
    fail: (err) => {
      console.log('请求失败', err)
    },
    complete: () => {
      hideLoading()
    },
  })
  let byteBuffer = new Uint8Array(0)
  let pendingText = ''
  requestTask.onChunkReceived((res) => {
    hideLoading()

    // 1. 将新收到的 ArrayBuffer 转为 Uint8Array 并拼接到缓冲区
    const newChunk = new Uint8Array(res.data)
    const combined = new Uint8Array(byteBuffer.length + newChunk.length)
    combined.set(byteBuffer)
    combined.set(newChunk, byteBuffer.length)

    // 2. 找到最后一个完整 UTF-8 字符的边界，防止 decode 报错
    let end = combined.length
    // UTF-8 多字节字符的延续字节以 10xxxxxx (0x80) 开头
    while (end > 0 && (combined[end - 1] & 0xC0) === 0x80) {
      end--
    }
    // 检查基本字节，判断该字符是否完整
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

    // 3. 解码安全的部分并存入 pendingText，留下的残缺字节存入 byteBuffer
    const safePart = combined.slice(0, end)
    byteBuffer = combined.slice(end)

    if (safePart.length > 0) {
      pendingText += decoder.decode(safePart)
    }

    while (pendingText.includes('\n\n')) {
      const separatorIndex = pendingText.indexOf('\n\n')
      const fullLine = pendingText.slice(0, separatorIndex).trim()

      // 更新 pendingText，去掉已处理的部分
      pendingText = pendingText.slice(separatorIndex + 2)

      if (fullLine.startsWith('data: ')) {
        try {
          const jsonStr = fullLine.slice(6).trim()
          if (jsonStr && jsonStr !== '[DONE]') {
            const result = JSON.parse(jsonStr)
            responseText.value += result.content

            // 如果需要自动滚动，这里是触发时机
            scrollToBottom()
          }
        }
        catch (e) {
          console.warn('解析 JSON 失败:', fullLine)
        }
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
    transition: opacity 0.5s;
  }
  .mask {
    pointer-events: auto !important;
    overflow: hidden;
    touch-action: none;
    background-color: #000;
    opacity: 0.6;
  }
}

.select {
  transform: translate(0, 0);
  transition: all 1s;
}

.unselect {
  transform: translate(-130rpx, 0);
  transition: all 1s;
}

.check-role {
  position: absolute;
  top: 60rpx;
  width: 240rpx;
  height: 100rpx;
  color: #f0fdfa;
  background-color: #302b7640;
  backdrop-filter: blur(10rpx);
  border-radius: 0 120rpx 120rpx 0;
  border: 1px solid #e5dfaf6e;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-sizing: border-box;

  .card {
    height: 70%;
    aspect-ratio: 1 / 1;
  }

  .inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    border-radius: 50%;
  }

  .inner.flip {
    transform: rotateY(180deg);
  }

  .img {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2rpx solid #fc7c7c;
    vertical-align: baseline;
  }

  .back {
    transform: rotateY(180deg);
    border: 2rpx solid #78eb78;
  }
}

#content {
  height: 100%;
  padding: 180rpx 20rpx 50rpx 20rpx;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  // justify-content: space-between;

  .banner {
    width: 60%;
    height: 400rpx;
    border-radius: 20rpx;
    overflow: hidden;
    opacity: 0.5;
    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .input {
    width: 80%;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.5);
    height: 80rpx;
    padding: 0 30rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    background: linear-gradient(150deg, #331e9a0a, rgba(26, 24, 65, 0.08));
    backdrop-filter: blur(15rpx);
    color: #fff;
    transition: all 0.3s ease;
    font-size: 28rpx;
    &:focus-within {
      outline: none;
      border: 1px solid #87b3e8;
      background: linear-gradient(150deg, rgba(51, 30, 154, 0.2), rgba(89, 140, 163, 0.1));
      box-shadow: 0 0 15rpx rgba(205, 69, 69, 0.3); // 增加一点微光效果
    }
  }
  .draw-btn {
    width: 80%;
    height: 160rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    border-radius: 24rpx;
    background: linear-gradient(150deg, #331e9a0a, rgba(26, 24, 65, 0.08));
    border: 2rpx solid #e0e7ff0a;
    color: #f0fdfa;
    transition: transform 1s ease;
    position: relative;
    box-shadow: 0 0 8rpx 0 #e0e7ff;
    overflow: hidden;
    /* 1. 基础透明背景 */
    // background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(5px);
    .decoration {
      .moon {
        position: absolute;
        font-size: 36rpx;
        bottom: 30rpx;
        right: 30rpx;
        color: #e0e7ff;
      }

      .tarot {
        position: absolute;
        font-size: 180rpx;
        top: -110rpx;
        left: -90rpx;
        color: #e1dc79;
      }
    }

    .star {
      margin: 8rpx 0rpx 0 0rpx;
      font-size: 24rpx;
      color: #e1dc79;
    }
  }
  .coninter {
    box-sizing: border-box;
    padding: 20rpx;
    /* 自动换行 */
    white-space: pre-wrap;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 30rpx;
    flex: 1;
    overflow: scroll;
    scroll-y: auto;
    backdrop-filter: blur(5px);
    background: linear-gradient(150deg, #331e9a0a, rgba(26, 24, 65, 0.08));
  }
}
</style>
