export type TabId = 'overview' | 'vendors' | 'games' | 'market' | 'calendar'

export type Tier = 'T0' | 'T1' | 'T2' | 'T3'

export type VendorKind =
  | '研运一体'
  | '研发为主'
  | '大厂自研'
  | '渠道代理'
  | '海外发行'
  | '垂直新锐'

export type GameStatus = '运营中' | '即将上线' | '在研' | '停更' | '停运'

export type Platform = 'iOS' | 'Android' | 'PC' | 'PS5' | 'Switch' | 'Mac' | '云游戏'

export type Audience = '男性向' | '女性向' | '一般向'

export interface Vendor {
  id: string
  name: string
  alias: string
  hq: string
  tier: Tier
  kind: VendorKind
  capital: string
  positioning: string
  strength: string
  risk: string
  color: string
}

export interface Game {
  id: string
  name: string
  vendorId: string
  publisher?: string
  genre: string
  theme: string
  release: string
  status: GameStatus
  platforms: Platform[]
  audience: Audience
  monetization: string
  highlight: string
}

export interface MarketRow {
  game: string
  vendorId: string
  revenue: number
  change: number
  rank: number
}

export interface ReleaseEvent {
  date: string
  dateLabel: string
  game: string
  vendorId: string
  kind: '已上线' | '公测' | '测试' | '定档' | '待定'
  genre: string
  note: string
}

export const TIER_META: Record<Tier, { label: string; desc: string; color: string }> = {
  T0: {
    label: 'T0 · 超级头部',
    desc: '全球化多 IP 矩阵，单一厂商即可影响整个赛道大盘',
    color: '#42b883',
  },
  T1: {
    label: 'T1 · 头部垂类龙头',
    desc: '在某一品类建立绝对心智，拥有自研自发与出海能力',
    color: '#35495e',
  },
  T2: {
    label: 'T2 · 中坚力量',
    desc: '大厂二次元业务线，或拥有稳定长线产品的中型厂商',
    color: '#42d392',
  },
  T3: {
    label: 'T3 · 垂直 / 新锐',
    desc: '单一产品或细分玩法立足，差异化明显但抗风险能力较弱',
    color: '#a5d6c3',
  },
}