/**
 * Generic CSV export helper used by list views ("Export as CSV" buttons).
 *
 * Usage:
 *
 *   const { exportCsv } = useExportCsv()
 *
 *   exportCsv({
 *     filename: 'tickets',
 *     items: tickets.value,
 *     columns: [
 *       { header: 'ID', accessor: t => t.id },
 *       { header: 'Subject', accessor: t => t.subject },
 *       { header: 'Status', accessor: t => t.status },
 *       { header: 'Created', accessor: t => t.createdAt },
 *     ],
 *   })
 *
 * The helper deliberately does NOT take a column-keys-from-object shortcut —
 * explicit columns prevent accidentally exporting nested objects, internal
 * ids, or PII a list view didn't already render to the user.
 */

export interface CsvColumn<T> {
  header: string
  accessor: (item: T) => string | number | boolean | null | undefined | Date
}

export interface ExportCsvOptions<T> {
  /** Filename (without extension; ".csv" is appended). Timestamp is suffixed for uniqueness. */
  filename: string
  items: readonly T[]
  columns: CsvColumn<T>[]
  /** Suffix the filename with a YYYYMMDD-HHmm timestamp. Default true. */
  timestampFilename?: boolean
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  const str = String(value)
  // RFC 4180: wrap in quotes and double any embedded quotes when the value
  // contains comma, quote, CR, LF, or starts with whitespace.
  if (/[",\r\n]/.test(str) || /^\s/.test(str) || /\s$/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}`
  )
}

export function useExportCsv() {
  function exportCsv<T>(opts: ExportCsvOptions<T>): void {
    const { filename, items, columns, timestampFilename = true } = opts

    const rows: string[] = []
    rows.push(columns.map(c => escapeCell(c.header)).join(','))
    for (const item of items) {
      rows.push(columns.map(c => escapeCell(c.accessor(item))).join(','))
    }
    // Excel sniffs UTF-8 BOM; prepend so accented chars don't render as garbage.
    const csv = '\uFEFF' + rows.join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const finalName = `${filename}${timestampFilename ? `-${timestamp()}` : ''}.csv`

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = finalName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return { exportCsv }
}
