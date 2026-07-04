import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTarotInfosStore = defineStore(
  'sys',
  () => {
    const role = ref<tarotSysType['role']>('1')
    const drawType = ref<tarotSysType['drawType']>('1')

    const setRole = (newRole: tarotSysType['role']) => {
      role.value = newRole
    }

    const setDrawType = (newDrawType: tarotSysType['drawType']) => {
      drawType.value = newDrawType
    }

    const reset = () => {
      setRole('1')
      setDrawType('1')
    }

    return { role, drawType, setRole, setDrawType, reset }
  },
  {
    persist: true,
  },
)
