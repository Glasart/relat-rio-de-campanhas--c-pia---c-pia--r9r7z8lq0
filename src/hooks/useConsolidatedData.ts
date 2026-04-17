import { useMemo } from 'react'
import { CampaignRow, OtherChannelRow } from '@/types'
import { parseISO, isSameMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PLATFORMS, OTHER_CHANNELS } from '@/lib/constants'

const calcDiffPct = (curr: number, past: number) => {
  if (past > 0) return ((curr - past) / past) * 100
  if (curr > 0) return 100
  return 0
}

export function useConsolidatedData(data: CampaignRow[], otherData: OtherChannelRow[]) {
  return useMemo(() => {
    const today = new Date()

    const currentMonthData = data.filter((d) => isSameMonth(parseISO(d.date || d.startDate), today))
    const lastMonth = subMonths(today, 1)
    const lastMonthData = data.filter((d) =>
      isSameMonth(parseISO(d.date || d.startDate), lastMonth),
    )

    const currentOtherData = otherData.filter((d) => isSameMonth(parseISO(d.date), today))
    const lastOtherData = otherData.filter((d) => isSameMonth(parseISO(d.date), lastMonth))

    const processPlatform = (platformName: string, dataset: typeof data) => {
      const rows = dataset.filter((d) => d.platform === platformName)
      const imp = rows.reduce((s, d) => s + d.impressions, 0)
      const reach = rows.reduce((s, d) => s + d.reach, 0)
      const clicks = rows.reduce((s, d) => s + d.clicksAds, 0)
      const budget = rows.reduce((s, d) => s + (d.quoteValue || d.cost || 0), 0)
      const leads = rows.reduce((s, d) => s + d.leadsRD, 0)
      const orders = rows.reduce((s, d) => s + d.orderQty, 0)

      return { imp, reach, clicks, budget, leads, orders }
    }

    const processOther = (channelName: string, dataset: typeof otherData) => {
      const rows = dataset.filter((d) => d.channel === channelName)
      const leads = rows.reduce((s, d) => s + d.leads, 0)
      const budget = rows.reduce((s, d) => s + d.quotesValue, 0)
      const orders = rows.reduce((s, d) => s + d.ordersQty, 0)
      const clicks = rows.reduce((s, d) => s + (d.clicks || 0), 0)

      return { imp: 0, reach: 0, clicks, budget, leads, orders }
    }

    const allPlatformsInOrder = new Set<string>()
    data.forEach((d) => allPlatformsInOrder.add(d.platform))
    PLATFORMS.forEach((p) => allPlatformsInOrder.add(p))

    const allChannelsInOrder = new Set<string>()
    otherData.forEach((d) => allChannelsInOrder.add(d.channel))
    OTHER_CHANNELS.forEach((c) => allChannelsInOrder.add(c))

    const tableDataCamp = Array.from(allPlatformsInOrder).map((p) => {
      const curr = processPlatform(p, currentMonthData)
      const past = processPlatform(p, lastMonthData)

      return {
        source: p,
        imp: curr.imp,
        impDiff: calcDiffPct(curr.imp, past.imp),
        impAbs: curr.imp - past.imp,
        reach: curr.reach,
        reachDiff: calcDiffPct(curr.reach, past.reach),
        reachAbs: curr.reach - past.reach,
        clicks: curr.clicks,
        clicksDiff: calcDiffPct(curr.clicks, past.clicks),
        clicksAbs: curr.clicks - past.clicks,
        budget: curr.budget,
        budgetDiff: calcDiffPct(curr.budget, past.budget),
        budgetAbs: curr.budget - past.budget,
        leads: curr.leads,
        leadsDiff: calcDiffPct(curr.leads, past.leads),
        leadsAbs: curr.leads - past.leads,
        orders: curr.orders,
        ordersDiff: calcDiffPct(curr.orders, past.orders),
        ordersAbs: curr.orders - past.orders,
        ctr: curr.imp > 0 ? curr.clicks / curr.imp : 0,
        cvl: curr.clicks > 0 ? curr.leads / curr.clicks : 0,
      }
    })

    const tableDataOther = Array.from(allChannelsInOrder).map((p) => {
      const curr = processOther(p, currentOtherData)
      const past = processOther(p, lastOtherData)

      return {
        source: p,
        imp: curr.imp,
        impDiff: calcDiffPct(curr.imp, past.imp),
        impAbs: curr.imp - past.imp,
        reach: curr.reach,
        reachDiff: calcDiffPct(curr.reach, past.reach),
        reachAbs: curr.reach - past.reach,
        clicks: curr.clicks,
        clicksDiff: calcDiffPct(curr.clicks, past.clicks),
        clicksAbs: curr.clicks - past.clicks,
        budget: curr.budget,
        budgetDiff: calcDiffPct(curr.budget, past.budget),
        budgetAbs: curr.budget - past.budget,
        leads: curr.leads,
        leadsDiff: calcDiffPct(curr.leads, past.leads),
        leadsAbs: curr.leads - past.leads,
        orders: curr.orders,
        ordersDiff: calcDiffPct(curr.orders, past.orders),
        ordersAbs: curr.orders - past.orders,
        ctr: curr.imp > 0 ? curr.clicks / curr.imp : 0,
        cvl: curr.clicks > 0 ? curr.leads / curr.clicks : 0,
      }
    })

    const tableData = [...tableDataCamp, ...tableDataOther].filter(
      (t) => t.imp > 0 || t.budget > 0 || t.leads > 0,
    )

    const totals = tableData.reduce(
      (acc, t) => {
        acc.reach += t.reach
        acc.imp += t.imp
        acc.clicks += t.clicks
        acc.leads += t.leads
        acc.budget += t.budget
        acc.orders += t.orders
        return acc
      },
      { reach: 0, imp: 0, clicks: 0, leads: 0, budget: 0, orders: 0 },
    )

    const funnelData = [
      { name: 'Alcance', value: totals.reach, fill: '#8b5cf6' },
      { name: 'Impressões', value: totals.imp, fill: '#3b82f6' },
      { name: 'Cliques', value: totals.clicks, fill: '#0ea5e9' },
      { name: 'Leads', value: totals.leads, fill: '#10b981' },
      { name: 'Orçamento', value: totals.budget, fill: '#f59e0b' },
      { name: 'Pedidos', value: totals.orders, fill: '#ef4444' },
    ].filter((d) => d.value > 0)

    const months = Array.from({ length: 6 }).map((_, i) => subMonths(today, 5 - i))
    const semesterData = months.map((m) => {
      const monthData = data.filter((d) => isSameMonth(parseISO(d.date || d.startDate), m))
      const otherMonthOther = otherData.filter((d) => isSameMonth(parseISO(d.date), m))

      const getMetrics = (pd: typeof data) => {
        const imp = pd.reduce((s, d) => s + d.impressions, 0)
        const clicks = pd.reduce((s, d) => s + d.clicksAds, 0)
        const leads = pd.reduce((s, d) => s + d.leadsRD, 0)
        const budget = pd.reduce((s, d) => s + (d.quoteValue || d.cost || 0), 0)
        const orders = pd.reduce((s, d) => s + d.orderQty, 0)

        return {
          imp,
          clicks,
          leads,
          budget,
          orders,
          ctr: imp > 0 ? (clicks / imp) * 100 : 0,
          cvl: clicks > 0 ? (leads / clicks) * 100 : 0,
          cpo: orders > 0 ? budget / orders : 0,
        }
      }

      const metaData = monthData.filter(
        (d) =>
          d.platform.toLowerCase().includes('facebook') ||
          d.platform.toLowerCase().includes('instagram'),
      )
      const googleData = monthData.filter((d) => d.platform.toLowerCase().includes('google'))
      const otherDataCamp = monthData.filter(
        (d) =>
          !d.platform.toLowerCase().includes('facebook') &&
          !d.platform.toLowerCase().includes('instagram') &&
          !d.platform.toLowerCase().includes('google'),
      )

      const meta = getMetrics(metaData)
      const google = getMetrics(googleData)
      const otherCamp = getMetrics(otherDataCamp)

      const combinedOtherImp = otherCamp.imp
      const combinedOtherClicks =
        otherCamp.clicks + otherMonthOther.reduce((s, d) => s + (d.clicks || 0), 0)
      const combinedOtherLeads = otherCamp.leads + otherMonthOther.reduce((s, d) => s + d.leads, 0)
      const combinedOtherBudget =
        otherCamp.budget + otherMonthOther.reduce((s, d) => s + d.quotesValue, 0)
      const combinedOtherOrders =
        otherCamp.orders + otherMonthOther.reduce((s, d) => s + d.ordersQty, 0)

      const otherCTR = combinedOtherImp > 0 ? (combinedOtherClicks / combinedOtherImp) * 100 : 0
      const otherCVL =
        combinedOtherClicks > 0 ? (combinedOtherLeads / combinedOtherClicks) * 100 : 0
      const otherCPO = combinedOtherOrders > 0 ? combinedOtherBudget / combinedOtherOrders : 0

      return {
        month: format(m, 'MMM/yy', { locale: ptBR }),
        metaCTR: meta.ctr,
        googleCTR: google.ctr,
        otherCTR: otherCTR,
        metaCVL: meta.cvl,
        googleCVL: google.cvl,
        otherCVL: otherCVL,
        metaCPO: meta.cpo,
        googleCPO: google.cpo,
        otherCPO: otherCPO,
      }
    })

    return { tableData, funnelData, semesterData }
  }, [data, otherData])
}
