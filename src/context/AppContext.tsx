import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  CampaignRow,
  OtherChannelRow,
  Integration,
  Analysis,
  FilterState,
  User,
  ActivityLogEntry,
  ManualSectionConfig,
} from '../types'
import { mockIntegrations } from '../data/mock'
import { subDays } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { CloudAPI } from '@/services/api'

interface AppContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (user: User) => void
  logout: () => void
  data: CampaignRow[]
  setData: React.Dispatch<React.SetStateAction<CampaignRow[]>>
  otherChannelsData: OtherChannelRow[]
  setOtherChannelsData: React.Dispatch<React.SetStateAction<OtherChannelRow[]>>
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  specificFilters: FilterState
  setSpecificFilters: React.Dispatch<React.SetStateAction<FilterState>>
  integrations: Integration[]
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>
  analyses: Analysis[]
  setAnalyses: React.Dispatch<React.SetStateAction<Analysis[]>>
  activityLog: ActivityLogEntry[]
  logAction: (type: string, description: string, payload: any, actor?: User) => void
  undoAction: (id: string) => void
  manualConfig: Record<string, ManualSectionConfig>
  setManualConfig: React.Dispatch<React.SetStateAction<Record<string, ManualSectionConfig>>>
  updateManualConfig: (key: string, next: ManualSectionConfig) => void
  tableColumnWidths: Record<string, number>
  setTableColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
  hasUnsavedChanges: boolean
  isSaving: boolean
  isRefreshing: boolean
  isInitializing: boolean
  commitToCloud: () => Promise<void>
  refreshFromCloud: (showToast?: boolean, isPassiveSync?: boolean) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultTableWidths = {
  startDate: 100,
  endDate: 100,
  platform: 100,
  campaign: 160,
  audience: 120,
  impressions: 80,
  reach: 80,
  clicksRD: 80,
  clicksAds: 80,
  ctr: 70,
  diffClicks: 80,
  leadsSalesSheet: 80,
  leadsRD: 80,
  cvl: 70,
  quoteQty: 80,
  quoteValue: 90,
  orderQty: 80,
  orderValue: 90,
  leadsPerBudget: 80,
  budgetPerOrder: 90,
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campaign_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (err) {
        console.error('Failed to parse campaign_user from localStorage', err)
      }
    }
    return null
  })

  const [isInitializing, setIsInitializing] = useState(true)
  const [data, _setData] = useState<CampaignRow[]>([])
  const [otherChannelsData, _setOtherChannelsData] = useState<OtherChannelRow[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [analyses, _setAnalyses] = useState<Analysis[]>([])
  const [manualConfig, _setManualConfig] = useState<Record<string, ManualSectionConfig>>({})

  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: subDays(new Date(), 6),
      to: new Date(),
    },
    platforms: [],
    campaigns: [],
    audiences: [],
  })

  const [specificFilters, setSpecificFilters] = useState<FilterState>({
    dateRange: {
      from: subDays(new Date(), 3),
      to: new Date(),
    },
    platforms: [],
    campaigns: [],
    audiences: [],
  })

  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)

  const [tableColumnWidths, setTableColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('campaign_table_widths')
    return saved ? JSON.parse(saved) : defaultTableWidths
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const dataRef = useRef(data)
  const otherRef = useRef(otherChannelsData)
  const analysesRef = useRef(analyses)
  const manualRef = useRef(manualConfig)
  const userRef = useRef(user)
  const activityLogRef = useRef(activityLog)

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges)
  const isSavingRef = useRef(isSaving)
  const isInitializingRef = useRef(isInitializing)

  useEffect(() => {
    dataRef.current = data
  }, [data])
  useEffect(() => {
    otherRef.current = otherChannelsData
  }, [otherChannelsData])
  useEffect(() => {
    analysesRef.current = analyses
  }, [analyses])
  useEffect(() => {
    manualRef.current = manualConfig
  }, [manualConfig])
  useEffect(() => {
    userRef.current = user
  }, [user])
  useEffect(() => {
    activityLogRef.current = activityLog
  }, [activityLog])
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])
  useEffect(() => {
    isSavingRef.current = isSaving
  }, [isSaving])
  useEffect(() => {
    isInitializingRef.current = isInitializing
  }, [isInitializing])

  const setData = useCallback((action: React.SetStateAction<CampaignRow[]>) => {
    _setData(action)
    setHasUnsavedChanges(true)
  }, [])

  const setOtherChannelsData = useCallback((action: React.SetStateAction<OtherChannelRow[]>) => {
    _setOtherChannelsData(action)
    setHasUnsavedChanges(true)
  }, [])

  const setAnalyses = useCallback((action: React.SetStateAction<Analysis[]>) => {
    _setAnalyses(action)
    setHasUnsavedChanges(true)
  }, [])

  const setManualConfig = useCallback(
    (action: React.SetStateAction<Record<string, ManualSectionConfig>>) => {
      _setManualConfig(action)
      setHasUnsavedChanges(true)
    },
    [],
  )

  useEffect(() => {
    if (user) {
      localStorage.setItem('campaign_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('campaign_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('campaign_table_widths', JSON.stringify(tableColumnWidths))
  }, [tableColumnWidths])

  const commitToCloud = useCallback(async () => {
    setIsSaving(true)

    try {
      const updatedDB = await CloudAPI.saveAll({
        campaigns: dataRef.current,
        otherChannels: otherRef.current,
        analyses: analysesRef.current,
        activityLog: activityLogRef.current,
        manualConfig: manualRef.current,
      })

      setActivityLog(updatedDB.activityLog)
      setHasUnsavedChanges(false)
    } catch (e) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível salvar as alterações no banco central.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Auto-Save Effect
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving && !isInitializing) {
      const timer = setTimeout(() => {
        commitToCloud()
      }, 1500) // Auto-sync to the cloud after 1.5s of no modifications
      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, isSaving, isInitializing, commitToCloud])

  const refreshFromCloud = useCallback(async (showToast = false, isPassiveSync = false) => {
    if (!isPassiveSync) setIsRefreshing(true)

    try {
      const db = await CloudAPI.fetchAll()

      // If it's a background passive sync, and the user HAS unsaved changes, DO NOT OVERWRITE THEIR STATE!
      if (isPassiveSync && hasUnsavedChangesRef.current) {
        return
      }

      _setData(db.campaigns)
      _setOtherChannelsData(db.otherChannels)
      _setAnalyses(db.analyses)
      _setManualConfig(db.manualConfig)
      setActivityLog(db.activityLog)

      if (!hasUnsavedChangesRef.current) {
        setHasUnsavedChanges(false)
      }

      if (showToast) {
        toast({
          title: 'Dados Sincronizados',
          description: 'Sua visualização foi atualizada com a nuvem.',
        })
      }
    } catch (err) {
      console.error('Error refreshing from cloud', err)
      if (showToast) {
        toast({
          title: 'Erro de Conexão',
          description: 'Não foi possível buscar dados do servidor.',
          variant: 'destructive',
        })
      }
    } finally {
      if (!isPassiveSync) setIsRefreshing(false)
      setIsInitializing(false)
    }
  }, [])

  // Initial fetch from central cloud database
  useEffect(() => {
    if (user) {
      refreshFromCloud(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Listen to remote changes across tabs for instant Real-time Sync
  useEffect(() => {
    const handleStorage = (e: MessageEvent | Event | StorageEvent) => {
      if (e instanceof StorageEvent && e.key === 'skip_campaign_cloud_backend_db') {
        refreshFromCloud(false, true)
      } else if (e instanceof MessageEvent && e.data === 'sync') {
        refreshFromCloud(false, true)
      } else if (e.type === 'cloud_sync') {
        refreshFromCloud(false, true)
      }
    }

    window.addEventListener('storage', handleStorage as EventListener)

    try {
      const bc = new BroadcastChannel('cloud_db_sync')
      bc.onmessage = handleStorage
      return () => {
        bc.close()
        window.removeEventListener('storage', handleStorage as EventListener)
      }
    } catch (e) {
      window.addEventListener('cloud_sync', handleStorage)
      return () => {
        window.removeEventListener('cloud_sync', handleStorage)
        window.removeEventListener('storage', handleStorage as EventListener)
      }
    }
  }, [refreshFromCloud])

  // Short Polling for real-time collaboration across different users/devices
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasUnsavedChangesRef.current && !isSavingRef.current && !isInitializingRef.current) {
        refreshFromCloud(false, true)
      }
    }, 4000) // 4 seconds polling for seamless real-time feel

    return () => clearInterval(interval)
  }, [refreshFromCloud])

  const logAction = useCallback((type: string, description: string, payload: any, actor?: User) => {
    setActivityLog((prev) => {
      const currentUser = actor || userRef.current
      if (!currentUser) return prev
      const entry: ActivityLogEntry = {
        id: crypto.randomUUID(),
        userId: currentUser.name,
        userName: currentUser.name,
        userColor: currentUser.color,
        type,
        description,
        timestamp: new Date().toISOString(),
        payload,
      }
      return [entry, ...prev]
    })
    setHasUnsavedChanges(true)
  }, [])

  const login = useCallback(
    (newUser: User) => {
      setUser(newUser)
      logAction('LOGIN', 'Usuário autenticado no sistema', {}, newUser)
    },
    [logAction],
  )

  const logout = useCallback(() => {
    if (user) {
      logAction('LOGOUT', 'Usuário encerrou a sessão', {}, user)
    }
    setUser(null)
  }, [user, logAction])

  const updateManualConfig = useCallback(
    (key: string, next: ManualSectionConfig) => {
      setManualConfig((prev) => {
        const old = prev[key]
        logAction('CONFIG_CHANGE', `Atualizou link/configuração: ${key}`, {
          prev: old,
          next,
        })
        return { ...prev, [key]: next }
      })
    },
    [logAction, setManualConfig],
  )

  const undoAction = useCallback(
    (id: string) => {
      setActivityLog((prev) => {
        const entry = prev.find((a) => a.id === id)
        if (!entry || entry.reverted) return prev

        if (entry.type === 'DB_EDIT' || entry.type === 'SPECIFIC_DB_EDIT') {
          setData((d) => d.filter((r) => r.id !== entry.payload.next.id))
        } else if (entry.type === 'UPDATE_DATA' || entry.type === 'UPDATE_SPECIFIC_DATA') {
          setData((d) => d.map((r) => (r.id === entry.payload.id ? entry.payload.prev : r)))
        } else if (entry.type === 'UPDATE_OTHER_DATA') {
          setOtherChannelsData((d) => {
            if (!entry.payload.prev) {
              return d.filter((r) => r.id !== entry.payload.next.id)
            }
            return d.map((r) => (r.id === entry.payload.id ? entry.payload.prev : r))
          })
        } else if (entry.type === 'ADD_ANALYSIS') {
          setAnalyses((d) => d.filter((a) => a.id !== entry.payload.id))
        } else if (entry.type === 'DB_DUPLICATE' || entry.type === 'SPECIFIC_DB_DUPLICATE') {
          setData((d) => d.filter((r) => r.id !== entry.payload.newId))
        } else if (
          entry.type === 'DB_BULK_DUPLICATE' ||
          entry.type === 'SPECIFIC_DB_BULK_DUPLICATE'
        ) {
          const newIds = entry.payload.newIds as string[]
          setData((d) => d.filter((r) => !newIds.includes(r.id)))
        } else if (entry.type === 'DB_INSERT') {
          setData((d) => d.filter((r) => r.id !== entry.payload.row.id))
        } else if (entry.type === 'DB_BULK_INSERT' || entry.type === 'DB_BULK_MANUAL') {
          const insertedIds = entry.payload.rows.map((r: any) => r.id)
          setData((d) => d.filter((r) => !insertedIds.includes(r.id)))
        } else if (entry.type === 'CONFIG_CHANGE') {
          setManualConfig((c) => ({
            ...c,
            [entry.payload.next.link
              ? Object.keys(c).find((k) => c[k].link === entry.payload.next.link) || ''
              : '']: entry.payload.prev,
          }))
        } else if (
          entry.type === 'DELETE_DATA' ||
          entry.type === 'DELETE_SPECIFIC_DATA' ||
          entry.type === 'DB_DELETE'
        ) {
          toast({
            title: 'Ação não suportada',
            description: 'Não é possível desfazer exclusões no momento.',
            variant: 'destructive',
          })
          return prev
        }

        const undoLog: ActivityLogEntry = {
          id: crypto.randomUUID(),
          userId: userRef.current?.name || 'Sistema',
          userName: userRef.current?.name || 'Sistema',
          userColor: userRef.current?.color || '#000',
          type: 'UNDO',
          description: `Desfez a ação: ${entry.description}`,
          timestamp: new Date().toISOString(),
          payload: { originalId: entry.id },
        }
        const updated = prev.map((a) => (a.id === id ? { ...a, reverted: true } : a))
        return [undoLog, ...updated]
      })

      setHasUnsavedChanges(true)
    },
    [setData, setOtherChannelsData, setAnalyses, setManualConfig],
  )

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        data,
        setData,
        otherChannelsData,
        setOtherChannelsData,
        filters,
        setFilters,
        specificFilters,
        setSpecificFilters,
        integrations,
        setIntegrations,
        analyses,
        setAnalyses,
        activityLog,
        logAction,
        undoAction,
        manualConfig,
        setManualConfig,
        updateManualConfig,
        tableColumnWidths,
        setTableColumnWidths,
        hasUnsavedChanges,
        isSaving,
        isRefreshing,
        isInitializing,
        commitToCloud,
        refreshFromCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
