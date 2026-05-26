export interface TarotSpreadDisplayCard {
  id: number | string
  name: string
  is_reversed: boolean
  desc: string
  spreadLabel: string
}

export interface TarotSpreadMeta {
  count: number
  title: string
  subtitle: string
  labels: string[]
}

type TarotSourceCard = Partial<Card> & {
  id?: number | string
  is_reversed?: boolean
}

const spreadMetaMap: Record<tarotSysType['drawType'], TarotSpreadMeta> = {
  1: {
    count: 1,
    title: '单牌指引',
    subtitle: '聚焦一个问题，给当下一个清晰方向',
    labels: ['指引'],
  },
  2: {
    count: 3,
    title: '三牌阵',
    subtitle: '过去 / 现在 / 未来',
    labels: ['过去', '现在', '未来'],
  },
  3: {
    count: 10,
    title: '凯尔特十字',
    subtitle: '把问题拆开，看清阻力、环境与结果',
    labels: ['现状', '阻碍', '显意识', '潜意识', '过去', '未来', '自我', '环境', '希望', '结果'],
  },
}

export function getSpreadMeta(drawType: tarotSysType['drawType']): TarotSpreadMeta {
  return spreadMetaMap[drawType] ?? spreadMetaMap['1']
}

export function getDrawCount(drawType: tarotSysType['drawType']) {
  return getSpreadMeta(drawType).count
}

export function buildDisplayCards(cards: TarotSourceCard[], drawType: tarotSysType['drawType']) {
  const meta = getSpreadMeta(drawType)

  return cards.slice(0, meta.count).map((card, index): TarotSpreadDisplayCard => {
    const isReversed = Boolean(card.is_reversed)
    const uprightDesc = card.description_upright ?? ''
    const reversedDesc = card.description_reversed ?? uprightDesc

    return {
      id: card.id ?? `${drawType}-${index}`,
      name: card.name_cn ?? card.name_en ?? `第 ${index + 1} 张牌`,
      is_reversed: isReversed,
      desc: isReversed ? reversedDesc : uprightDesc,
      spreadLabel: meta.labels[index] ?? `位置 ${index + 1}`,
    }
  })
}

export function formatDrawSummary(cards: TarotSourceCard[], drawType: tarotSysType['drawType']) {
  return buildDisplayCards(cards, drawType)
    .map(card => `${card.spreadLabel}：${card.name}（${card.is_reversed ? '逆位' : '正位'}）`)
    .join('\n')
}
