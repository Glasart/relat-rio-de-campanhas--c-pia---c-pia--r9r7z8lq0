import { useLocation, Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAppContext } from '@/context/AppContext'

const routeMap: Record<string, string> = {
  '/': 'Comparativo Semanal',
  '/specific-days': 'Comparativo Curto Prazo',
  '/database': 'Base de Dados',
  '/integrations': 'Integrações',
  '/analysis': 'Análise Semanal',
  '/consolidated': 'Dados Consolidados',
  '/predictability': 'Previsibilidade',
  '/history': 'Histórico de Relatórios',
  '/activity-log': 'Log de Atividades',
  '/manual': 'Manual do Usuário',
}

export function Header() {
  const location = useLocation()
  const { user } = useAppContext()
  const pageName = routeMap[location.pathname] || 'Dashboard'

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-[#0F172A] text-white px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <SidebarTrigger className="text-white hover:bg-white/10 hover:text-white" />
      <div className="w-px h-4 bg-white/20 mx-2" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#" className="text-white/70 hover:text-white">
              Workspace
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block text-white/50" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white font-medium">{pageName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Link
        to="/activity-log"
        className="ml-auto flex items-center gap-4 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer group"
      >
        <div className="hidden sm:flex flex-col text-right group-hover:text-white/90">
          <span className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</span>
          <span className="text-xs text-white/60 group-hover:text-white/80">Analista</span>
        </div>
        <Avatar
          className="h-8 w-8 border border-white/20"
          style={{ backgroundColor: user?.color || '#3b82f6' }}
        >
          <AvatarFallback className="text-white bg-transparent font-medium">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  )
}
