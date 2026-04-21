import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  back?: boolean
  actions?: ReactNode
}

export const PageHeader = ({ title, description, back, actions }: PageHeaderProps) => {
  const navigate = useNavigate()
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-1.5 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-['Instrument_Serif'] text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}