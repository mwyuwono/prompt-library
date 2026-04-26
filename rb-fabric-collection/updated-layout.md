Below is the implementation guidance for Codex.

Objective

Update the fabric collection landing page so the hero section and each repeated SKU module feel structurally distinct. The same SKU module pattern is reused across the page, so implement the change once at the reusable SKU component level.

Target layout behavior

The page should read as:

Hero section
  - Collection title
  - Collection subtitle
  - Short collection description
  - Wide hero image
Section divider
  - Thin horizontal rules with a small centered ornament / glyph
SKU module
  - Subtle contrasting background panel
  - Left-aligned SKU metadata, title, description, and specs
  - Three-image product layout
  - No bottom horizontal rule
Next SKU module
  - Same reusable structure

⸻

1. Separate the hero from the first SKU module

Add a clear transition between the hero section and the first SKU module.

Required changes

After the hero image, add:

* generous vertical spacing
* a centered editorial divider
* two thin horizontal rules with a small centered glyph or ornament between them

Suggested structure

<section className="hero">
  ...
</section>
<div className="section-divider" aria-hidden="true">
  <span className="divider-line"></span>
  <span className="divider-glyph">✤</span>
  <span className="divider-line"></span>
</div>
<SkuModule ... />

Suggested CSS

.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  width: min(560px, 70vw);
  margin: 72px auto 48px;
  color: #a89473;
}
.divider-line {
  height: 1px;
  flex: 1;
  background: rgba(100, 82, 58, 0.35);
}
.divider-glyph {
  font-size: 18px;
  line-height: 1;
  color: #a89473;
}

⸻

2. Convert the SKU module into a self-contained panel

Each SKU module should sit inside a softly tinted background panel. This is the primary visual mechanism that distinguishes one SKU from the next.

Required changes

Wrap the full SKU module in a panel container with:

* subtly darker parchment / flax background than the page background
* generous internal padding
* max-width aligned to the hero image width
* vertical spacing between repeated modules
* no border required
* no bottom horizontal rule

Suggested component structure

<section className="sku-module">
  <div className="sku-copy">
    <div className="sku-eyebrow">FABRIC 01 · HAND-BLOCKED LINEN</div>
    <h2>COMING APART</h2>
    <p className="sku-description">
      An elegant disarray of forms, embodying the beauty in the breakdown of traditional motifs.
      Printed on artisanal linen, the fragmented pattern speaks to both deconstruction and reassembly,
      offering a complex yet serene tactile experience.
    </p>
    <div className="sku-specs">
      Carbon on natural flax <span>·</span> 54&quot; width <span>·</span> Repeat: 27&quot; h x 27&quot; w
    </div>
  </div>
  <div className="sku-image-grid">
    <img className="sku-image sku-image-primary" src="..." alt="..." />
    <img className="sku-image sku-image-secondary" src="..." alt="..." />
    <img className="sku-image sku-image-tertiary" src="..." alt="..." />
  </div>
</section>

Suggested CSS

.sku-module {
  width: min(1120px, calc(100vw - 64px));
  margin: 0 auto 32px;
  padding: 56px 48px 48px;
  background: #efe6d7;
  box-sizing: border-box;
}
.sku-module + .sku-module {
  margin-top: 28px;
}

Use a subtle panel color. The intent is separation, not a “card” look.

Recommended color relationship:

body {
  background: #f6efdf;
}
.sku-module {
  background: #efe6d7;
}

⸻

3. Move all SKU text above the image grid

The SKU title and description should appear at the top of the module, before the images. This creates a clear entry point for each SKU.

Required changes

Inside the reusable SKU module:

1. Place the eyebrow first.
2. Place the SKU title second.
3. Place the description third.
4. Place specs fourth.
5. Place the three images after all text.

The module should not begin with imagery.

⸻

4. Use three images per SKU module

Each SKU module should show exactly three images:

1. One large primary swatch / pattern image
2. One medium supporting crop
3. One medium supporting crop

Remove the fourth image from the current SKU image set.

Required image layout

Desktop layout should be a three-column editorial grid:

* Image 1: wider primary image
* Image 2: narrower supporting detail
* Image 3: narrower supporting detail

Suggested CSS

.sku-image-grid {
  display: grid;
  grid-template-columns: 1.65fr 1fr 1fr;
  gap: 24px;
  margin-top: 28px;
}
.sku-image {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
}
.sku-image-primary {
  height: 360px;
}
.sku-image-secondary,
.sku-image-tertiary {
  height: 360px;
}

This creates the same visual logic as the updated mockup: one dominant fabric view, followed by two tighter editorial crops.

⸻

5. Remove the bottom horizontal rule from SKU modules

The SKU panel background now defines the module boundary, so the bottom rule is unnecessary.

Required changes

Remove or disable:

<hr />

or any element similar to:

<div className="sku-bottom-rule"></div>

Also remove associated CSS if it exists:

.sku-bottom-rule {
  ...
}

Do not add a replacement rule at the bottom of the module.

⸻

6. Adjust SKU typography

The SKU copy should be left-aligned within the module, not centered. This helps the module feel like a product card / editorial entry rather than a continuation of the hero.

Suggested CSS

.sku-copy {
  max-width: 380px;
  text-align: left;
}
.sku-eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #3f372d;
  margin-bottom: 18px;
}
.sku-copy h2 {
  font-family: var(--serif-font);
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: 0.08em;
  margin: 0 0 20px;
  color: #25211c;
}
.sku-description {
  font-size: 13px;
  line-height: 1.65;
  max-width: 360px;
  color: #4e463c;
  margin: 0 0 22px;
}
.sku-specs {
  font-size: 12px;
  line-height: 1.5;
  color: #4e463c;
  border-top: 1px solid rgba(100, 82, 58, 0.28);
  padding-top: 14px;
}
.sku-specs span {
  margin: 0 8px;
}

The small top rule above the specs is acceptable. The removed rule is the bottom module separator.

⸻

7. Responsive behavior

On tablet and mobile, the SKU image grid should stack cleanly.

Suggested responsive CSS

@media (max-width: 900px) {
  .sku-module {
    width: min(100% - 32px, 720px);
    padding: 40px 28px 32px;
  }
  .sku-image-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .sku-image,
  .sku-image-primary,
  .sku-image-secondary,
  .sku-image-tertiary {
    height: auto;
    aspect-ratio: 4 / 3;
  }
}
@media (max-width: 560px) {
  .section-divider {
    width: 72vw;
    margin: 56px auto 36px;
  }
  .sku-module {
    width: calc(100% - 24px);
    padding: 32px 20px 24px;
  }
  .sku-copy h2 {
    font-size: 30px;
  }
  .sku-description {
    font-size: 13px;
  }
}

⸻

8. Data model adjustment

Update the repeated SKU module data shape so each SKU has exactly three images.

Suggested data structure

type SkuModuleData = {
  eyebrow: string;
  title: string;
  description: string;
  specs: {
    colorway: string;
    width: string;
    repeat: string;
  };
  images: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
};

Or, if the implementation uses an array:

images: [
  {
    src: "...",
    alt: "Primary fabric swatch for Coming Apart"
  },
  {
    src: "...",
    alt: "Detail crop of architectural motif"
  },
  {
    src: "...",
    alt: "Detail crop of classical figure motif"
  }
]

Then render only the first three images:

{images.slice(0, 3).map((image, index) => (
  <img
    key={image.src}
    className={`sku-image sku-image-${index}`}
    src={image.src}
    alt={image.alt}
  />
))}

⸻

9. Acceptance criteria

The update is complete when:

1. The hero section is visually separated from the first SKU module by a centered divider.
2. Each SKU module sits inside a softly tinted background panel.
3. The SKU title, description, and specs appear before the images.
4. Each SKU module displays exactly three images.
5. No horizontal rule appears at the bottom of each SKU module.
6. Repeated SKU modules are visually distinct from one another through panel spacing and background color.
7. The layout remains responsive, with the three images stacking on smaller screens.