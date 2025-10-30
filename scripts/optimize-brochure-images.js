const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../public/brochure');
const images = [
  'calendar-view.png',
  'booking-modal.png',
  'form-builder.png',
  'mobile-form.png'
];

async function optimizeImages() {
  console.log('Starting image optimization...\n');

  for (const image of images) {
    const inputPath = path.join(inputDir, image);
    const outputPath = path.join(inputDir, image.replace('.png', '.webp'));

    if (!fs.existsSync(inputPath)) {
      console.log(`❌ File not found: ${image}`);
      continue;
    }

    try {
      const metadata = await sharp(inputPath).metadata();
      console.log(`Processing ${image}:`);
      console.log(`  Original: ${metadata.format}, ${metadata.width}x${metadata.height}, ${(metadata.size / 1024).toFixed(2)} KB`);

      // Create optimized WebP version (max width 1200px for display)
      const displayWidth = Math.min(metadata.width, 1200);

      await sharp(inputPath)
        .resize(displayWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality: 85,
          effort: 6
        })
        .toFile(outputPath);

      const outputMetadata = await sharp(outputPath).metadata();
      console.log(`  Optimized: ${outputMetadata.format}, ${outputMetadata.width}x${outputMetadata.height}, ${(outputMetadata.size / 1024).toFixed(2)} KB`);
      console.log(`  ✅ Saved: ${path.basename(outputPath)}`);
      console.log(`  💾 Size reduction: ${((1 - outputMetadata.size / metadata.size) * 100).toFixed(1)}%\n`);
    } catch (error) {
      console.error(`❌ Error processing ${image}:`, error.message);
    }
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages().catch(console.error);
