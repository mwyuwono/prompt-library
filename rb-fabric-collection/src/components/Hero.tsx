import type { HeroContent } from '../data/content'

type HeroProps = {
  hero: HeroContent
}

export function Hero({ hero }: HeroProps) {
  return (
    <header className="hero-section">
      <div className="hero-kicker">
        {hero.visible.title && <h1 className="site-title">{hero.title}</h1>}
        {hero.visible.rule && <span className="title-rule" aria-hidden="true" />}
        {hero.visible.metadata && hero.metadata && (
          <p className="collection-meta">{hero.metadata}</p>
        )}
        {hero.visible.subtitle && (
          <p className="collection-title">{hero.subtitle}</p>
        )}
        {hero.visible.description && (
          <p className="collection-copy">{hero.description}</p>
        )}
      </div>

      {hero.image.visible && hero.image.src && (
        <div className="hero-image-wrap">
          <img className="hero-image" src={hero.image.src} alt={hero.image.alt} />
        </div>
      )}
    </header>
  )
}
