import {
  CampaignRow,
  OtherChannelRow,
  Analysis,
  ActivityLogEntry,
  ManualSectionConfig,
} from '@/types'
import { mockData, mockOtherChannelsData, mockAnalyses } from '@/data/mock'

const CLOUD_DB_KEY = 'skip_campaign_cloud_backend_db'

export interface CloudDB {
  campaigns: CampaignRow[]
  otherChannels: OtherChannelRow[]
  analyses: Analysis[]
  activityLog: ActivityLogEntry[]
  manualConfig: Record<string, ManualSectionConfig>
}

const defaultManualConfig: Record<string, ManualSectionConfig> = {
  facebook: { link: 'https://adsmanager.facebook.com/', mediaUrl: '', mediaType: 'none' },
  google: { link: 'https://ads.google.com/', mediaUrl: '', mediaType: 'none' },
  rdstation: { link: 'https://app.rdstation.com.br/', mediaUrl: '', mediaType: 'none' },
  planilha: { link: 'https://docs.google.com/spreadsheets/', mediaUrl: '', mediaType: 'none' },
  site: { link: 'https://analytics.google.com/', mediaUrl: '', mediaType: 'none' },
}

const getCloudData = (): CloudDB => {
  const cloud = localStorage.getItem(CLOUD_DB_KEY)
  if (cloud) {
    try {
      return JSON.parse(cloud)
    } catch (e) {
      console.warn('Failed to parse cloud DB')
    }
  }
  const initData = {
    campaigns: mockData,
    otherChannels: mockOtherChannelsData,
    analyses: mockAnalyses,
    activityLog: [],
    manualConfig: defaultManualConfig,
  }
  localStorage.setItem(CLOUD_DB_KEY, JSON.stringify(initData))
  return initData
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Emulate a centralized cloud service that synchronizes universally
export const CloudAPI = {
  async fetchAll(): Promise<CloudDB> {
    await delay(300) // Simulate network latency
    return getCloudData()
  },

  async saveAll(data: Partial<CloudDB>): Promise<CloudDB> {
    await delay(500) // Simulate network latency

    const currentDb = getCloudData()
    const newDb = { ...currentDb, ...data }

    // Merge activity logs to prevent overwriting concurrent actions
    if (data.activityLog && currentDb.activityLog) {
      const mergedMap = new Map()
      currentDb.activityLog.forEach((item) => mergedMap.set(item.id, item))
      data.activityLog.forEach((item) => mergedMap.set(item.id, item))
      newDb.activityLog = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
    }

    localStorage.setItem(CLOUD_DB_KEY, JSON.stringify(newDb))

    // Broadcast change for other connected clients to achieve instant Real-time push
    try {
      const bc = new BroadcastChannel('cloud_db_sync')
      bc.postMessage('sync')
      bc.close()
    } catch (e) {
      window.dispatchEvent(new Event('cloud_sync'))
    }

    return newDb
  },
}
