<script setup lang="ts">
import { ref } from 'vue'
import { useGlobalLoading } from '@/hooks/useLoading'
import FgTabbar from '@/tabbar/index.vue'
import { isPageTabbar } from './tabbar/store'
import { currRoute } from './utils'

const { loading_config } = useGlobalLoading()
const isCurrentPageTabbar = ref(true)
onShow(() => {
  console.log('App.ku.vue onShow', currRoute())
  const { path } = currRoute()
  // “蜡笔小开心”提到本地是 '/pages/index/index'，线上是 '/' 导致线上 tabbar 不见了
  // 所以这里需要判断一下，如果是 '/' 就当做首页，也要显示 tabbar
  if (path === '/') {
    isCurrentPageTabbar.value = true
  }
  else {
    isCurrentPageTabbar.value = isPageTabbar(path)
  }
})

// const exposeRef = ref('this is form app.Ku.vue')

defineExpose({
  // exposeRef,

})
</script>

<template>
  <view class="root">
    <loading v-if="loading_config.loading" v-bind="loading_config" />
    <KuRootView />

    <FgTabbar v-if="isCurrentPageTabbar" />
  </view>
</template>

<style scoped>
.root {
  width: 100%;
  height: 100vh;
}
</style>
