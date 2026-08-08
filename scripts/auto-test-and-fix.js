// scripts/auto-test-and-fix.js
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  targetUrl: process.env.URL || 'http://localhost:5173',
  basePath: '/sequence',
  screenshotsDir: path.join(__dirname, '../.screenshots/auto-test'),
  reportPath: path.join(__dirname, '../test-report.json'),
};

// Ensure directories exist
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: { passed: 0, failed: 0, warnings: 0 }
};

function logTest(name, status, details = {}) {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  testResults.tests.push(result);

  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}`);
  if (details.message) console.log(`   ${details.message}`);

  if (status === 'PASS') testResults.summary.passed++;
  else if (status === 'FAIL') testResults.summary.failed++;
  else testResults.summary.warnings++;
}

async function setupGame(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const page2 = await browser.newPage({ viewport });

  try {
    // Create game
    await page.goto(`${CONFIG.targetUrl}${CONFIG.basePath}/create`, { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', 'TestPlayer');

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

    if (!inviteCode) throw new Error('No invite code found');

    // Join with second player
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

    // Both ready and start
    await page.click('button:has-text("Ready")');
    await page2.click('button:has-text("Ready")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Start Game")');
    await page.waitForURL(/\/sequence\/game\//, { timeout: 10000 });
    await page.waitForTimeout(2000);

    return { page, page2, inviteCode };
  } catch (error) {
    await page.close();
    await page2.close();
    throw error;
  }
}

async function testHeaderCollapsibility(page, mode) {
  try {
    // Check collapsed state
    const toggleBtn = await page.locator('[data-component="header-toggle-button"]').count();
    if (toggleBtn === 0) {
      logTest(`${mode}: Header toggle button exists`, 'FAIL', { message: 'Toggle button not found' });
      return false;
    }
    logTest(`${mode}: Header toggle button exists`, 'PASS');

    // Expand header
    await page.locator('[data-component="header-toggle-button"]').click();
    await page.waitForTimeout(500);

    // Check expanded elements
    const gameCode = await page.locator('[data-component="game-code"]').count();
    const team1Info = await page.locator('[data-component="team1-info"]').count();
    const team2Info = await page.locator('[data-component="team2-info"]').count();
    const chatBtn = await page.locator('[data-component="chat-open-button"]').count();

    if (gameCode === 0 || team1Info === 0 || team2Info === 0 || chatBtn === 0) {
      logTest(`${mode}: Header expansion shows all elements`, 'FAIL', {
        message: `Missing: gameCode:${gameCode} team1:${team1Info} team2:${team2Info} chat:${chatBtn}`
      });
      return false;
    }
    logTest(`${mode}: Header expansion shows all elements`, 'PASS');

    // Collapse again
    await page.locator('[data-component="header-toggle-button"]').click();
    await page.waitForTimeout(500);

    const expandedVisible = await page.locator('[data-component="header-expanded-container"]').isVisible();
    if (expandedVisible) {
      logTest(`${mode}: Header collapse works`, 'FAIL', { message: 'Header still visible after collapse' });
      return false;
    }
    logTest(`${mode}: Header collapse works`, 'PASS');


    return true;
  } catch (error) {
    logTest(`${mode}: Header collapse/expand`, 'FAIL', { message: error.message });
    return false;
  }
}

async function testChatFunctionality(page, mode) {
  try {
    // Expand header first
    await page.locator('[data-component="header-toggle-button"]').click();
    await page.waitForTimeout(500);

    // Open chat
    await page.locator('[data-component="chat-open-button"]').click();
    await page.waitForTimeout(500);

    // Check chat modal visible
    const modalVisible = await page.locator('[data-component="chat-modal"]').isVisible();
    if (!modalVisible) {
      logTest(`${mode}: Chat modal opens`, 'FAIL', { message: 'Modal not visible' });
      return false;
    }
    logTest(`${mode}: Chat modal opens`, 'PASS');

    // Check input field visibility
    const inputField = page.locator('[data-component="chat-input-field"]');
    const inputVisible = await inputField.isVisible();
    const inputBox = await inputField.boundingBox();

    if (!inputVisible || !inputBox) {
      logTest(`${mode}: Chat input field visible`, 'FAIL', { message: 'Input not visible' });
      return false;
    }

    // Check if input is within viewport
    const viewport = page.viewportSize();
    if (inputBox.y + inputBox.height > viewport.height) {
      logTest(`${mode}: Chat input within viewport`, 'FAIL', {
        message: `Input at ${inputBox.y + inputBox.height}px exceeds viewport ${viewport.height}px`
      });
      return false;
    }
    logTest(`${mode}: Chat input within viewport`, 'PASS');

    // Test typing
    await inputField.fill('Test message 🎮');
    const value = await inputField.inputValue();
    if (value !== 'Test message 🎮') {
      logTest(`${mode}: Chat input accepts text`, 'FAIL', { message: 'Input value mismatch' });
      return false;
    }
    logTest(`${mode}: Chat input accepts text`, 'PASS');

    // Check send button
    const sendBtn = page.locator('[data-component="chat-send-button"]');
    const sendEnabled = await sendBtn.isEnabled();
    if (!sendEnabled) {
      logTest(`${mode}: Send button enabled with text`, 'FAIL', { message: 'Button disabled' });
      return false;
    }
    logTest(`${mode}: Send button enabled with text`, 'PASS');

    // Clear and check disabled
    await inputField.fill('');
    const sendDisabled = await sendBtn.isDisabled();
    if (!sendDisabled) {
      logTest(`${mode}: Send button disabled when empty`, 'WARN', { message: 'Should be disabled' });
    } else {
      logTest(`${mode}: Send button disabled when empty`, 'PASS');
    }

    // Close chat
    await page.locator('[data-component="chat-close-button"]').click();
    await page.waitForTimeout(500);

    const modalClosed = await page.locator('[data-component="chat-modal"]').isHidden();
    if (!modalClosed) {
      logTest(`${mode}: Chat modal closes`, 'FAIL', { message: 'Modal still visible' });
      return false;
    }
    logTest(`${mode}: Chat modal closes`, 'PASS');

    return true;
  } catch (error) {
    logTest(`${mode}: Chat functionality`, 'FAIL', { message: error.message });
    return false;
  }
}

async function testTeamColorCoding(page, mode) {
  try {
    // Make sure header is expanded and chat is closed
    const headerExpanded = await page.locator('[data-component="header-expanded-container"]').isVisible();
    if (!headerExpanded) {
      await page.locator('[data-component="header-toggle-button"]').click();
      await page.waitForTimeout(500);
    }

    const team1Names = page.locator('[data-component="team1-names"]');
    const team2Names = page.locator('[data-component="team2-names"]');

    const team1Color = await team1Names.evaluate(el => window.getComputedStyle(el).color);
    const team2Color = await team2Names.evaluate(el => window.getComputedStyle(el).color);

    // Check if colors are different
    if (team1Color === team2Color) {
      logTest(`${mode}: Team name colors distinct`, 'FAIL', { message: 'Same color for both teams' });
      return false;
    }
    logTest(`${mode}: Team name colors distinct`, 'PASS');

    return true;
  } catch (error) {
    logTest(`${mode}: Team color coding`, 'FAIL', { message: error.message });
    return false;
  }
}

async function runTestsForMode(browser, mode, viewport) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🧪 Testing ${mode.toUpperCase()} Mode (${viewport.width}x${viewport.height})`);
  console.log('='.repeat(50));

  let gameSetup;
  try {
    gameSetup = await setupGame(browser, viewport);
    logTest(`${mode}: Game setup`, 'PASS');
  } catch (error) {
    logTest(`${mode}: Game setup`, 'FAIL', { message: error.message });
    return;
  }

  const { page, page2 } = gameSetup;

  try {
    await testHeaderCollapsibility(page, mode);
    await testChatFunctionality(page, mode);
    await testTeamColorCoding(page, mode);

    await page.screenshot({
      path: path.join(CONFIG.screenshotsDir, `${mode}-final.png`),
      fullPage: true
    });

  } finally {
    await page.close();
    await page2.close();
  }
}

async function main() {
  console.log('🚀 Starting Automated UI Testing & Validation\n');

  const browser = await chromium.launch({ headless: true });

  try {
    await runTestsForMode(browser, 'desktop', { width: 1280, height: 800 });
    await runTestsForMode(browser, 'mobile', { width: 375, height: 812 });
  } finally {
    await browser.close();
  }

  fs.writeFileSync(CONFIG.reportPath, JSON.stringify(testResults, null, 2));

  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed:  ${testResults.summary.passed}`);
  console.log(`❌ Failed:  ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`📄 Full report: ${CONFIG.reportPath}`);

  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

main();