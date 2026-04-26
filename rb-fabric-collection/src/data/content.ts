import content from './content.json'

export type ImageSlot = {
  src: string
  alt: string
  visible: boolean
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
  images: {
    primary: ImageSlot
    secondary: ImageSlot
    tertiary: ImageSlot
  }
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
