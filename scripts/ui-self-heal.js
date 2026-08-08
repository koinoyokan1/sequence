// scripts/ui-self-heal.js
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  targetUrl: process.env.URL || 'http://localhost:5173',
  basePath: '/sequence', // Base path from vite.config.ts
  screenshotPath: path.join(__dirname, '../.screenshots/current.png'),
  maxIterations: 5,
};

// 1. Helper to take a screenshot
async function captureScreenshot(specificUrl = null) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    const url = specificUrl || CONFIG.targetUrl;
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for React to render
    await page.waitForTimeout(1000);

    await page.screenshot({ path: CONFIG.screenshotPath, fullPage: true });
    console.log(`📸 Screenshot captured: ${CONFIG.screenshotPath}`);

    return page.url(); // Return final URL in case of redirects
  } finally {
    await browser.close();
  }
}

// 2. Helper to create a test game and navigate to it
async function setupTestGame() {
  const browser = await chromium.launch({ headless: false }); // Launch visible browser for debugging
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    console.log('🎮 Setting up test game...');

    // Navigate to create game page (with base path)
    const createUrl = `${CONFIG.targetUrl}${CONFIG.basePath}/create`;
    console.log(`🌐 Navigating to: ${createUrl}`);
    await page.goto(createUrl, { waitUntil: 'networkidle' });

    // Fill in player name
    await page.fill('input[placeholder*="name" i], input[type="text"]', 'TestPlayer');

    // Select team (click first team option)
    const teamButtons = await page.locator('button').all();
    for (const btn of teamButtons) {
      const text = await btn.textContent();
      if (text && text.includes('Red')) {
        await btn.click();
        break;
      }
    }

    // Click Create Game button
    await page.click('button:has-text("Create Game")');

    // Wait for redirect to lobby (with base path)
    await page.waitForURL(/\/sequence\/lobby\//, { timeout: 10000 });
    console.log('📋 Reached lobby page');

    // Add a second player (optional - for better testing)
    const gameUrl = page.url();
    const gameIdMatch = gameUrl.match(/\/sequence\/lobby\/([^\/]+)/);
    const gameId = gameIdMatch ? gameIdMatch[1] : null;

    if (gameId) {
      console.log(`🎲 Game ID: ${gameId}`);

      // Open a second browser context to add another player
      console.log('👥 Adding second player...');
      const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });

      // Get invite code from first page
      const inviteCodeText = await page.locator('text=/[A-Z0-9]{6}/').first().textContent();
      const inviteCode = inviteCodeText?.match(/[A-Z0-9]{6}/)?.[0];

      if (inviteCode) {
        console.log(`🎫 Invite code: ${inviteCode}`);

        // Join game with second player
        await page2.goto(`${CONFIG.targetUrl}${CONFIG.basePath}/join`, { waitUntil: 'networkidle' });
        await page2.fill('input[placeholder*="code" i], input[type="text"]:first-of-type', inviteCode);
        await page2.fill('input[placeholder*="name" i], input[type="text"]:nth-of-type(2)', 'Player2');

        // Select team 2
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

        // Both players ready
        await page.click('button:has-text("Ready")');
        await page2.click('button:has-text("Ready")');
        await page.waitForTimeout(1000);

        // Start game from first player (host)
        await page.click('button:has-text("Start Game")');
        await page.waitForURL(/\/sequence\/game\//, { timeout: 10000 });
        console.log('✅ Game started! On game page');

        const finalUrl = page.url();
        await page2.close();
        await browser.close();
        return finalUrl;
      }
    }

    await browser.close();
    return null;
  } catch (error) {
    console.error('❌ Error setting up test game:', error.message);
    await browser.close();
    return null;
  }
}

// 3. Main Self-Iteration Loop
async function runSelfHealLoop(userGoal, gameUrl = null) {
  console.log(`🚀 Starting UI Self-Improvement Loop for goal: "${userGoal}"\n`);

  for (let iteration = 1; iteration <= CONFIG.maxIterations; iteration++) {
    console.log(`--- Iteration ${iteration} of ${CONFIG.maxIterations} ---`);

    // Step A: Capture the updated UI
    const finalUrl = await captureScreenshot(gameUrl);
    console.log(`📍 Current URL: ${finalUrl}`);

    // Step B: Encode screenshot to Base64 for Vision API
    const imageBase64 = fs.readFileSync(CONFIG.screenshotPath).toString('base64');

    // Step C: Build the prompt for the vision model / CLI
    const prompt = `
Goal: ${userGoal}
Current Iteration: ${iteration}

Look at the attached screenshot of the current render (.screenshots/current.png).
Evaluate if the layout, alignment, colors, or responsiveness match the goal.

If the UI is complete and correct:
Reply with "DONE: <brief reason>"

If the UI needs fixes:
Identify which file(s) need changes and provide the code edits required.
`;

    console.log(`🤖 Prompting Agent with visual context...`);
    console.log(`📊 Screenshot size: ${Math.round(imageBase64.length / 1024)}KB`);

    /*
      Step D: Execute Augment CLI or Vision Model API call here.
      Example with Augment CLI / Agent API:
      const output = execSync(`augment prompt "${prompt}" --image ${CONFIG.screenshotPath}`).toString();
    */

    // Mock check for loop exit
    // If agent returns "DONE", exit early
    // if (agentResponse.includes("DONE")) {
    //   console.log("🎉 UI Goal achieved successfully!");
    //   break;
    // }

    console.log(`⏳ Waiting for dev server reload...`);
    // Give hot-module reloading (HMR) 2 seconds to refresh before taking next screenshot
    await new Promise((res) => setTimeout(res, 2000));
  }

  console.log('\n✅ Self-heal loop completed!');
  console.log(`📸 Final screenshot: ${CONFIG.screenshotPath}`);
}

// Run the script with your prompt
const goal = process.argv[2] || 'Analyze the Sequence game UI for improvements';
const setupGame = process.argv.includes('--setup-game');

(async () => {
  let gameUrl = null;

  if (setupGame) {
    console.log('🎮 --setup-game flag detected. Creating test game...\n');
    gameUrl = await setupTestGame();

    if (!gameUrl) {
      console.error('❌ Failed to setup test game. Using default URL.');
    } else {
      console.log(`\n✅ Test game ready at: ${gameUrl}\n`);
    }
  }

  await runSelfHealLoop(goal, gameUrl);
})();
