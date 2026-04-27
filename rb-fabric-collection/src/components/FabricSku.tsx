import type { FabricSkuContent } from '../data/content'
import { normalizeHexColor } from '../data/content'

type FabricSkuProps = {
  fabric: FabricSkuContent
}

export function FabricSku({ fabric }: FabricSkuProps) {
  const specs = [
    fabric.specs.colorway,
    fabric.specs.width,
    fabric.specs.repeat,
  ].filter(Boolean)
  const imageRows = [
    [
      { image: fabric.images.primary, className: 'sku-image-primary' },
      { image: fabric.images.secondary, className: 'sku-image-secondary' },
      { image: fabric.images.tertiary, className: 'sku-image-tertiary' },
    ],
    [
      { image: fabric.images.quaternary, className: 'sku-image-quaternary' },
      { image: fabric.images.quinary, className: 'sku-image-quinary' },
      { image: fabric.images.senary, className: 'sku-image-senary' },
    ],
  ].map((row) => row.filter(({ image }) => image?.visible && image.src))
  const visibleImageRows = imageRows.filter((row) => row.length > 0)
  const backgroundColor = normalizeHexColor(fabric.backgroundColor)

  return (
    <article
      className="fabric-sku"
      style={backgroundColor ? { backgroundColor } : undefined}
      aria-labelledby={`${fabric.id}-title`}
    >
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

      {visibleImageRows.length > 0 && (
        <div className="sku-image-rows" aria-label={`${fabric.title} imagery`}>
          {visibleImageRows.map((images, index) => (
            <div
              key={`sku-image-row-${index}`}
              className={`sku-image-grid sku-image-grid-${images.length}`}
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
          ))}
        </div>
      )}
    </article>
  )
}
