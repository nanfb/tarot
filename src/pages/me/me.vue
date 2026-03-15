<template>
  <view class="page">
    <view>我的</view>
    <view class="login-btn" @click="handleLogin">
      登录
    </view>
  </view>
</template>

<script lang="ts" setup>
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const tokenStore = useTokenStore()

// 微信小程序下登录
async function handleLogin() {
  // #ifdef MP-WEIXIN
  // 微信登录
  await tokenStore.wxLogin()

  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({
    url: `${LOGIN_PAGE}`,
  })
  // #endif
}
</script>

<style>
.page {
  display: flex;
}
</style>
