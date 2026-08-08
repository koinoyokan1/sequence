// scripts/capture-ui.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  // Configurable target URL and output path
  const TARGET_URL = process.env.URL || 'http://localhost:5173';
  const OUTPUT_DIR = path.join(__dirname, '../.screenshots');
  const OUTPUT_FILE = path.join(OUTPUT_DIR, 'current-ui.png');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Connecting to ${TARGET_URL}...`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 } // Desktop view
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    
    // Take the screenshot
    await page.screenshot({ path: OUTPUT_FILE, fullPage: false });
    
    console.log(`SUCCESS: Screenshot saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`FAILED: Could not take screenshot:`, error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

capture();
