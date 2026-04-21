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

  const handleSubmit = async () => {
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
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between bg-[var(--text-primary)] p-12">
        <div>
          <span className="font-['Instrument_Serif'] text-2xl text-white italic">Bemo</span>
        </div>
        <div>
          <blockquote className="text-white/70 text-base leading-relaxed font-['Instrument_Serif'] italic">
            "The best invoice tool I've used. Clean, fast, and my clients actually pay on time now."
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <div>
              <p className="text-white text-sm font-medium">Amaka O.</p>
              <p className="text-white/50 text-xs">Creative Director, FashionHQ</p>
            </div>
          </div>
        </div>
        <p className="text-white/30 text-xs">© 2025 Bemo. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-['Instrument_Serif'] text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Sign in to your Bemo dashboard
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <Input
              label="Password"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleSubmit}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}