import { useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Paperclip, X, Image as ImageIcon, FileText, FileSpreadsheet } from 'lucide-react'
import { FileAttachment } from '@/types'
import { formatBytes } from '@/lib/formatters'

interface AnalysisFieldProps {
  label: string
  description: string
  value: string
  onChange: (val: string) => void
  files: FileAttachment[]
  onFilesChange: (files: FileAttachment[]) => void
  colorClass: string
  dotColorClass: string
  placeholder?: string
}

export function AnalysisField({
  label,
  description,
  value,
  onChange,
  files,
  onFilesChange,
  colorClass,
  dotColorClass,
  placeholder,
}: AnalysisFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    const newAttachments: FileAttachment[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Mock URL for preview
    }))

    onFilesChange([...files, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-4 h-4 text-blue-500" />
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv'))
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
    return <FileText className="w-4 h-4 text-red-500" />
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${colorClass}`}>
          <span className={`w-2 h-2 rounded-full block ${dotColorClass}`}></span> {label}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={placeholder}
          className="min-h-[120px] bg-slate-50 border-slate-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
            <span className="text-sm text-slate-500">
              Anexe fotos, PDFs ou planilhas como evidência.
            </span>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-4 h-4 mr-2" /> Anexar Arquivo
            </Button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 border rounded-md bg-white shadow-sm group"
                >
                  <div className="bg-slate-100 p-2 rounded-md">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
