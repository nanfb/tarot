import { createSSRApp } from 'vue'
import App from './App.vue'
import { useGlobalLoading } from './hooks/useLoading'
import { requestInterceptor } from './http/interceptor'
import { routeInterceptor } from './router/interceptor'
import store from './store'
import '@/style/index.scss'
import 'virtual:uno.css'
// 解决icon真机报错，Polyfill
import 'fast-text-encoding'

const navApis = ['navigateTo', 'redirectTo', 'switchTab', 'reLaunch', 'navigateBack']
const { forceHideLoading } = useGlobalLoading()
navApis.forEach((api) => {
  uni.addInterceptor(api, {
    invoke() {
      forceHideLoading()
    },
  })
})
export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(routeInterceptor)
  app.use(requestInterceptor)
  return {
    app,
  }
}
