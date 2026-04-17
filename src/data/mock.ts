import { addDays, subDays, format } from 'date-fns'
import { CampaignRow, OtherChannelRow, Integration, Analysis } from '../types'
import { PLATFORMS, OTHER_CHANNELS } from '../lib/constants'

export const mockIntegrations: Integration[] = [
  { id: 'i1', name: 'Google Ads API', status: 'Ativo', lastSync: 'Há 10 minutos', type: 'google' },
  {
    id: 'i2',
    name: 'Meta Marketing API',
    status: 'Não Conectado',
    lastSync: '-',
    type: 'meta',
  },
  { id: 'i3', name: 'RD Station CRM', status: 'Ativo', lastSync: 'Há 5 minutos', type: 'rd' },
  {
    id: 'i4',
    name: 'Planilha de Vendas',
    status: 'Inativo',
    lastSync: 'Há 2 dias',
    type: 'sheets',
  },
]

export const mockAnalyses: Analysis[] = [
  {
    id: 'a1',
    dateRangeStr: '01/10/2023 - 07/10/2023',
    improved:
      'Aumento na taxa de conversão das campanhas de Search após ajuste de palavras-chave negativas.',
    worsened: 'Custo por lead subiu no Instagram devido ao aumento de CPM na plataforma.',
    decisions:
      'Pausar anúncios de vídeo de baixa performance no Meta e realocar orçamento para Google Search.',
    improvedFiles: [],
    worsenedFiles: [],
    decisionsFiles: [],
    platforms: ['Google', 'Facebook'],
    pdfUrl: '#',
    excelUrl: '#',
    author: { name: 'João Silva', color: '#10b981' },
  },
]

export const generateMockData = (): CampaignRow[] => {
  const data: CampaignRow[] = []
  const today = new Date()

  const campaigns = [
    { name: 'Black Friday', desc: 'Promoção agressiva de novembro.' },
    { name: 'Lançamento Produto A', desc: 'Foco na nova linha de produtos 2024.' },
    { name: 'Sempre Ativa', desc: 'Campanha institucional rodando o ano todo.' },
  ]
  const audiences = ['Lookalike 1%', 'Remarketing 30d', 'Interesses Amplos']

  let idCounter = 1

  // Generate around 500 rows for realistic mock data across 60 days
  for (let i = 0; i < 60; i++) {
    const d = subDays(today, i)
    const startDateStr = format(d, 'yyyy-MM-dd')
    const endDateStr = format(addDays(d, 7), 'yyyy-MM-dd')

    // Generate 6 random entries per day to cover different platforms
    for (let j = 0; j < 6; j++) {
      const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)]
      const audience = audiences[Math.floor(Math.random() * audiences.length)]

      data.push({
        id: String(idCounter++),
        date: startDateStr,
        startDate: startDateStr,
        endDate: endDateStr,
        platform,
        campaign: campaign.name,
        description: campaign.desc,
        audience,
        impressions: Math.floor(Math.random() * 5000) + 1000,
        reach: Math.floor(Math.random() * 4000) + 800,
        clicksAds: Math.floor(Math.random() * 200) + 50,
        clicksRD: Math.floor(Math.random() * 180) + 40,
        pastClicksRD: Math.floor(Math.random() * 150) + 30,
        leadsSalesSheet: Math.floor(Math.random() * 20) + 5,
        leadsRD: Math.floor(Math.random() * 25) + 5,
        quoteQty: Math.floor(Math.random() * 10) + 2,
        quoteValue: Math.floor(Math.random() * 5000) + 1000,
        orderQty: Math.floor(Math.random() * 5) + 1,
        orderValue: Math.floor(Math.random() * 3000) + 500,
        cost: Math.floor(Math.random() * 2000) + 100, // Added mock cost data
        version: 1,
        createdAt: new Date().toISOString(),
      })
    }
  }
  return data
}

export const generateOtherChannelsMockData = (): OtherChannelRow[] => {
  const data: OtherChannelRow[] = []
  const today = new Date()
  let idCounter = 1

  for (let i = 0; i < 60; i++) {
    const d = subDays(today, i)
    const dateStr = format(d, 'yyyy-MM-dd')

    OTHER_CHANNELS.forEach((channel) => {
      data.push({
        id: `oc_${idCounter++}`,
        date: dateStr,
        channel,
        userName: 'Sistema',
        userColor: '#94a3b8',
        leads: Math.floor(Math.random() * 20),
        quotesQty: Math.floor(Math.random() * 10),
        quotesValue: Math.floor(Math.random() * 5000),
        ordersQty: Math.floor(Math.random() * 5),
        ordersValue: Math.floor(Math.random() * 3000),
        clicks:
          channel === 'Assistente virtual - Gabi' ? Math.floor(Math.random() * 100) : undefined,
        conversations:
          channel === 'Assistente virtual - Gabi' ? Math.floor(Math.random() * 50) : undefined,
        accesses:
          channel === 'Assistente virtual - Gabi' || channel === 'Acessos ao site'
            ? Math.floor(Math.random() * 500)
            : undefined,
      })
    })
  }
  return data
}

export const mockData = generateMockData()
export const mockOtherChannelsData = generateOtherChannelsMockData()
