import { format, getISOWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const exportToExcel = (date: Date, mergedData: any[], mergedOtherData: any[]) => {
  const mes = format(date, 'MMMM', { locale: ptBR }).toLowerCase()
  const numero = getISOWeek(date)
  const filename = `comparativo_semanal_${mes}_semana_${numero}.xlsx`

  const BOM = '\uFEFF'
  let csv = BOM

  csv += `Comparativo Semanal - ${mes.toUpperCase()} / Semana ${numero}\n\n`

  csv += 'CAMPANHAS\n'
  csv +=
    'Plataforma;Campanha;Público;Leads;Orçamentos (Qtd);Orçamentos (R$);Pedidos (Qtd);Pedidos (R$);% Lead -> Orç.;% Orç. -> Pedido\n'

  mergedData.forEach((row) => {
    const leadToQuote = row.leadsRD > 0 ? row.quoteQty / row.leadsRD : 0
    const quoteToOrder = row.quoteQty > 0 ? row.orderQty / row.quoteQty : 0
    csv += `${row.platform};${row.campaign};${row.audience};${row.leadsRD};${row.quoteQty};${row.quoteValue.toFixed(2).replace('.', ',')};${row.orderQty};${row.orderValue.toFixed(2).replace('.', ',')};${(leadToQuote * 100).toFixed(2).replace('.', ',')}%;${(quoteToOrder * 100).toFixed(2).replace('.', ',')}%\n`
  })

  csv += '\nOUTROS CANAIS\n'
  csv +=
    'Canal;Acessos;Cliques;Conversas;Leads;Orçamentos (Qtd);Orçamentos (R$);Pedidos (Qtd);Pedidos (R$);% Lead -> Orç.;% Orç. -> Pedido\n'

  mergedOtherData.forEach((row) => {
    const isGabi = row.channel === 'Assistente virtual - Gabi'
    const isAcesso = row.channel === 'Acessos ao site'
    const leadToQuote = row.leads > 0 ? row.quotesQty / row.leads : 0
    const quoteToOrder = row.quotesQty > 0 ? row.ordersQty / row.quotesQty : 0

    csv += `${row.channel};${isGabi || isAcesso ? row.accesses || 0 : '-'};${isGabi ? row.clicks || 0 : '-'};${isGabi ? row.conversations || 0 : '-'};${row.leads};${row.quotesQty};${row.quotesValue.toFixed(2).replace('.', ',')};${row.ordersQty};${row.ordersValue.toFixed(2).replace('.', ',')};${(leadToQuote * 100).toFixed(2).replace('.', ',')}%;${(quoteToOrder * 100).toFixed(2).replace('.', ',')}%\n`
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const exportToPDF = (date: Date) => {
  const mes = format(date, 'MMMM', { locale: ptBR }).toLowerCase()
  const numero = getISOWeek(date)
  const originalTitle = document.title
  document.title = `comparativo_semanal_${mes}_semana_${numero}`
  window.print()
  document.title = originalTitle
}
