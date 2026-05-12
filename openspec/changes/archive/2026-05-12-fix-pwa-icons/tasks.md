## 1. Asset Preparation

- [x] 1.1 Extract the inline SVG favicon from `app-web/src/index.html` into a temporary `.svg` file
- [x] 1.2 Verify ImageMagick `convert` is available and can rasterize SVG to PNG

## 2. Generate PNG Icons

- [x] 2.1 Generate `icon-72x72.png` in `app-web/public/icons/`
- [x] 2.2 Generate `icon-96x96.png` in `app-web/public/icons/`
- [x] 2.3 Generate `icon-128x128.png` in `app-web/public/icons/`
- [x] 2.4 Generate `icon-144x144.png` in `app-web/public/icons/`
- [x] 2.5 Generate `icon-152x152.png` in `app-web/public/icons/`
- [x] 2.6 Generate `icon-192x192.png` in `app-web/public/icons/`
- [x] 2.7 Generate `icon-384x384.png` in `app-web/public/icons/`
- [x] 2.8 Generate `icon-512x512.png` in `app-web/public/icons/`

## 3. Generate favicon.ico

- [x] 3.1 Generate multi-resolution `favicon.ico` (256×256, 64×64, 32×32, 16×16) in `app-web/public/`

## 4. Verification

- [x] 4.1 Confirm `manifest.webmanifest` paths remain unchanged and all icon files exist
- [x] 4.2 Confirm `index.html` references to icons remain unchanged
- [x] 4.3 Clean up temporary SVG file
