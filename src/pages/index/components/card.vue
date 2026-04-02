<template>
  <view class="content" :class="{ show: isShow }" @touchmove.stop.prevent>
    <view class="card">
      <view>{{ cardInformation.name }}</view>
      <view>{{ cardInformation.is_reversed ? '正位' : '逆位' }}</view>
      <view>{{ cardInformation.desc }}</view>
      <cards></cards>
    </view>
    <view class="operate">
      <view v-show="isShow" class="Interpretation" @click="Interpretation">
        解读 <view class="i-carbon-book ml-10rpx" />
      </view>
      <!-- <view class="i-arcticons:tarot-stars" /> -->
    </view>
    <view class="close-btn" @click="close">
      <view class="i-carbon-close" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import cards from './cards.vue'

const props = defineProps<{
  mask?: {
    maskShow: () => void
    maskHide: () => void
  }
  aiResolve: () => void
}>()
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
const cardInformation = ref<showParams>({
  name: '',
  is_reversed: false,
  desc: '',
})

interface showParams {
  name: string
  is_reversed: boolean
  desc: string
  [key: string]: any
}
function show(params: showParams) {
  cardInformation.value = params
  isShow.value = true
}
function close() {
  isShow.value = false
  restoration()
}

function restoration() {
  cardInformation.value = { name: '', is_reversed: false, desc: '' }
}
function Interpretation() {
  props.aiResolve()
  close()
}
defineExpose({
  show,
  close,
})
</script>

<style scoped lang="scss">
.content {
  width: 78%;
  height: 800rpx;
  transition: all 1s;
  left: 50%;
  transform: translateX(-50%);
  top: -810rpx;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 20;
  overflow: hidden;
}
.card {
  width: 100%;
  height: 700rpx;
  color: #000;
  padding: 20rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  border-radius: 40rpx;
  background-color: #71a2b9;
}
.operate {
  flex: 1;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding: 0 50rpx;
  box-sizing: border-box;
}
.Interpretation {
  width: 100%;
  height: 100%;
  color: #fff;
  background-color: #4a81ffa2;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10rpx);
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  top: 10rpx;
  right: 10rpx;
  border-radius: 50%;
  background-color: #cd4a4aab;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50rpx;
  position: absolute;
}
.show {
  top: 100rpx;
}
</style>
