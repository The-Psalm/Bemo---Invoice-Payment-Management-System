import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '../../api/profile'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'

export default function Settings() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  const [form, setForm] = useState({
    business_name: '', email: '', phone: '', address: '',
    website: '', instagram: '', currency: 'NGN',
    invoice_prefix: 'INV', tax_rate: '0', invoice_footer: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        website: profile.website ?? '',
        instagram: profile.instagram ?? '',
        currency: profile.currency ?? 'NGN',
        invoice_prefix: profile.invoice_prefix ?? 'INV',
        tax_rate: String(profile.tax_rate ?? 0),
        invoice_footer: profile.invoice_footer ?? '',
      })
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      return updateProfile(fd)
    },
    onSuccess: () => toast.success('Settings saved.'),
    onError: () => toast.error('Failed to save settings.'),
  })

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  if (isLoading)
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-medium text-[var(--text-primary)] font-['Lora'] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Business profile and invoice defaults
        </p>
      </div>

      {[
        {
          title: 'Business Info',
          fields: [
            { label: 'Business Name', key: 'business_name' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone' },
            { label: 'Address', key: 'address' },
            { label: 'Website', key: 'website', type: 'url' },
            { label: 'Instagram Handle', key: 'instagram' },
          ],
        },
        {
          title: 'Invoice Defaults',
          fields: [
            { label: 'Currency', key: 'currency' },
            { label: 'Invoice Prefix (e.g. INV, CDA)', key: 'invoice_prefix' },
            { label: 'Default Tax Rate (%)', key: 'tax_rate', type: 'number' },
            { label: 'Invoice Footer Text', key: 'invoice_footer' },
          ],
        },
      ].map((section) => (
        <div
          key={section.title}
          className="bg-[var(--bg-surface)] border border-[var(--border-base)] shadow-[var(--shadow-sm)] rounded-[var(--radius-lg)] p-6"
        >
          <h2 className="text-lg font-medium text-[var(--text-primary)] mb-5 font-['Lora'] tracking-tight">
            {section.title}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {section.fields.map(({ label, key, type }) => (
              <Input
                key={key}
                label={label}
                type={type ?? 'text'}
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key, e.target.value)}
                className={key === 'invoice_footer' || key === 'address' ? 'col-span-2' : ''}
              />
            ))}
          </div>
        </div>
      ))}

      <Button
        variant="primary"
        size="md"
        icon={<Save size={14} />}
        loading={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Save Settings
      </Button>
    </div>
  )
}