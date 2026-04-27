import content from './content.json'

export type ImageSlot = {
  src: string
  alt: string
  visible: boolean
}

export const SKU_IMAGE_KEYS = [
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'quinary',
  'senary',
] as const

export type SkuImageKey = (typeof SKU_IMAGE_KEYS)[number]

export const normalizeHexColor = (value: string | undefined) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return undefined
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`

  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    return withHash
      .slice(1)
      .split('')
      .map((character) => character + character)
      .join('')
      .replace(/^/, '#')
      .toLowerCase()
  }

  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return withHash.toLowerCase()
  }

  return undefined
}

export type HeroContent = {
  title: string
  metadata: string
  subtitle: string
  description: string
  image: ImageSlot
  visible: {
    title: boolean
    metadata: boolean
    subtitle: boolean
    description: boolean
    rule: boolean
  }
}

export type FabricSkuContent = {
  id: string
  eyebrow: string
  title: string
  description: string
  specs: {
    colorway: string
    width: string
    repeat: string
  }
  backgroundColor?: string
  images: Record<SkuImageKey, ImageSlot>
  visible: {
    title: boolean
    description: boolean
  }
}

export type LookbookContent = {
  hero: HeroContent
  fabrics: FabricSkuContent[]
}

export const defaultContent = content as LookbookContent
