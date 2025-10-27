const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
  try {
    // Get input path from command line argument or use default
    const inputArg = process.argv[2] || 'logo-input.png';
    const inputPath = path.isAbsolute(inputArg)
      ? inputArg
      : path.join(__dirname, '..', inputArg);

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Error: Input file not found:', inputPath);
      console.log('\nUsage: node scripts/process-logo.js [input-path] [output-path]');
      console.log('Example: node scripts/process-logo.js ~/Downloads/fox-logo.png public/logo.png');
      process.exit(1);
    }

    // Get output path from command line argument or use default
    const outputArg = process.argv[3] || 'public/logo-square.png';
    const outputPath = path.isAbsolute(outputArg)
      ? outputArg
      : path.join(__dirname, '..', outputArg);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log('Original dimensions:', metadata.width, 'x', metadata.height);

    // Determine the size of the square (use the larger dimension)
    const size = Math.max(metadata.width, metadata.height);
    console.log('Square size:', size, 'x', size);

    // Process the image
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png() // Output as PNG to preserve transparency
      .toFile(outputPath);

    console.log('✓ Image processed successfully!');
    console.log('✓ Saved to:', outputPath);
  } catch (error) {
    console.error('Error processing image:', error.message);
  }
}

processLogo();
