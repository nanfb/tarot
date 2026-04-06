<template>
  <view class="page" :style="{ paddingTop: `${safeHeight}px` }">
    <view class="list">
      <view class="item" hover-class="item-hover" :hover-start-time="50">
        <view>
          <view class="i-carbon-user-avatar-filled-alt icon"></view>
          游客
        </view>
        <!-- <view class="i-carbon-arrow-right"></view> -->
      </view>
      <view class="item" hover-class="item-hover" :hover-start-time="50" @click="gotoPage('/pages/history/history')">
        <view>
          <view class="i-carbon-time icon"></view>
          历史记录
        </view>
        <view class="i-carbon-arrow-right"></view>
      </view>
      <view class="item" hover-class="item-hover" :hover-start-time="50" @click="gotoPage('/pages/settingAdjust/settingAdjust')">
        <view>
          <view class="i-carbon-settings-adjust icon"></view>
          配置
        </view>
        <view class="i-carbon-arrow-right"></view>
      </view>
      <view
        class="item" hover-class="item-hover" :hover-start-time="50" @click="gotoPage('/pages/about/about')"
      >
        <view>
          <view class="i-carbon-notebook icon"></view>
          关于我们
        </view>
        <view class="i-carbon-arrow-right"></view>
      </view>
      <view class="item" hover-class="item-hover" :hover-start-time="50" @click="gotoPage('/pages/feedback/feedback')">
        <view>
          <view class="i-carbon-user-feedback icon"></view>
          反馈
        </view>
        <view class="i-carbon-arrow-right"></view>
      </view>
    </view>
    <view class="login-btn center" hover-class="login-hover" :hover-start-time="50">
      立即登录
    </view>
  </view>
</template>

<script lang="ts" setup>
import { LOGIN_PAGE } from '@/router/config'
import { useTokenStore } from '@/store/token'

const { height: safeHeight } = wx.getMenuButtonBoundingClientRect()
definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationStyle: 'custom',
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

function gotoPage(url: string) {
  uni.navigateTo({
    url,
  })
}
</script>

<style scoped lang="scss">
.page {
  width: 100%;
  height: 100%;
  color: #fff;
  box-sizing: border-box;
  position: relative;
}
.list {
  padding: 20rpx;
  .item {
    width: 100%;
    display: flex;
    height: 80rpx;
    border: 2rpx solid #fff;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 20rpx;
    margin: 40rpx 0;
    border-radius: 20rpx;
    backdrop-filter: blur(10rpx);
    background-color: #8a8a9637;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    .icon {
      margin-right: 20rpx;
      font-size: 30rpx;
    }
  }
  .item-hover {
    background-color: rgba(255, 255, 255, 0.2);
    border: 2rpx solid rgba(255, 255, 255, 0.8);
    transform: scale(0.99);
  }
}

.login-btn {
  margin: 0 auto;
  position: absolute;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  backdrop-filter: blur(10rpx);
  width: 80%;
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  background: linear-gradient(135deg, #2ca3ed83 0%, #7816ef61 100%);
  border: 1rpx solid rgba(110, 143, 251, 0.795);
  box-shadow: 0 10rpx 30rpx rgba(110, 143, 251, 0.363);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.login-hover {
  background: rgba(255, 255, 255, 0.25);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}
</style>
