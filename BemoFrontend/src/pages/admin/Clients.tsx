import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getClients, createClient, updateClient, deleteClient
} from '../../api/clients'
import { type Client } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../utils/dates'

const emptyForm = {
  name: '', email: '', phone: '', company: '', address: ''
}

export default function Clients() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({})

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => getClients(search).then((r) => r.data),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['clients'] })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateClient(editing.id, form)
        : createClient(form),
    onSuccess: () => {
      toast.success(editing ? 'Client updated.' : 'Client created.')
      invalidate()
      closeModal()
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Something went wrong.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => { toast.success('Client deleted.'); invalidate() },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Cannot delete this client.'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const validate = () => {
    const e: Partial<typeof emptyForm> = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    saveMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {clients?.length ?? 0} client(s)
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}
          onClick={openCreate}>
          New Client
        </Button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : clients?.length === 0 ? (
          <EmptyState
            title="No clients yet"
            description="Add your first client to start creating invoices."
            action={
              <Button variant="primary" size="sm" icon={<Plus size={14} />}
                onClick={openCreate}>
                Add Client
              </Button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Name', 'Email', 'Phone', 'Company', 'Added', 'Actions'].map(
                  (h) => (
                    <th key={h}
                      className="px-6 py-3.5 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {clients?.map((client) => (
                <tr key={client.id}
                  className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {client.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {client.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {client.company || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(client)}
                        className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this client?'))
                            deleteMutation.mutate(client.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Client' : 'New Client'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              placeholder="Jane Doe"
            />
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              placeholder="jane@company.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 801 234 5678"
            />
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company Ltd."
            />
          </div>
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Street, City, State"
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              loading={saveMutation.isPending}
              onClick={handleSave}
              className="flex-1 justify-center"
            >
              {editing ? 'Save Changes' : 'Create Client'}
            </Button>
            <Button variant="secondary" size="md" onClick={closeModal}
              className="flex-1 justify-center">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}