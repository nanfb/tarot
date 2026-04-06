import { reactive, ref } from 'vue'

const loading_config = reactive({
  loading: false,
  title: '命运感知中...',
  frontIcon: 'i-line-md-moon-filled-alt-loop', // 默认正面图标
  backIcon: 'i-line-md:star-alt-filled', // 默认背面图标
})

/**
 * 【计数器】处理并发请求
 * 防止请求 A 还没结束，请求 B 就把 Loading 给关了
 */
const loadingCount = ref(0)

export function useGlobalLoading() {
  const showLoading = (
    title?: string,
    icons?: { front?: string, back?: string },
  ) => {
    if (title)
      loading_config.title = title
    if (icons?.front)
      loading_config.frontIcon = icons.front
    if (icons?.back)
      loading_config.backIcon = icons.back

    loadingCount.value++
    loading_config.loading = true
  }

  const hideLoading = () => {
    // 容错处理：防止计数器变成负数
    loadingCount.value = Math.max(0, loadingCount.value - 1)

    if (loadingCount.value === 0) {
      loading_config.loading = false
    }
  }

  /**
   * 强制重置（用于路由跳转）
   */
  const forceHideLoading = () => {
    loadingCount.value = 0
    loading_config.loading = false
  }

  return {
    loading_config, // 给根组件绑定用
    showLoading, // 给业务页面调用
    hideLoading, // 给业务页面调用
    forceHideLoading,
  }
}
