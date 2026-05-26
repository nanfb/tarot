<template>
  <view class="page">
    <view class="profile-card">
      <image class="avatar" :src="avatarUrl" />
      <view class="profile-info">
        <view class="nickname">
          {{ nickname }}
        </view>
        <view class="profile-copy">
          当前默认配置：{{ currentSpreadName }} / {{ currentRoleName }}
        </view>
      </view>
    </view>

    <view class="panel">
      <view class="panel-title">
        当前偏好
      </view>
      <view class="info-row">
        <view class="info-label">
          解读人物
        </view>
        <view class="info-value">
          {{ currentRoleName }}
        </view>
      </view>
      <view class="info-row">
        <view class="info-label">
          默认牌阵
        </view>
        <view class="info-value">
          {{ currentSpreadName }}
        </view>
      </view>
    </view>

    <view class="panel">
      <view class="panel-title">
        快捷入口
      </view>
      <view class="entry" @click="gotoPage('/pages/settingAdjust/settingAdjust')">
        <view>
          <view class="entry-title">
            调整抽牌配置
          </view>
          <view class="entry-desc">
            修改默认牌阵和解读人物
          </view>
        </view>
        <view class="i-carbon-arrow-right" />
      </view>
      <view class="entry" @click="gotoPage('/pages/history/history')">
        <view>
          <view class="entry-title">
            查看历史记录
          </view>
          <view class="entry-desc">
            回看所有已完成的抽牌解读
          </view>
        </view>
        <view class="i-carbon-arrow-right" />
      </view>
    </view>

    <view class="logout-card">
      <view class="logout-title">
        退出登录
      </view>
      <view class="logout-desc">
        退出后会清空当前设备上的登录状态，但不会删除已保存的历史记录。
      </view>
      <view class="logout-btn" @click="loginout">
        退出当前账号
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useGlobalLoading } from '@/hooks/useLoading'
import { useTarotInfosStore } from '@/store/sys'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

const { showLoading, hideLoading } = useGlobalLoading()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const sys = useTarotInfosStore()

definePage({
  layout: 'needloginDefaultHaveBack',
  style: {
    navigationBarTitleText: '设置',
    navigationStyle: 'custom',
  },
})

const spreadNameMap: Record<tarotSysType['drawType'], string> = {
  1: '单牌指引',
  2: '三牌阵',
  3: '凯尔特十字',
}

const roleNameMap: Record<tarotSysType['role'], string> = {
  1: '司南',
  2: '安可',
}

const nickname = computed(() => userStore.userInfo.nickname || '已登录用户')
const avatarUrl = computed(() => userStore.userInfo.avatar || '/static/images/default-avatar.png')
const currentSpreadName = computed(() => spreadNameMap[sys.drawType] ?? spreadNameMap['1'])
const currentRoleName = computed(() => roleNameMap[sys.role] ?? roleNameMap['1'])

onShow(() => {
  refreshProfile()
})

async function refreshProfile() {
  try {
    await userStore.fetchUserInfo()
  }
  catch (error) {
    console.error('refresh profile failed', error)
  }
}

async function loginout() {
  showLoading('退出中...')
  try {
    await tokenStore.logout()
    uni.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 1000,
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
  catch (error: any) {
    uni.showToast({
      title: error || '退出失败',
      icon: 'none',
    })
  }
  finally {
    hideLoading()
  }
}

function gotoPage(url: string) {
  uni.navigateTo({
    url,
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100%;
  padding: 24rpx;
  box-sizing: border-box;
  color: #fff;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 30rpx;
  border-radius: 30rpx;
  background:
    radial-gradient(circle at top right, rgba(255, 225, 145, 0.18), transparent 36%),
    linear-gradient(155deg, rgba(29, 32, 76, 0.82), rgba(10, 15, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18rpx 42rpx rgba(7, 9, 21, 0.26);
}

.avatar {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.18);
}

.profile-info {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
}

.profile-copy {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.68);
}

.panel,
.logout-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(150deg, rgba(51, 30, 154, 0.12), rgba(26, 24, 65, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15rpx);
}

.panel-title,
.logout-title {
  font-size: 30rpx;
  font-weight: 600;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 20rpx;
}

.info-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.64);
}

.info-value {
  font-size: 26rpx;
  color: #fff3c4;
}

.entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 20rpx;
  padding: 22rpx 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.entry-title {
  font-size: 28rpx;
  font-weight: 500;
}

.entry-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.58);
}

.logout-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.66);
}

.logout-btn {
  margin-top: 24rpx;
  height: 92rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, rgba(255, 122, 122, 0.94), rgba(255, 92, 92, 0.82));
  box-shadow: 0 14rpx 26rpx rgba(255, 92, 92, 0.2);
}
</style>
