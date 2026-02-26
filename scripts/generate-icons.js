// Run once to generate PNG icons from SVG sources.
// Usage: node scripts/generate-icons.js
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const iconSvg = readFileSync(resolve(root, 'public/icon.svg'))
const ogSvg  = readFileSync(resolve(root, 'public/og-image.svg'))

await Promise.all([
  sharp(iconSvg).resize(192, 192).png().toFile(resolve(root, 'public/icon-192.png')),
  sharp(iconSvg).resize(512, 512).png().toFile(resolve(root, 'public/icon-512.png')),
  sharp(iconSvg).resize(180, 180).png().toFile(resolve(root, 'public/apple-touch-icon.png')),
  sharp(ogSvg).resize(1200, 630).png().toFile(resolve(root, 'public/og-image.png')),
])

console.log('Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png, og-image.png')
