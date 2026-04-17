import { useDatabase } from '@/hooks/useDatabase'
import { DatabaseHeader } from '@/components/database/DatabaseHeader'
import { DatabaseTable } from '@/components/database/DatabaseTable'
import { DatabaseModals } from '@/components/database/DatabaseModals'

export default function Database() {
  const dbState = useDatabase()

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-fade-in-up pb-12">
      <DatabaseHeader state={dbState} />
      <DatabaseTable state={dbState} />
      <DatabaseModals state={dbState} />
    </div>
  )
}
