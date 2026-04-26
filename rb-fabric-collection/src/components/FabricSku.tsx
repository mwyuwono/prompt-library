import type { FabricSkuContent } from '../data/content'

type FabricSkuProps = {
  fabric: FabricSkuContent
}

export function FabricSku({ fabric }: FabricSkuProps) {
  const specs = [
    fabric.specs.colorway,
    fabric.specs.width,
    fabric.specs.repeat,
  ].filter(Boolean)
  const images = [
    { image: fabric.images.primary, className: 'sku-image-primary' },
    { image: fabric.images.secondary, className: 'sku-image-secondary' },
    { image: fabric.images.tertiary, className: 'sku-image-tertiary' },
  ].filter(({ image }) => image.visible && image.src)

  return (
    <article className="fabric-sku" aria-labelledby={`${fabric.id}-title`}>
      <div className="sku-copy">
        {fabric.eyebrow && <p className="sku-eyebrow">{fabric.eyebrow}</p>}
        {fabric.visible.title && (
          <h2 className="sku-title" id={`${fabric.id}-title`}>
            {fabric.title}
          </h2>
        )}
        {fabric.visible.description && (
          <p className="sku-description">{fabric.description}</p>
        )}
        {specs.length > 0 && (
          <p className="sku-specs">
            {specs.map((spec, index) => (
              <span key={`${spec}-${index}`}>
                {index > 0 && <span className="sku-spec-divider">·</span>}
                {spec}
              </span>
            ))}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div
          className={`sku-image-grid sku-image-grid-${images.length}`}
          aria-label={`${fabric.title} imagery`}
        >
          {images.map(({ image, className }) => (
            <img
              key={`${className}-${image.src}`}
              className={`sku-image ${className}`}
              src={image.src}
              alt={image.alt}
            />
          ))}
        </div>
      )}
    </article>
  )
}
