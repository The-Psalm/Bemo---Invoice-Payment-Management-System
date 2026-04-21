import jsPDF from 'jspdf'
import type { Invoice } from '../types'

const FOREST_GREEN: [number, number, number] = [22, 78, 46]
const CHARCOAL:     [number, number, number] = [42, 39, 35]
const MUTED:        [number, number, number] = [87, 82, 73]
const LIGHT_MUTED:  [number, number, number] = [138, 132, 119]

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(Number(amount))

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const setColor = (
  doc: jsPDF,
  type: 'text' | 'fill' | 'draw',
  color: [number, number, number]
) => {
  if (type === 'text') doc.setTextColor(color[0], color[1], color[2])
  else if (type === 'fill') doc.setFillColor(color[0], color[1], color[2])
  else doc.setDrawColor(color[0], color[1], color[2])
}

export const downloadInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  
  // Use a very generous margin for elegance
  const M = 24 
  let y = M + 10

  // ── Top Header (BEMO vs INVOICE) ──────────────────────────────────────────
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  setColor(doc, 'text', CHARCOAL)
  doc.text('Bemo.', M, y)

  doc.setFont('times', 'normal')
  doc.setFontSize(24)
  doc.text('INVOICE', W - M, y, { align: 'right' })
  
  y += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  setColor(doc, 'text', MUTED)
  doc.text(invoice.invoice_number, W - M, y, { align: 'right' })

  y += 24

  // ── Meta Info Grid (Bill To, Issued, Due) ─────────────────────────────────
  const metaY = y

  // Bill To
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, 'text', LIGHT_MUTED)
  doc.text('BILL TO', M, metaY)

  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  setColor(doc, 'text', CHARCOAL)
  doc.text(invoice.client.display_name, M, metaY + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setColor(doc, 'text', MUTED)
  let currentY = metaY + 14
  if (invoice.client.email) {
    doc.text(invoice.client.email, M, currentY)
    currentY += 5
  }
  if (invoice.client.phone) {
    doc.text(invoice.client.phone, M, currentY)
    currentY += 5
  }
  if (invoice.client.address) {
    doc.text(invoice.client.address, M, currentY)
    currentY += 5
  }

  // Dates
  const datesX = W - M - 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, 'text', LIGHT_MUTED)
  doc.text('ISSUED', datesX, metaY)
  
  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  setColor(doc, 'text', CHARCOAL)
  doc.text(formatDate(invoice.issue_date), datesX, metaY + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, 'text', LIGHT_MUTED)
  doc.text('DUE', datesX, metaY + 16)

  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  setColor(doc, 'text', CHARCOAL)
  doc.text(formatDate(invoice.due_date), datesX, metaY + 22)

  y = Math.max(currentY, metaY + 30) + 16

  // ── Items Table ──────────────────────────────────────────────────────────
  const colX = { desc: M, qty: W / 2 + 10, price: W / 2 + 40, amount: W - M }

  // Top thick line
  setColor(doc, 'draw', CHARCOAL)
  doc.setLineWidth(0.6)
  doc.line(M, y, W - M, y)
  
  y += 7

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, 'text', LIGHT_MUTED)
  doc.text('DESCRIPTION',       colX.desc,        y)
  doc.text('QTY',               colX.qty,         y, { align: 'center' })
  doc.text('UNIT PRICE',        colX.price,       y, { align: 'center' })
  doc.text('AMOUNT',            colX.amount,      y, { align: 'right' })

  y += 4

  // Bottom thin line for header
  setColor(doc, 'draw', CHARCOAL)
  doc.setLineWidth(0.1)
  doc.line(M, y, W - M, y)

  y += 10

  // Table rows
  invoice.items.forEach((item) => {
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    setColor(doc, 'text', CHARCOAL)
    doc.text(item.description,                    colX.desc,        y)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setColor(doc, 'text', MUTED)
    doc.text(String(item.quantity),               colX.qty,         y, { align: 'center' })
    doc.text(formatCurrency(item.unit_price),     colX.price,       y, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    setColor(doc, 'text', CHARCOAL)
    doc.text(formatCurrency(item.amount),         colX.amount,      y, { align: 'right' })

    y += 10
  })

  y += 6

  // ── Totals ───────────────────────────────────────────────────────────────
  // Strong line before totals
  setColor(doc, 'draw', CHARCOAL)
  doc.setLineWidth(0.6)
  doc.line(M, y, W - M, y)
  
  y += 10

  const totalsX  = W - M
  const labelsX  = W - M - 40

  const addRow = (label: string, value: string, isTotal = false) => {
    if (isTotal) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      setColor(doc, 'text', CHARCOAL)
      doc.text(label.toUpperCase(), labelsX, y)
      
      doc.setFont('times', 'bold')
      doc.setFontSize(16)
      setColor(doc, 'text', CHARCOAL)
      doc.text(value, totalsX, y + 1, { align: 'right' })
      y += 12
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      setColor(doc, 'text', LIGHT_MUTED)
      doc.text(label.toUpperCase(), labelsX, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      setColor(doc, 'text', MUTED)
      doc.text(value, totalsX, y, { align: 'right' })
      y += 8
    }
  }

  addRow('Subtotal', formatCurrency(invoice.subtotal))
  addRow(`Tax (${invoice.tax_rate}%)`, formatCurrency(invoice.tax_amount))
  
  y += 4
  addRow('Total', formatCurrency(invoice.total), true)

  // Paid stamp
  if (invoice.status === 'paid' && invoice.paid_at) {
    y += 8
    doc.setFont('times', 'italic')
    doc.setFontSize(12)
    setColor(doc, 'text', FOREST_GREEN)
    doc.text(`*** Paid in Full on ${formatDate(invoice.paid_at)} ***`, totalsX, y, { align: 'right' })
    y += 10
  }

  // ── Notes ────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    y += 12
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    setColor(doc, 'text', LIGHT_MUTED)
    doc.text('NOTES', M, y)
    y += 6

    doc.setFont('times', 'italic')
    doc.setFontSize(10)
    setColor(doc, 'text', MUTED)
    const lines = doc.splitTextToSize(invoice.notes, W - M * 2) as string[]
    doc.text(lines, M, y)
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  setColor(doc, 'text', LIGHT_MUTED)
  doc.text('GENERATED BY BEMO', M, H - M)

  doc.save(`${invoice.invoice_number}.pdf`)
}