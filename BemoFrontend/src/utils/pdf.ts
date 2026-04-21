import jsPDF from 'jspdf'
import type { Invoice } from '../types'

const AMBER:     [number, number, number] = [245, 158, 11]
const SLATE_900: [number, number, number] = [15, 23, 42]
const SLATE_700: [number, number, number] = [51, 65, 85]
const SLATE_500: [number, number, number] = [100, 116, 139]
const SLATE_200: [number, number, number] = [226, 232, 240]
const SLATE_50:  [number, number, number] = [248, 250, 252]
const WHITE:     [number, number, number] = [255, 255, 255]
const GREEN:     [number, number, number] = [16, 185, 129]
const GREEN_BG:  [number, number, number] = [240, 253, 244]

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
  let y = 0

  // ── Header band ────────────────────────────────────────────────────────────
  setColor(doc, 'fill', SLATE_900)
  doc.rect(0, 0, W, 42, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  setColor(doc, 'text', WHITE)
  doc.text('INVOICE', 14, 20)

  doc.setFontSize(11)
  setColor(doc, 'text', AMBER)
  doc.text(invoice.invoice_number, 14, 30)

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    paid:      [16, 185, 129],
    sent:      [59, 130, 246],
    draft:     [100, 116, 139],
    overdue:   [239, 68, 68],
    cancelled: [71, 85, 105],
  }
  const badgeColor = statusColors[invoice.status] ?? SLATE_500
  setColor(doc, 'fill', badgeColor)
  doc.roundedRect(W - 40, 13, 26, 8, 2, 2, 'F')
  doc.setFontSize(7)
  setColor(doc, 'text', WHITE)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.status.toUpperCase(), W - 27, 18.5, { align: 'center' })

  // Dates
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColor(doc, 'text', SLATE_200)
  doc.text(`Issued: ${formatDate(invoice.issue_date)}`, W - 14, 26, { align: 'right' })
  doc.text(`Due:     ${formatDate(invoice.due_date)}`,  W - 14, 32, { align: 'right' })

  y = 52

  // ── Bill To ────────────────────────────────────────────────────────────────
  setColor(doc, 'fill', SLATE_50)
  doc.roundedRect(14, y, W - 28, 28, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, 'text', SLATE_500)
  doc.text('BILL TO', 20, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  setColor(doc, 'text', SLATE_900)
  doc.text(invoice.client.display_name, 20, y + 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setColor(doc, 'text', SLATE_700)
  const clientDetails = [
    invoice.client.email,
    invoice.client.phone,
    invoice.client.address,
  ]
    .filter(Boolean)
    .join('   |   ')
  doc.text(clientDetails, 20, y + 22)

  y += 38

  // ── Line items table ───────────────────────────────────────────────────────
  const colX = { desc: 14, qty: 120, price: 148, amount: W - 14 }

  // Table header
  setColor(doc, 'fill', SLATE_900)
  doc.rect(14, y, W - 28, 9, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setColor(doc, 'text', WHITE)
  doc.text('DESCRIPTION',       colX.desc + 3,   y + 6)
  doc.text('QTY',               colX.qty,         y + 6, { align: 'center' })
  doc.text('UNIT PRICE',        colX.price + 10,  y + 6, { align: 'center' })
  doc.text('AMOUNT',            colX.amount,      y + 6, { align: 'right' })

  y += 9

  // Table rows
  invoice.items.forEach((item, index) => {
    const rowH = 10

    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 253)
      doc.rect(14, y, W - 28, rowH, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setColor(doc, 'text', SLATE_700)
    doc.text(item.description,                    colX.desc + 3,   y + 6.5)
    doc.text(String(item.quantity),               colX.qty,         y + 6.5, { align: 'center' })
    doc.text(formatCurrency(item.unit_price),     colX.price + 10,  y + 6.5, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    setColor(doc, 'text', SLATE_900)
    doc.text(formatCurrency(item.amount),         colX.amount,      y + 6.5, { align: 'right' })

    setColor(doc, 'draw', SLATE_200)
    doc.line(14, y + rowH, W - 14, y + rowH)

    y += rowH
  })

  y += 8

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalsX  = W - 14
  const labelsX  = W - 70

  const addRow = (
    label: string,
    value: string,
    bold = false
  ) => {
    const labelColor = bold ? SLATE_900 : SLATE_500
    const valueColor = bold ? SLATE_900 : SLATE_700

    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 11 : 9)
    setColor(doc, 'text', labelColor)
    doc.text(label, labelsX, y)
    setColor(doc, 'text', valueColor)
    doc.text(value, totalsX, y, { align: 'right' })
    y += bold ? 8 : 6
  }

  addRow('Subtotal', formatCurrency(invoice.subtotal))
  addRow(`Tax (${invoice.tax_rate}%)`, formatCurrency(invoice.tax_amount))

  // Divider
  setColor(doc, 'draw', SLATE_900)
  doc.setLineWidth(0.5)
  doc.line(labelsX, y, totalsX, y)
  y += 5

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setColor(doc, 'text', SLATE_900)
  doc.text('TOTAL', labelsX, y)
  setColor(doc, 'text', AMBER)
  doc.text(formatCurrency(invoice.total), totalsX, y, { align: 'right' })
  y += 10

  // Paid stamp
  if (invoice.status === 'paid' && invoice.paid_at) {
    setColor(doc, 'fill', GREEN_BG)
    doc.roundedRect(labelsX - 2, y, totalsX - labelsX + 2, 10, 2, 2, 'F')
    setColor(doc, 'draw', GREEN)
    doc.roundedRect(labelsX - 2, y, totalsX - labelsX + 2, 10, 2, 2, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setColor(doc, 'text', GREEN)
    doc.text(
      `PAID on ${formatDate(invoice.paid_at)}`,
      labelsX + (totalsX - labelsX) / 2,
      y + 6.5,
      { align: 'center' }
    )
    y += 14
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    y += 6
    setColor(doc, 'draw', SLATE_200)
    doc.line(14, y, W - 14, y)
    y += 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    setColor(doc, 'text', SLATE_500)
    doc.text('NOTES', 14, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setColor(doc, 'text', SLATE_700)
    const lines = doc.splitTextToSize(invoice.notes, W - 28) as string[]
    doc.text(lines, 14, y)
  }

  // ── Footer band ────────────────────────────────────────────────────────────
  setColor(doc, 'fill', SLATE_900)
  doc.rect(0, H - 16, W, 16, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  setColor(doc, 'text', SLATE_500)
  doc.text('Generated by Bemo', 14, H - 6)
  doc.text(invoice.invoice_number, W - 14, H - 6, { align: 'right' })

  doc.save(`${invoice.invoice_number}.pdf`)
}