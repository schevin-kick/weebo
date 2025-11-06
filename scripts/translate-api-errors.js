/**
 * DeepL Translation Script for API Error Messages
 *
 * This script translates new API error strings to Traditional Chinese
 * using the DeepL API, preserving the nested JSON structure.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEEPL_API_KEY = '90cc5263-fa94-4d82-bdab-3d3ea2e3d496:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const SOURCE_FILE = path.join(__dirname, '../new-api-error-translations-en.json');
const OUTPUT_FILE = path.join(__dirname, '../new-api-error-translations-zh-tw.json');

// Rate limiting configuration
const RATE_LIMIT_DELAY = 100; // milliseconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // milliseconds

// Statistics
let stats = {
  total: 0,
  translated: 0,
  failed: 0
};

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Translate text using DeepL API
 */
async function translateText(text, retryCount = 0) {
  // Skip empty strings or strings that are just placeholders
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        source_lang: 'EN',
        target_lang: 'ZH-HANT', // Traditional Chinese for Taiwan
        preserve_formatting: '1',
        tag_handling: 'xml', // Preserve XML-like tags (helps with placeholders)
        split_sentences: '0' // Don't split sentences for better context
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    }

    throw new Error('No translation returned from DeepL');
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`   Retry ${retryCount + 1}/${MAX_RETRIES} for: "${text.substring(0, 50)}..."`);
      await sleep(RETRY_DELAY);
      return translateText(text, retryCount + 1);
    }

    console.error(`   ❌ Failed to translate: "${text.substring(0, 50)}..."`);
    console.error(`   Error: ${error.message}`);
    stats.failed++;
    return text; // Return original text on failure
  }
}

/**
 * Recursively traverse and translate JSON object
 */
async function translateObject(obj, path = '') {
  if (typeof obj === 'string') {
    stats.total++;
    const displayPath = path || 'root';
    process.stdout.write(`\r[${stats.translated + stats.failed}/${stats.total}] Translating: ${displayPath.substring(0, 60).padEnd(60)}`);

    const translated = await translateText(obj);
    stats.translated++;

    // Rate limiting
    await sleep(RATE_LIMIT_DELAY);

    return translated;
  }

  if (Array.isArray(obj)) {
    const result = [];
    for (let i = 0; i < obj.length; i++) {
      result.push(await translateObject(obj[i], `${path}[${i}]`));
    }
    return result;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      result[key] = await translateObject(value, newPath);
    }
    return result;
  }

  // For numbers, booleans, null, etc.
  return obj;
}

/**
 * Count total translatable strings
 */
function countStrings(obj) {
  if (typeof obj === 'string') {
    return 1;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countStrings(item), 0);
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).reduce((sum, value) => sum + countStrings(value), 0);
  }

  return 0;
}

/**
 * Main execution
 */
async function main() {
  console.log('🌐 DeepL Translation Script for API Error Messages\n');
  console.log('Configuration:');
  console.log(`  Source: ${SOURCE_FILE}`);
  console.log(`  Output: ${OUTPUT_FILE}`);
  console.log(`  API: DeepL (EN → ZH-HANT)`);
  console.log(`  Rate limit: ${RATE_LIMIT_DELAY}ms delay between requests\n`);

  // Read source file
  console.log('📖 Reading source file...');
  let sourceData;
  try {
    const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');
    sourceData = JSON.parse(sourceContent);
  } catch (error) {
    console.error(`❌ Failed to read source file: ${error.message}`);
    process.exit(1);
  }

  // Count total strings
  const totalStrings = countStrings(sourceData);
  console.log(`   Found ${totalStrings} translatable strings\n`);

  // Start translation
  console.log('🔄 Starting translation...\n');
  const startTime = Date.now();

  try {
    const translatedData = await translateObject(sourceData);

    // Write output file
    console.log('\n\n💾 Writing translated file...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translatedData, null, 2), 'utf8');

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Print summary
    console.log('\n✅ Translation complete!\n');
    console.log('Summary:');
    console.log(`  Total strings: ${stats.total}`);
    console.log(`  Successfully translated: ${stats.translated}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Duration: ${duration}s`);
    console.log(`  Output file: ${OUTPUT_FILE}\n`);

    if (stats.failed > 0) {
      console.log('⚠️  Some translations failed. Review the output file and manually fix any issues.');
    }

  } catch (error) {
    console.error(`\n❌ Translation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
