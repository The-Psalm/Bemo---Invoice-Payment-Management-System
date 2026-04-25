import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function Login() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.login)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email)    e.email    = 'Email is required.'
    if (!password) e.password = 'Password is required.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await login(email, password)
      setAuth(data.access, data.refresh, data.user)
      navigate('/admin')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col justify-between bg-[var(--accent)] p-16">
        <div>
          <span className="font-['Sora'] text-3xl font-semibold text-white tracking-tight">
            Bemo
          </span>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-white text-5xl font-['Sora'] leading-tight font-semibold tracking-tight">
            Manage invoices with calm, focused clarity.
          </h2>
          <p className="text-white/70 text-lg">
            A minimalist workspace built for modern finance teams.
          </p>
        </div>

        <p className="text-white/40 text-xs uppercase tracking-widest">
          © 2025 Bemo. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-md)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-['Sora'] font-semibold text-[var(--text-primary)] tracking-tight">
              Welcome back
            </h1>
            <p className="text-base text-[var(--text-secondary)] mt-2">
              Sign in to your Bemo dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoFocus
            />
            <Input
              label="Password"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              suffix={
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}