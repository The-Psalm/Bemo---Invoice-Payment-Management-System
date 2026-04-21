import { create } from 'zustand'
import type { InvoiceItem } from '../types'

interface InvoiceFormItem extends Omit<InvoiceItem, 'id'> {}

interface InvoiceFormState {
  clientId: number | null
  issueDate: string
  dueDate: string
  taxRate: number
  notes: string
  items: InvoiceFormItem[]

  setField: (field: string, value: string | number) => void
  setClientId: (id: number) => void
  addItem: () => void
  removeItem: (index: number) => void
  updateItem: (index: number, field: string, value: string | number) => void
  reset: () => void

  // Computed
  subtotal: () => number
  taxAmount: () => number
  total: () => number
}

const defaultItem: InvoiceFormItem = {
  description: '',
  quantity: 1,
  unit_price: 0,
  amount: 0,
}

export const useInvoiceFormStore = create<InvoiceFormState>()((set, get) => ({
  clientId: null,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  taxRate: 0,
  notes: '',
  items: [{ ...defaultItem }],

  setField: (field, value) => set({ [field]: value }),
  setClientId: (id) => set({ clientId: id }),

  addItem: () =>
    set((state) => ({ items: [...state.items, { ...defaultItem }] })),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  updateItem: (index, field, value) =>
    set((state) => {
      const items = [...state.items]
      items[index] = { ...items[index], [field]: value }
      if (field === 'quantity' || field === 'unit_price') {
        items[index].amount =
          Number(items[index].quantity) * Number(items[index].unit_price)
      }
      return { items }
    }),

  reset: () =>
    set({
      clientId: null,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      taxRate: 0,
      notes: '',
      items: [{ ...defaultItem }],
    }),

  subtotal: () => get().items.reduce((sum, item) => sum + item.amount, 0),
  taxAmount: () => {
    const s = get()
    return s.subtotal() * (s.taxRate / 100)
  },
  total: () => {
    const s = get()
    return s.subtotal() + s.taxAmount()
  },
}))