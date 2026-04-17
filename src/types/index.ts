export interface User {
  name: string
  color: string
  email?: string
}

export interface CampaignRow {
  id: string
  date?: string // Kept for optional backward compatibility, but deprecated
  startDate: string
  endDate: string
  platform: string
  channel?: string
  campaign: string
  audience: string
  description?: string
  impressions: number
  reach: number
  clicksAds: number
  clicksRD: number
  leadsSalesSheet: number
  leadsRD: number
  quoteQty: number
  quoteValue: number
  orderQty: number
  orderValue: number
  week?: string
  cost?: number
  pastClicksRD?: number
  version?: number
  createdAt?: string
  originalId?: string
}

export interface OtherChannelRow {
  id: string
  date: string
  channel: string
  userName?: string
  userColor?: string
  leads: number
  quotesQty: number
  quotesValue: number
  ordersQty: number
  ordersValue: number
  clicks?: number
  conversations?: number
  accesses?: number
}

export interface Integration {
  id: string
  name: string
  status: 'Ativo' | 'Inativo' | 'Não Conectado'
  lastSync: string
  type: 'google' | 'meta' | 'rd' | 'sheets'
  apiToken?: string
  trackingId?: string
}

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export interface Analysis {
  id: string
  dateRangeStr: string
  improved: string
  worsened: string
  decisions: string
  improvedFiles?: FileAttachment[]
  worsenedFiles?: FileAttachment[]
  decisionsFiles?: FileAttachment[]
  pdfUrl?: string
  excelUrl?: string
  platforms?: string[]
  author?: User
}

export interface FilterState {
  dateRange: { from: Date; to?: Date } | undefined
  platforms: string[]
  campaigns: string[]
  audiences: string[]
}

export interface ActivityLogEntry {
  id: string
  userId: string
  userName: string
  userColor: string
  type: string
  description: string
  timestamp: string
  payload: any
  reverted?: boolean
}

export interface ManualSectionConfig {
  link: string
  mediaUrl: string
  mediaType: 'image' | 'video' | 'pdf' | 'none'
}
