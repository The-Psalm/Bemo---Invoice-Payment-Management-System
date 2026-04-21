import { CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PaymentConfirmation() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Successful
        </h1>
        <p className="text-slate-500 mb-6">
          Your payment has been received and confirmed. A receipt has been sent
          to your email address.
        </p>
        <p className="text-xs text-slate-400">
          You can now close this page.
        </p>
      </motion.div>
    </div>
  )
}