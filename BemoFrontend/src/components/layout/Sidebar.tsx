import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, FileText, Users,
  BarChart3, Settings, LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/invoices', label: 'Invoices', icon: FileText },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

const bottom = [
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export const Sidebar = () => {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)]',
      'text-sm transition-all duration-150 group',
      isActive
        ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-medium'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
    )

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-[var(--bg-raised)] border-r border-[var(--border-subtle)]">
      {/* Wordmark */}
      <div className="h-14 flex items-center px-5 border-b border-[var(--border-subtle)]">
        <span className="font-['Instrument_Serif'] text-xl text-[var(--text-primary)] italic">
          Bemo
        </span>
        <span className="ml-2 text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-subtle)] border border-[var(--border-base)] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          Beta
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="mb-3">
          <p className="px-3 mb-1.5 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
            Main
          </p>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>

        <div>
          <p className="px-3 mb-1.5 mt-4 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
            Account
          </p>
          {bottom.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] mb-1">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[10px] font-semibold text-[var(--accent-text)] flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">
              {user?.full_name}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] truncate leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 h-8 rounded-[var(--radius-sm)] text-xs text-[var(--text-tertiary)] hover:text-[var(--red)] hover:bg-[var(--red-subtle)] transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}