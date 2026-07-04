import type { IUserInfoRes } from './types/login'
import { http } from '@/http/http'

export interface TarotHistoryCard {
  id: number | string
  name: string
  spreadLabel: string
  isReversed: boolean
  description: string
}

export interface TarotHistoryRecord {
  id: number
  drawType: tarotSysType['drawType']
  drawTypeLabel: string
  role: tarotSysType['role']
  roleLabel: string
  cardsContent: string
  cards: TarotHistoryCard[]
  userNotes: string
  interpretation: string
  createdAt: string
}

export interface TarotHistoryListRes {
  list: TarotHistoryRecord[]
}

export interface UpdateTarotPreferencesBody {
  role: tarotSysType['role']
  drawType: tarotSysType['drawType']
}

export function getTarotHistory({
  pageNo,
  pageSize,
}: {
  pageNo: number
  pageSize: number
}) {
  return http.get<TarotHistoryListRes>('/api/tarot/history', {
    pageNo,
    pageSize,
  })
}

export function updateTarotPreferences(data: UpdateTarotPreferencesBody) {
  return http.put<IUserInfoRes>('/api/user/preferences', data)
}
