import type { FabricSkuContent, ImageSlot } from '../data/content'

type FabricSkuProps = {
  fabric: FabricSkuContent
}

function FabricImage({
  image,
  className,
}: {
  image: ImageSlot
  className: string
}) {
  if (!image.visible || !image.src) {
    return <div className={`${className} image-placeholder`} aria-hidden="true" />
  }

  return <img className={className} src={image.src} alt={image.alt} />
}

export function FabricSku({ fabric }: FabricSkuProps) {
  return (
    <article className="fabric-sku" aria-labelledby={`${fabric.id}-title`}>
      <FabricImage image={fabric.images.header} className="sku-header-image" />

      {(fabric.visible.title || fabric.visible.description) && (
        <div className="sku-text">
          {fabric.visible.title && (
            <h2 className="sku-title" id={`${fabric.id}-title`}>
              {fabric.title}
            </h2>
          )}
          {fabric.visible.description && (
            <p className="sku-description">{fabric.description}</p>
          )}
        </div>
      )}

      <div className="sku-gallery" aria-label={`${fabric.title} imagery`}>
        <FabricImage
          image={fabric.images.lifestyle}
          className="sku-image sku-image-large"
        />
        <div className="sku-stack">
          <FabricImage image={fabric.images.detail} className="sku-image" />
          <FabricImage image={fabric.images.application} className="sku-image" />
        </div>
      </div>
    </article>
  )
}
