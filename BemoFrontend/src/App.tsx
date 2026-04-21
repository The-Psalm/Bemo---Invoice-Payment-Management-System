import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AdminLayout } from './components/layout/AdminLayout'

// Pages
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Invoices from './pages/admin/Invoices'
import CreateInvoice from './pages/admin/CreateInvoice'
import InvoiceDetail from './pages/admin/InvoiceDetail'
import Clients from './pages/admin/Clients'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import PublicInvoice from './pages/public/PublicInvoice'
import PaymentConfirmation from './pages/public/PaymentConfirmation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/invoice/:token" element={<PublicInvoice />} />
          <Route path="/payment/success" element={<PaymentConfirmation />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminLayout><Dashboard /></AdminLayout>
          } />
          <Route path="/admin/invoices" element={
            <AdminLayout><Invoices /></AdminLayout>
          } />
          <Route path="/admin/invoices/new" element={
            <AdminLayout><CreateInvoice /></AdminLayout>
          } />
          <Route path="/admin/invoices/:id" element={
            <AdminLayout><InvoiceDetail /></AdminLayout>
          } />
          <Route path="/admin/clients" element={
            <AdminLayout><Clients /></AdminLayout>
          } />
          <Route path="/admin/reports" element={
            <AdminLayout><Reports /></AdminLayout>
          } />
          <Route path="/admin/settings" element={
            <AdminLayout><Settings /></AdminLayout>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>

 <Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-base)',
      borderRadius: 'var(--radius-md)',
      fontFamily: "'Geist', sans-serif",
      fontSize: '13px',
      boxShadow: 'var(--shadow-lg)',
      padding: '10px 14px',
    },
    success: {
      iconTheme: { primary: 'var(--green)', secondary: 'var(--green-subtle)' },
    },
    error: {
      iconTheme: { primary: 'var(--red)', secondary: 'var(--red-subtle)' },
    },
    duration: 3000,
  }}
/>
    </QueryClientProvider>
  )
}