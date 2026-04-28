<template>
  <view :style="{ height: `${safeHeight}px`, width: '100%' }" class="page-bg-color" />
  <view :style="{ height: `${safeHeight}px`, width: '100%' }" />
  <view class="page-back h-50px" :style="{ top: `${safeHeight}px` }">
    <view class="i-line-md-arrow-left" @click="gotoBack"></view>
  </view>
  <view class="h-50px"></view>
  <!--  -->
  <view
    class="box-container"
    :style="{ height: `calc(100vh - 50px - env(safe-area-inset-bottom) - ${safeHeight}px)` }"
  >
    <banner />
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { useTokenStore } from '@/store/token'
// 非tabbar页，带返回按钮
import banner from './comp/banner.vue'
/**
 * 这个页面模板跟defaultHaveBack比多了个校验，需要登录才能访问的页面使用这个模板，如果没有登录则会自动跳转到首页
 * todo这里没有用自带的路由拦截器策略是因为懒得写白名单，后面如果这个比较麻烦的话就改成拦截器
 */
const tokenStore = useTokenStore()
watchEffect(() => {
  if (!tokenStore.hasLogin) {
    uni.reLaunch({
      url: '/pages/index/index',
    })
  }
})

// 认定胶囊区域以下为安全区
let safeHeight = 0
if (wx.getMenuButtonBoundingClientRect) {
  safeHeight = wx.getMenuButtonBoundingClientRect().top // 获取胶囊按钮位置信息
}
function gotoBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page-bg-color {
  background: linear-gradient(0deg, #19192c, #444a68);
  position: fixed;
  top: 0px;
  z-index: 999;
}

.box-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 26rpx;
}

.page-back {
  width: 100%;
  color: #fff;
  box-sizing: border-box;
  padding: 0 30rpx;
  font-size: 38rpx;
  display: flex;
  align-items: center;
  position: fixed;
  z-index: 999;
}
</style>
