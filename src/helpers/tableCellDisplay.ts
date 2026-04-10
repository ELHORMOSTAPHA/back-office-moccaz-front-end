/** Shown when a table cell has no meaningful value (null, undefined, blank text, invalid date, etc.). */
export const TABLE_VALUE_NON_DEFINIE = 'non définie'

export function tableCellText(value: unknown): string {
    if (value === null || value === undefined) return TABLE_VALUE_NON_DEFINIE
    if (typeof value === 'string') {
        if (value.trim() === '') return TABLE_VALUE_NON_DEFINIE
        return value
    }
    if (typeof value === 'number') {
        if (Number.isNaN(value)) return TABLE_VALUE_NON_DEFINIE
        return String(value)
    }
    return String(value)
}

/** ISO (or API) date string → `Date`, or `null` if missing / invalid. */
export function parseIsoTableDate(value: string | null | undefined): Date | null {
    if (value == null || String(value).trim() === '') return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
}
