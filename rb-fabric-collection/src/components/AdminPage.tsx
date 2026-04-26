import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { FabricSku } from './FabricSku'
import { Hero } from './Hero'
import { defaultContent } from '../data/content'
import './AdminPage.css'
import type {
  FabricSkuContent,
  HeroContent,
  ImageSlot,
  LookbookContent,
} from '../data/content'

const STORAGE_KEY = 'robert-brown-lookbook-draft'
const CONTENT_API = '/api/fabric-content'
const IMAGE_API = '/api/fabric-images'

type ImageKey = keyof FabricSkuContent['images']

const cloneContent = (content: LookbookContent): LookbookContent =>
  JSON.parse(JSON.stringify(content)) as LookbookContent

const normalizeImage = (image: Partial<ImageSlot> | undefined, fallback: ImageSlot) => ({
  src: typeof image?.src === 'string' ? image.src : fallback.src,
  alt: typeof image?.alt === 'string' ? image.alt : fallback.alt,
  visible: typeof image?.visible === 'boolean' ? image.visible : fallback.visible,
})

const normalizeContent = (content: Partial<LookbookContent>): LookbookContent => {
  const fallback = cloneContent(defaultContent)
  const hero = content.hero ?? fallback.hero

  return {
    hero: {
      title: typeof hero.title === 'string' ? hero.title : fallback.hero.title,
      metadata:
        typeof hero.metadata === 'string' ? hero.metadata : fallback.hero.metadata,
      subtitle:
        typeof hero.subtitle === 'string' ? hero.subtitle : fallback.hero.subtitle,
      description:
        typeof hero.description === 'string'
          ? hero.description
          : fallback.hero.description,
      image: normalizeImage(hero.image, fallback.hero.image),
      visible: {
        title:
          typeof hero.visible?.title === 'boolean'
            ? hero.visible.title
            : fallback.hero.visible.title,
        metadata:
          typeof hero.visible?.metadata === 'boolean'
            ? hero.visible.metadata
            : fallback.hero.visible.metadata,
        subtitle:
          typeof hero.visible?.subtitle === 'boolean'
            ? hero.visible.subtitle
            : fallback.hero.visible.subtitle,
        description:
          typeof hero.visible?.description === 'boolean'
            ? hero.visible.description
            : fallback.hero.visible.description,
        rule:
          typeof hero.visible?.rule === 'boolean'
            ? hero.visible.rule
            : fallback.hero.visible.rule,
      },
    },
    fabrics: Array.isArray(content.fabrics)
      ? content.fabrics.map((fabric, index) => {
          const fabricFallback = fallback.fabrics[index] ?? createBlankSku()

          return {
            id:
              typeof fabric.id === 'string' && fabric.id
                ? fabric.id
                : `fabric-${Date.now()}-${index}`,
            title:
              typeof fabric.title === 'string' ? fabric.title : fabricFallback.title,
            description:
              typeof fabric.description === 'string'
                ? fabric.description
                : fabricFallback.description,
            images: {
              header: normalizeImage(fabric.images?.header, fabricFallback.images.header),
              lifestyle: normalizeImage(
                fabric.images?.lifestyle,
                fabricFallback.images.lifestyle,
              ),
              detail: normalizeImage(fabric.images?.detail, fabricFallback.images.detail),
              application: normalizeImage(
                fabric.images?.application,
                fabricFallback.images.application,
              ),
            },
            visible: {
              title:
                typeof fabric.visible?.title === 'boolean'
                  ? fabric.visible.title
                  : fabricFallback.visible.title,
              description:
                typeof fabric.visible?.description === 'boolean'
                  ? fabric.visible.description
                  : fabricFallback.visible.description,
            },
          }
        })
      : fallback.fabrics,
  }
}

const createBlankImage = (): ImageSlot => ({
  src: '',
  alt: '',
  visible: true,
})

const createBlankSku = (): FabricSkuContent => ({
  id: `fabric-${Date.now()}`,
  title: 'New Fabric',
  description: 'Describe the textile, its hand, pattern language, and intended mood.',
  images: {
    header: createBlankImage(),
    lifestyle: createBlankImage(),
    detail: createBlankImage(),
    application: createBlankImage(),
  },
  visible: {
    title: true,
    description: true,
  },
})

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

async function loadSavedContent() {
  const response = await fetch(CONTENT_API)

  if (!response.ok) {
    throw new Error('Unable to load saved content')
  }

  return normalizeContent((await response.json()) as Partial<LookbookContent>)
}

async function saveContent(content: LookbookContent) {
  const response = await fetch(CONTENT_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })

  if (!response.ok) {
    throw new Error('Unable to save content')
  }

  return normalizeContent((await response.json()) as Partial<LookbookContent>)
}

async function uploadImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file)
  const response = await fetch(IMAGE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      dataUrl,
    }),
  })

  if (!response.ok) {
    throw new Error('Unable to upload image')
  }

  const payload = (await response.json()) as { path?: string }

  if (!payload.path) {
    throw new Error('Upload response missing image path')
  }

  return payload.path
}

function downloadJson(content: LookbookContent) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'robert-brown-lookbook-draft.json'
  link.click()
  URL.revokeObjectURL(url)
}

function imageLabel(key: ImageKey) {
  return key === 'application' ? 'Application' : key[0].toUpperCase() + key.slice(1)
}

export function AdminPage() {
  const [content, setContent] = useState<LookbookContent>(() =>
    cloneContent(defaultContent),
  )
  const [savedContent, setSavedContent] = useState<LookbookContent>(() =>
    cloneContent(defaultContent),
  )
  const [status, setStatus] = useState('Loading saved content...')
  const [isSaving, setIsSaving] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }, [content])

  useEffect(() => {
    let cancelled = false

    loadSavedContent()
      .then((saved) => {
        if (cancelled) {
          return
        }

        setSavedContent(saved)

        const stored = window.localStorage.getItem(STORAGE_KEY)

        if (stored) {
          try {
            setContent(normalizeContent(JSON.parse(stored) as Partial<LookbookContent>))
            setStatus('Recovered an unsaved local draft')
            return
          } catch {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        }

        setContent(saved)
        setStatus('Loaded saved content')
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('Could not load saved content; using checked-in fallback')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const skuCount = useMemo(() => content.fabrics.length, [content.fabrics.length])

  const updateHero = (updater: (hero: HeroContent) => HeroContent) => {
    setContent((current) => ({ ...current, hero: updater(current.hero) }))
  }

  const updateSku = (
    index: number,
    updater: (fabric: FabricSkuContent) => FabricSkuContent,
  ) => {
    setContent((current) => ({
      ...current,
      fabrics: current.fabrics.map((fabric, fabricIndex) =>
        fabricIndex === index ? updater(fabric) : fabric,
      ),
    }))
  }

  const moveSku = (index: number, direction: -1 | 1) => {
    setContent((current) => {
      const nextIndex = index + direction

      if (nextIndex < 0 || nextIndex >= current.fabrics.length) {
        return current
      }

      const fabrics = [...current.fabrics]
      const [fabric] = fabrics.splice(index, 1)
      fabrics.splice(nextIndex, 0, fabric)
      return { ...current, fabrics }
    })
  }

  const duplicateSku = (index: number) => {
    setContent((current) => {
      const fabrics = [...current.fabrics]
      const duplicate = cloneContent({
        hero: current.hero,
        fabrics: [current.fabrics[index]],
      }).fabrics[0]
      duplicate.id = `${duplicate.id}-copy-${Date.now()}`
      duplicate.title = `${duplicate.title} Copy`
      fabrics.splice(index + 1, 0, duplicate)
      return { ...current, fabrics }
    })
  }

  const removeSku = (index: number) => {
    setContent((current) => ({
      ...current,
      fabrics: current.fabrics.filter((_, fabricIndex) => fabricIndex !== index),
    }))
  }

  const handleHeroImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const src = await uploadImage(file)
      updateHero((hero) => ({
        ...hero,
        image: {
          ...hero.image,
          src,
          visible: true,
        },
      }))
      setStatus('Image uploaded; click Save to apply')
    } catch {
      setStatus('Image upload failed')
    } finally {
      event.target.value = ''
    }
  }

  const handleSkuImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
    imageKey: ImageKey,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const src = await uploadImage(file)
      updateSku(index, (fabric) => ({
        ...fabric,
        images: {
          ...fabric.images,
          [imageKey]: {
            ...fabric.images[imageKey],
            src,
            visible: true,
          },
        },
      }))
      setStatus('Image uploaded; click Save to apply')
    } catch {
      setStatus('Image upload failed')
    } finally {
      event.target.value = ''
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const imported = JSON.parse(await file.text()) as Partial<LookbookContent>
      setContent(normalizeContent(imported))
      setStatus('Imported JSON draft')
    } catch {
      setStatus('Import failed: choose a valid lookbook JSON file')
    }

    event.target.value = ''
  }

  const handleSave = async () => {
    setIsSaving(true)
    setStatus('Saving...')

    try {
      const saved = await saveContent(content)
      setContent(saved)
      setSavedContent(saved)
      window.localStorage.removeItem(STORAGE_KEY)
      setStatus('Saved to src/data/content.json')
    } catch {
      setStatus('Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-panel" aria-label="Lookbook admin controls">
        <div className="admin-panel-header">
          <div>
            <p className="admin-eyebrow">Local Admin</p>
            <h1>Fabric Lookbook</h1>
          </div>
          <a className="admin-preview-link" href="/">
            Public page
          </a>
        </div>

        <div className="admin-toolbar">
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => downloadJson(content)}>
            Export JSON
          </button>
          <button type="button" onClick={() => importInputRef.current?.click()}>
            Import JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setContent(cloneContent(savedContent))
              window.localStorage.removeItem(STORAGE_KEY)
              setStatus('Reset to last saved content')
            }}
          >
            Reset
          </button>
          <input
            ref={importInputRef}
            className="admin-file-input"
            type="file"
            accept="application/json"
            onChange={handleImport}
          />
        </div>
        <p className="admin-status">{status}</p>

        <section className="admin-section" aria-labelledby="hero-admin-title">
          <h2 id="hero-admin-title">Hero</h2>
          <Field
            label="Title"
            value={content.hero.title}
            onChange={(value) => updateHero((hero) => ({ ...hero, title: value }))}
          />
          <VisibilityToggle
            label="Show title"
            checked={content.hero.visible.title}
            onChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                visible: { ...hero.visible, title: checked },
              }))
            }
          />
          <VisibilityToggle
            label="Show rule"
            checked={content.hero.visible.rule}
            onChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                visible: { ...hero.visible, rule: checked },
              }))
            }
          />
          <Field
            label="Metadata"
            value={content.hero.metadata}
            onChange={(value) => updateHero((hero) => ({ ...hero, metadata: value }))}
          />
          <VisibilityToggle
            label="Show metadata"
            checked={content.hero.visible.metadata}
            onChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                visible: { ...hero.visible, metadata: checked },
              }))
            }
          />
          <Field
            label="Subtitle"
            value={content.hero.subtitle}
            onChange={(value) => updateHero((hero) => ({ ...hero, subtitle: value }))}
          />
          <VisibilityToggle
            label="Show subtitle"
            checked={content.hero.visible.subtitle}
            onChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                visible: { ...hero.visible, subtitle: checked },
              }))
            }
          />
          <Field
            label="Description"
            value={content.hero.description}
            multiline
            onChange={(value) =>
              updateHero((hero) => ({ ...hero, description: value }))
            }
          />
          <VisibilityToggle
            label="Show description"
            checked={content.hero.visible.description}
            onChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                visible: { ...hero.visible, description: checked },
              }))
            }
          />
          <ImageEditor
            label="Hero image"
            image={content.hero.image}
            onAltChange={(value) =>
              updateHero((hero) => ({
                ...hero,
                image: { ...hero.image, alt: value },
              }))
            }
            onUpload={handleHeroImageUpload}
            onRemove={() =>
              updateHero((hero) => ({
                ...hero,
                image: { ...hero.image, src: '' },
              }))
            }
            onVisibleChange={(checked) =>
              updateHero((hero) => ({
                ...hero,
                image: { ...hero.image, visible: checked },
              }))
            }
          />
        </section>

        <section className="admin-section" aria-labelledby="sku-admin-title">
          <div className="admin-section-title-row">
            <h2 id="sku-admin-title">Fabric SKUs</h2>
            <button
              type="button"
              onClick={() =>
                setContent((current) => ({
                  ...current,
                  fabrics: [...current.fabrics, createBlankSku()],
                }))
              }
            >
              Add SKU
            </button>
          </div>

          {content.fabrics.map((fabric, index) => (
            <SkuEditor
              key={fabric.id}
              fabric={fabric}
              index={index}
              count={skuCount}
              onMove={moveSku}
              onDuplicate={duplicateSku}
              onRemove={removeSku}
              onUpdate={(updater) => updateSku(index, updater)}
              onImageUpload={handleSkuImageUpload}
            />
          ))}
        </section>
      </aside>

      <section className="admin-preview" aria-label="Live lookbook preview">
        <div className="admin-preview-frame">
          <div className="site-shell">
            <Hero hero={content.hero} />
            <div className="collection-sections" aria-label="Fabric collection">
              {content.fabrics.map((fabric) => (
                <FabricSku key={fabric.id} fabric={fabric} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string
  value: string
  multiline?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  )
}

function VisibilityToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

function ImageEditor({
  label,
  image,
  onAltChange,
  onUpload,
  onRemove,
  onVisibleChange,
}: {
  label: string
  image: ImageSlot
  onAltChange: (value: string) => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  onVisibleChange: (checked: boolean) => void
}) {
  return (
    <div className="admin-image-editor">
      <div className="admin-image-heading">
        <span>{label}</span>
        <VisibilityToggle
          label="Show"
          checked={image.visible}
          onChange={onVisibleChange}
        />
      </div>
      {image.src ? (
        <img className="admin-image-thumb" src={image.src} alt="" />
      ) : (
        <div className="admin-image-empty">No image selected</div>
      )}
      <Field label="Alt text" value={image.alt} onChange={onAltChange} />
      <div className="admin-image-actions">
        <label className="admin-upload-button">
          Replace
          <input type="file" accept="image/*" onChange={onUpload} />
        </label>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  )
}

function SkuEditor({
  fabric,
  index,
  count,
  onMove,
  onDuplicate,
  onRemove,
  onUpdate,
  onImageUpload,
}: {
  fabric: FabricSkuContent
  index: number
  count: number
  onMove: (index: number, direction: -1 | 1) => void
  onDuplicate: (index: number) => void
  onRemove: (index: number) => void
  onUpdate: (updater: (fabric: FabricSkuContent) => FabricSkuContent) => void
  onImageUpload: (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
    imageKey: ImageKey,
  ) => void
}) {
  return (
    <details className="admin-sku-editor" open={index === 0}>
      <summary>
        <span>{fabric.title || 'Untitled Fabric'}</span>
        <span className="admin-sku-order">#{index + 1}</span>
      </summary>
      <div className="admin-sku-actions">
        <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)}>
          Move up
        </button>
        <button
          type="button"
          disabled={index === count - 1}
          onClick={() => onMove(index, 1)}
        >
          Move down
        </button>
        <button type="button" onClick={() => onDuplicate(index)}>
          Duplicate
        </button>
        <button type="button" onClick={() => onRemove(index)}>
          Remove
        </button>
      </div>
      <Field
        label="Title"
        value={fabric.title}
        onChange={(value) => onUpdate((current) => ({ ...current, title: value }))}
      />
      <VisibilityToggle
        label="Show title"
        checked={fabric.visible.title}
        onChange={(checked) =>
          onUpdate((current) => ({
            ...current,
            visible: { ...current.visible, title: checked },
          }))
        }
      />
      <Field
        label="Description"
        value={fabric.description}
        multiline
        onChange={(value) =>
          onUpdate((current) => ({ ...current, description: value }))
        }
      />
      <VisibilityToggle
        label="Show description"
        checked={fabric.visible.description}
        onChange={(checked) =>
          onUpdate((current) => ({
            ...current,
            visible: { ...current.visible, description: checked },
          }))
        }
      />
      {(Object.keys(fabric.images) as ImageKey[]).map((imageKey) => (
        <ImageEditor
          key={imageKey}
          label={`${imageLabel(imageKey)} image`}
          image={fabric.images[imageKey]}
          onAltChange={(value) =>
            onUpdate((current) => ({
              ...current,
              images: {
                ...current.images,
                [imageKey]: { ...current.images[imageKey], alt: value },
              },
            }))
          }
          onUpload={(event) => onImageUpload(event, index, imageKey)}
          onRemove={() =>
            onUpdate((current) => ({
              ...current,
              images: {
                ...current.images,
                [imageKey]: { ...current.images[imageKey], src: '' },
              },
            }))
          }
          onVisibleChange={(checked) =>
            onUpdate((current) => ({
              ...current,
              images: {
                ...current.images,
                [imageKey]: { ...current.images[imageKey], visible: checked },
              },
            }))
          }
        />
      ))}
    </details>
  )
}
