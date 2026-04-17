import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/context/AppContext'
import Layout from './components/Layout'
import Index from './pages/Index'
import SpecificDays from './pages/SpecificDays'
import Database from './pages/Database'
import Integrations from './pages/Integrations'
import Analysis from './pages/Analysis'
import Consolidated from './pages/Consolidated'
import Predictability from './pages/Predictability'
import History from './pages/History'
import ActivityLog from './pages/ActivityLog'
import UserManual from './pages/UserManual'
import NotFound from './pages/NotFound'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/specific-days" element={<SpecificDays />} />
            <Route path="/consolidated" element={<Consolidated />} />
            <Route path="/predictability" element={<Predictability />} />
            <Route path="/database" element={<Database />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/manual" element={<UserManual />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
