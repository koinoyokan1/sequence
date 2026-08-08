// scripts/test-chat.js
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  targetUrl: process.env.URL || 'http://localhost:5173',
  basePath: '/sequence',
  screenshotsDir: path.join(__dirname, '../.screenshots'),
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

async function testChatUI(viewport, mode) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport });
  
  try {
    console.log(`\n🧪 Testing Chat in ${mode} mode (${viewport.width}x${viewport.height})`);
    
    // Navigate to create game
    const createUrl = `${CONFIG.targetUrl}${CONFIG.basePath}/create`;
    await page.goto(createUrl, { waitUntil: 'networkidle' });
    
    // Create game
    await page.fill('input[placeholder*="name" i], input[type="text"]', 'TestPlayer');
    const teamButtons = await page.locator('button').all();
    for (const btn of teamButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Red')) {
        await btn.click();
        break;
      }
    }
    await page.click('button:has-text("Create Game")');
    await page.waitForURL(/\/sequence\/lobby\//, { timeout: 10000 });
    
    // Get invite code
    const inviteCodeText = await page.locator('text=/[A-Z0-9]{6}/').first().textContent();
    const inviteCode = inviteCodeText?.match(/[A-Z0-9]{6}/)?.[0];
    
    if (inviteCode) {
      // Add second player
      const page2 = await browser.newPage({ viewport });
      await page2.goto(`${CONFIG.targetUrl}${CONFIG.basePath}/join`, { waitUntil: 'networkidle' });
      await page2.fill('input[placeholder*="code" i], input[type="text"]:first-of-type', inviteCode);
      await page2.fill('input[placeholder*="name" i], input[type="text"]:nth-of-type(2)', 'Player2');
      
      const team2Buttons = await page2.locator('button').all();
      for (const btn of team2Buttons) {
        const text = await btn.textContent();
        if (text && text.includes('Green')) {
          await btn.click();
          break;
        }
      }
      
      await page2.click('button:has-text("Join Game")');
      await page2.waitForURL(/\/sequence\/lobby\//, { timeout: 10000 });
      
      // Both ready
      await page.click('button:has-text("Ready")');
      await page2.click('button:has-text("Ready")');
      await page.waitForTimeout(1000);
      
      // Start game
      await page.click('button:has-text("Start Game")');
      await page.waitForURL(/\/sequence\/game\//, { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Capture: Collapsed header
      await page.screenshot({ 
        path: path.join(CONFIG.screenshotsDir, `${mode}-1-collapsed.png`),
        fullPage: true 
      });
      console.log(`📸 Captured: ${mode}-1-collapsed.png`);
      
      // Expand header
      const showHeaderBtn = page.locator('[data-component="header-toggle-button"]');
      if (await showHeaderBtn.count() > 0) {
        await showHeaderBtn.click();
        await page.waitForTimeout(500);
      }
      
      // Capture: Expanded header
      await page.screenshot({ 
        path: path.join(CONFIG.screenshotsDir, `${mode}-2-expanded.png`),
        fullPage: true 
      });
      console.log(`📸 Captured: ${mode}-2-expanded.png`);
      
      // Click chat button
      const chatBtn = page.locator('[data-component="chat-open-button"]');
      if (await chatBtn.count() > 0) {
        await chatBtn.click();
        await page.waitForTimeout(500);
      }
      
      // Capture: Chat modal open
      await page.screenshot({ 
        path: path.join(CONFIG.screenshotsDir, `${mode}-3-chat-open.png`),
        fullPage: true 
      });
      console.log(`📸 Captured: ${mode}-3-chat-open.png`);
      
      // Type a test message
      const chatInput = page.locator('[data-component="chat-input-field"]');
      if (await chatInput.count() > 0) {
        await chatInput.fill('Hello! Testing chat UI 👋');
        await page.waitForTimeout(300);
      }
      
      // Capture: Message typed
      await page.screenshot({ 
        path: path.join(CONFIG.screenshotsDir, `${mode}-4-message-typed.png`),
        fullPage: true 
      });
      console.log(`📸 Captured: ${mode}-4-message-typed.png`);
      
      await page2.close();
    }
    
    console.log(`✅ ${mode} mode testing complete!`);
    
  } catch (error) {
    console.error(`❌ Error in ${mode} mode:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runTests() {
  console.log('🚀 Starting Chat UI Tests\n');
  
  // Test Desktop
  await testChatUI({ width: 1280, height: 800 }, 'desktop');
  
  // Test Mobile
  await testChatUI({ width: 375, height: 812 }, 'mobile');
  
  console.log('\n🎉 All tests complete!');
  console.log(`📁 Screenshots saved to: ${CONFIG.screenshotsDir}`);
}

runTests();
