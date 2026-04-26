import content from './content.json'

export type ImageSlot = {
  src: string
  alt: string
  visible: boolean
}

export type HeroContent = {
  title: string
  subtitle: string
  description: string
  image: ImageSlot
  visible: {
    title: boolean
    subtitle: boolean
    description: boolean
    rule: boolean
  }
}

export type FabricSkuContent = {
  id: string
  title: string
  description: string
  images: {
    header: ImageSlot
    lifestyle: ImageSlot
    detail: ImageSlot
    application: ImageSlot
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
