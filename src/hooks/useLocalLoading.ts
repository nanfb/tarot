export function useLocalLoading() {
  const loading_config = ref<{
    loading: boolean
    title: undefined | string
  }>({
    loading: false,
    title: undefined,
  })

  function showLoading(title?: string) {
    if (title) {
      loading_config.value.title = title
    }

    loading_config.value.loading = true
  }
  function hideLoading() {
    loading_config.value.loading = false
    loading_config.value.title = undefined
  }

  // 返回给页面使用
  return {
    loading_config,
    showLoading,
    hideLoading,
  }
}
