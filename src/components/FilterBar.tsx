import { useAppContext } from '@/context/AppContext'
import { DatePickerWithRange } from '@/components/DatePickerWithRange'

export function FilterBar() {
  const { filters, setFilters } = useAppContext()

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6">
      <DatePickerWithRange
        date={filters.dateRange}
        setDate={(date) => setFilters((prev) => ({ ...prev, dateRange: date }))}
        className="w-full sm:w-auto"
      />
    </div>
  )
}
