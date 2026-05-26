import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/api/login'
import { useTarotInfosStore } from './sys'

const userInfoState: IUserInfoRes = {
  userId: -1,
  nickname: '',
  avatar: '/static/images/default-avatar.png',
}

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })

    const setUserInfo = (value: IUserInfoRes) => {
      if (!value.avatar) {
        value.avatar = userInfoState.avatar
      }

      userInfo.value = value
    }

    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
    }

    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    const applyTarotPreferences = (value: IUserInfoRes) => {
      const tarotStore = useTarotInfosStore()
      if (value.role === '1' || value.role === '2') {
        tarotStore.setRole(value.role)
      }
      if (value.drawType === '1' || value.drawType === '2' || value.drawType === '3') {
        tarotStore.setDrawType(value.drawType)
      }
    }

    const fetchUserInfo = async () => {
      const response = await getUserInfo()
      setUserInfo(response)
      applyTarotPreferences(response)
      return response
    }

    return {
      userInfo,
      clearUserInfo,
      fetchUserInfo,
      setUserInfo,
      setUserAvatar,
      applyTarotPreferences,
    }
  },
  {
    persist: true,
  },
)
