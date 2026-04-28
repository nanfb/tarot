<template>
  <view>
    设置
  </view>
  <view class="loginout" @click="loginout">
    退出登录
  </view>
</template>

<script lang="ts" setup>
import { useTokenStore } from '@/store/token'

const { showLoading, hideLoading } = useGlobalLoading()
definePage({
  layout: 'needloginDefaultHaveBack',
  style: {
    navigationBarTitleText: '设置',
    navigationStyle: 'custom',
  },
})

const tokenStore = useTokenStore()
async function loginout() {
  showLoading()
  try {
    await tokenStore.logout() // 直接等待返回结果
    uni.showToast({
      title: '退出登录成功',
      icon: 'success',
      duration: 1000,
    })
    setTimeout(() => {
      uni.navigateBack() // 退出登录成功后返回上一页
    }, 1000)
  }
  catch (err: any) {
    uni.showToast({
      title: err || '未知错误',
      icon: 'error',
    })
  }
  finally {
    hideLoading()
  }
}
</script>

<style scoped>
.loginout {
  margin: 30rpx;
  width: 200rpx;
  padding: 20rpx;
  color: #fff;
}
</style>
