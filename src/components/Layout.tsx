import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useAppContext } from '@/context/AppContext'
import Login from '@/pages/Login'
import { RefreshCw, CloudUpload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, refreshFromCloud, hasUnsavedChanges, isSaving, isRefreshing, isInitializing } =
    useAppContext()

  if (!user) {
    return <Login />
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800">Conectando ao Banco Central</h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Sincronizando dados globais em tempo real...
          </p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white px-4 md:px-6 shrink-0 shadow-sm z-10 sticky top-0 justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-slate-500 hover:text-slate-800" />
            <div
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm"
              title="Você está conectado à nuvem. Alterações são visíveis para toda a equipe instantaneamente."
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Sync
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaving ? (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <RefreshCw className="w-3.5 h-3.5" /> Sincronizando
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CloudUpload className="w-3.5 h-3.5" /> Atualizado
              </div>
            )}
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshFromCloud(true)}
              disabled={isRefreshing}
              className="hidden sm:flex gap-2 h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm transition-colors"
              title="Forçar atualização da base de dados e baixar as últimas informações na nuvem"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              <span>Sincronizar Manual</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
