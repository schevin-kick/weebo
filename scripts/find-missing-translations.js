/**
 * Find Missing Translations Script
 * Compares en.json and zh-tw.json to find untranslated keys
 */

const fs = require('fs');
const path = require('path');

const EN_FILE = path.join(__dirname, '../src/messages/en.json');
const ZH_TW_FILE = path.join(__dirname, '../src/messages/zh-tw.json');
const OUTPUT_FILE = path.join(__dirname, '../new-translations-en.json');

/**
 * Get all paths in an object
 */
function getAllPaths(obj, prefix = '') {
  const paths = {};

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      paths[currentPath] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(paths, getAllPaths(value, currentPath));
    } else {
      // Handle arrays and other types
      paths[currentPath] = value;
    }
  }

  return paths;
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested value in object using dot notation path
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding Missing Translations\n');

  // Read files
  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
  const zhTwData = JSON.parse(fs.readFileSync(ZH_TW_FILE, 'utf8'));

  // Get all paths
  const enPaths = getAllPaths(enData);
  const zhTwPaths = getAllPaths(zhTwData);

  // Find missing paths
  const missingPaths = Object.keys(enPaths).filter(path => !(path in zhTwPaths));

  console.log(`📊 Statistics:`);
  console.log(`  English keys: ${Object.keys(enPaths).length}`);
  console.log(`  Chinese keys: ${Object.keys(zhTwPaths).length}`);
  console.log(`  Missing: ${missingPaths.length}\n`);

  if (missingPaths.length === 0) {
    console.log('✅ No missing translations found!');
    return;
  }

  // Build new translations object
  const newTranslations = {};

  console.log('📝 Missing translations:');
  for (const path of missingPaths) {
    const value = getNestedValue(enData, path);
    setNestedValue(newTranslations, path, value);
    console.log(`  - ${path}`);
  }

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newTranslations, null, 2), 'utf8');

  console.log(`\n✅ Created: ${OUTPUT_FILE}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Run: node scripts/translate-new.js`);
  console.log(`  2. Review: new-translations-zh-tw.json`);
  console.log(`  3. Manually merge into src/messages/zh-tw.json`);
}

main();
