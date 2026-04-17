export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(val)
}

export const formatPercent = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(val)
}

export function getDiffColor(diff: number, inverseGood = false) {
  if (Math.abs(diff) < 0.001) return 'text-muted-foreground'
  if (inverseGood) {
    return diff < 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'
  }
  return diff > 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
