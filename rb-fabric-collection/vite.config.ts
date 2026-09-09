import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentPath = path.join(__dirname, 'src', 'data', 'content.json')
const fabricAssetBucket = process.env.RB_FABRIC_ASSET_BUCKET || 'prompt-library-assets-009019643313'
const fabricAssetPrefix = 'rb-fabric-collection/fabrics/uploads'
const fabricAssetProfile = process.env.RB_FABRIC_ASSET_PROFILE || 'plots-s3-admin-bootstrap'
const fabricAssetBaseUrl = `https://${fabricAssetBucket}.s3.amazonaws.com/${fabricAssetPrefix}`

type JsonBody = Record<string, unknown>

function readRequestBody(request: import('node:http').IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(
  response: import('node:http').ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

function isObject(value: unknown): value is JsonBody {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isImageSlot(value: unknown) {
  return (
    isObject(value) &&
    typeof value.src === 'string' &&
    typeof value.alt === 'string' &&
    typeof value.visible === 'boolean'
  )
}

function validateContent(value: unknown) {
  if (!isObject(value) || !isObject(value.hero) || !Array.isArray(value.fabrics)) {
    return false
  }

  const hero = value.hero

  if (
    typeof hero.title !== 'string' ||
    typeof hero.subtitle !== 'string' ||
    typeof hero.description !== 'string' ||
    !isImageSlot(hero.image) ||
    !isObject(hero.visible)
  ) {
    return false
  }

  return value.fabrics.every((fabric) => {
    if (
      !isObject(fabric) ||
      typeof fabric.id !== 'string' ||
      typeof fabric.eyebrow !== 'string' ||
      typeof fabric.title !== 'string' ||
      typeof fabric.description !== 'string' ||
      !isObject(fabric.specs) ||
      !isObject(fabric.images) ||
      !isObject(fabric.visible)
    ) {
      return false
    }

    if (
      typeof fabric.specs.colorway !== 'string' ||
      typeof fabric.specs.width !== 'string' ||
      typeof fabric.specs.repeat !== 'string'
    ) {
      return false
    }

    return ['primary', 'secondary', 'tertiary'].every((key) =>
      isImageSlot((fabric.images as JsonBody)[key]),
    )
  })
}

function safeImageName(fileName: string, mimeType: string) {
  const extFromName = path.extname(fileName).toLowerCase()
  const extFromMime = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg'
  const ext = extFromName.match(/^\.(jpe?g|png|webp|gif|svg)$/) ? extFromName : extFromMime
  const slug = path
    .basename(fileName, extFromName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${Date.now()}-${slug || 'fabric-image'}${ext}`
}

function uploadFabricImage(fileName: string, mimeType: string, bytes: Buffer) {
  const key = `${fabricAssetPrefix}/${fileName}`

  return new Promise<void>((resolve, reject) => {
    const upload = spawn(
      'aws',
      [
        's3',
        'cp',
        '-',
        `s3://${fabricAssetBucket}/${key}`,
        '--content-type',
        mimeType,
        '--cache-control',
        'public, max-age=31536000, immutable',
        '--profile',
        fabricAssetProfile,
      ],
      { stdio: ['pipe', 'ignore', 'pipe'] },
    )
    let errorOutput = ''

    upload.stderr.on('data', (chunk: Buffer) => {
      errorOutput += chunk.toString()
    })
    upload.once('error', reject)
    upload.once('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(errorOutput || `S3 upload exited with code ${code}`))
    })
    upload.stdin.end(bytes)
  })
}

function fabricAdminApi(): Plugin {
  return {
    name: 'fabric-admin-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api/fabric-')) {
          next()
          return
        }

        try {
          if (request.url === '/api/fabric-content' && request.method === 'GET') {
            sendJson(response, 200, JSON.parse(fs.readFileSync(contentPath, 'utf8')))
            return
          }

          if (request.url === '/api/fabric-content' && request.method === 'PUT') {
            const body = JSON.parse(await readRequestBody(request)) as unknown

            if (!validateContent(body)) {
              sendJson(response, 400, { error: 'Invalid fabric content payload' })
              return
            }

            const tempPath = `${contentPath}.tmp`
            fs.writeFileSync(tempPath, `${JSON.stringify(body, null, 2)}\n`, 'utf8')
            fs.renameSync(tempPath, contentPath)
            sendJson(response, 200, body)
            return
          }

          if (request.url === '/api/fabric-images' && request.method === 'POST') {
            const body = JSON.parse(await readRequestBody(request)) as JsonBody
            const fileName = typeof body.fileName === 'string' ? body.fileName : ''
            const mimeType = typeof body.mimeType === 'string' ? body.mimeType : ''
            const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : ''
            const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)

            if (!mimeType.startsWith('image/') || !match) {
              sendJson(response, 400, { error: 'Invalid image payload' })
              return
            }

            const safeName = safeImageName(fileName, mimeType)
            await uploadFabricImage(safeName, mimeType, Buffer.from(match[2], 'base64'))
            sendJson(response, 201, { path: `${fabricAssetBaseUrl}/${safeName}` })
            return
          }

          sendJson(response, 405, { error: 'Method not allowed' })
        } catch (error) {
          server.config.logger.error(String(error))
          sendJson(response, 500, { error: 'Fabric admin API failed' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fabricAdminApi()],
})
