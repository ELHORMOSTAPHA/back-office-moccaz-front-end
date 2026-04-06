/** Map common French automotive / interior labels to an approximate fill for the swatch. */
export function approximateColorFromFrenchLabel(label: string | null | undefined): string {
    if (!label?.trim()) return '#dee2e6'

    const t = label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

    if (/blanc|nacre|ivoire|perle/.test(t)) return '#f3f3ee'
    if (/noir|ebene/.test(t)) return '#252525'
    if (/platine|argent|chrome|acier|metal(ique)?/.test(t)) return '#b0b4b9'
    if (/bleu|iron|marine|nuit|indigo/.test(t)) return '#4f6f94'
    if (/rouge|bordeaux|carmin/.test(t)) return '#9e2a2b'
    if (/vert|kaki|olive/.test(t)) return '#2f5d50'
    if (/jaune|or|sable.*clair/.test(t)) return '#d1b045'
    if (/orange/.test(t)) return '#cc6b2c'
    if (/marron|beige|taupe|cognac|havane/.test(t)) return '#8a6b52'
    if (/violet|parme|prune/.test(t)) return '#6b5b7a'
    if (/cuir/.test(t) && /noir/.test(t)) return '#1c1c1c'
    if (/gris|anthracite|tissu|alcantara/.test(t)) return '#8f959e'

    return '#adb5bd'
}

/** Returns a string safe for `backgroundColor`, or null if `raw` is not a usable CSS color. */
export function normalizeCssColor(raw: string | null | undefined): string | null {
    const s = raw?.trim()
    if (!s) return null
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(s)) return s
    if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`
    if (/^[0-9A-Fa-f]{3}$/.test(s)) return `#${s}`
    if (/^(rgb|hsl)a?\(/i.test(s)) return s
    return null
}

export function swatchFillFromCodeOrLabel(
    code: string | null | undefined,
    label: string | null | undefined,
): string {
    const fromCode = normalizeCssColor(code)
    if (fromCode) return fromCode
    const labelTrim = label?.trim()
    if (!labelTrim) return '#dee2e6'
    return approximateColorFromFrenchLabel(label)
}

export function colorRowDisplayText(
    label: string | null | undefined,
    code: string | null | undefined,
): string {
    const labelTrim = label?.trim() ?? ''
    const normalizedCode = normalizeCssColor(code)
    if (labelTrim && normalizedCode) return `${labelTrim} · ${normalizedCode}`
    if (labelTrim) return labelTrim
    if (normalizedCode) return normalizedCode
    return '—'
}

/** `#rrggbb` for `<input type="color" />` (expands #rgb; fallback when invalid). */
export function hexForColorInput(raw: string | null | undefined): string {
    let s = raw?.trim() ?? ''
    if (!s) return '#6c757d'
    if (!s.startsWith('#') && /^[0-9A-Fa-f]{6}$/i.test(s)) s = `#${s}`
    if (!s.startsWith('#') && /^[0-9A-Fa-f]{3}$/i.test(s)) s = `#${s}`
    if (/^#[0-9A-Fa-f]{3}$/i.test(s)) {
        const h = s.slice(1)
        s = `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
    }
    if (/^#[0-9A-Fa-f]{6}$/i.test(s)) return s.toLowerCase()
    return '#6c757d'
}

/** True when the stored code is a hex form suitable for the native color picker. */
export function isHexForColorPicker(raw: string | null | undefined): boolean {
    const s = raw?.trim() ?? ''
    if (/^#[0-9A-Fa-f]{6}$/i.test(s)) return true
    if (/^[0-9A-Fa-f]{6}$/i.test(s)) return true
    if (/^#[0-9A-Fa-f]{3}$/i.test(s)) return true
    if (/^[0-9A-Fa-f]{3}$/i.test(s)) return true
    return false
}
