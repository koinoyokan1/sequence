#!/usr/bin/env node

/**
 * Full Game Demonstration Script
 * Opens 2 browsers side-by-side and plays through a complete game
 */

import playwright from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173/sequence/';
const SCREENSHOT_DIR = path.join(__dirname, '..', '.screenshots', 'demo');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshots(page1, page2, name) {
  await Promise.all([
    page1.screenshot({ path: path.join(SCREENSHOT_DIR, `player1-${name}.png`) }),
    page2.screenshot({ path: path.join(SCREENSHOT_DIR, `player2-${name}.png`) })
  ]);
  console.log(`📸 Captured: ${name}`);
}

async function main() {
  console.log('🎮 Starting Full Game Demo\n');

  // Launch browsers side by side
  const browser1 = await playwright.chromium.launch({ 
    headless: false,
    args: ['--window-position=0,0', '--window-size=960,1080']
  });
  
  const browser2 = await playwright.chromium.launch({ 
    headless: false,
    args: ['--window-position=960,0', '--window-size=960,1080']
  });

  const context1 = await browser1.newContext({ viewport: { width: 960, height: 1080 } });
  const context2 = await browser2.newContext({ viewport: { width: 960, height: 1080 } });

  const player1 = await context1.newPage();
  const player2 = await context2.newPage();

  try {
    console.log('👤 Player 1: Creating game...');
    await player1.goto(BASE_URL);
    await sleep(1000);
    await captureScreenshots(player1, player2, '01-landing');

    // Player 1 creates game
    await player1.click('text=Create Game');
    await sleep(500);
    await player1.fill('input[placeholder="Enter your name"]', 'Alice');
    await captureScreenshots(player1, player2, '02-create-game');
    
    await player1.click('button:has-text("Create Game")');
    await sleep(3000);

    // Get invite code from lobby
    await player1.waitForSelector('text=Game Lobby', { timeout: 10000 });
    const inviteCodeElement = await player1.locator('.text-4xl.font-mono.font-bold.text-primary-400').first();
    const inviteCode = (await inviteCodeElement.textContent()).trim();
    console.log(`📋 Invite Code: ${inviteCode}`);
    await captureScreenshots(player1, player2, '03-lobby-waiting');

    // Player 2 joins game
    console.log('👤 Player 2: Joining game...');
    await player2.goto(BASE_URL);
    await sleep(1000);
    await player2.click('text=Join Game');
    await sleep(1000);
    await sleep(500);
    await player2.fill('input[placeholder="Enter 6-digit code"]', inviteCode);
    await player2.fill('input[placeholder="Enter your name"]', 'Bob');
    await captureScreenshots(player1, player2, '04-join-game');
    
    await player2.click('button:has-text("Join Game")');
    await sleep(2000);
    await captureScreenshots(player1, player2, '05-lobby-both-players');

    // Both players ready
    console.log('✅ Both players marking ready...');
    await player1.click('button:has-text("Ready")');
    await sleep(500);
    await player2.click('button:has-text("Ready")');
    await sleep(1000);
    await captureScreenshots(player1, player2, '06-both-ready');

    // Player 1 starts game
    console.log('🚀 Starting game...');
    await player1.click('button:has-text("Start Game")');
    await sleep(3000);
    await captureScreenshots(player1, player2, '07-game-started');

    console.log('\n🎲 Playing game...\n');

    // Play several turns
    for (let turn = 1; turn <= 10; turn++) {
      console.log(`Turn ${turn}:`);
      
      // Check whose turn it is
      const player1Turn = await player1.locator('text=Your Turn!').isVisible().catch(() => false);
      const player2Turn = await player2.locator('text=Your Turn!').isVisible().catch(() => false);

      if (player1Turn) {
        console.log('  👉 Player 1 (Alice) playing...');
        await playTurn(player1, turn, 'player1');
        await captureScreenshots(player1, player2, `08-turn-${turn}-p1`);
      } else if (player2Turn) {
        console.log('  👉 Player 2 (Bob) playing...');
        await playTurn(player2, turn, 'player2');
        await captureScreenshots(player1, player2, `08-turn-${turn}-p2`);
      }

      await sleep(2000);

      // Check for game over
      const gameOver1 = await player1.locator('text=Game Over').isVisible().catch(() => false);
      const gameOver2 = await player2.locator('text=Game Over').isVisible().catch(() => false);
      
      if (gameOver1 || gameOver2) {
        console.log('\n🎉 GAME OVER!');
        await captureScreenshots(player1, player2, '09-game-over');
        break;
      }
    }

    console.log('\n✅ Demo complete! Screenshots saved to:', SCREENSHOT_DIR);
    console.log('\n⏸️  Browsers will stay open for 30 seconds for you to explore...');
    await sleep(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await captureScreenshots(player1, player2, 'error');
  } finally {
    await browser1.close();
    await browser2.close();
  }
}

async function playTurn(page, turnNumber, playerName) {
  try {
    // Click the first card in hand
    const cards = await page.locator('[data-component="player-card"]').all();
    if (cards.length > 0) {
      await cards[0].click();
      await sleep(500);

      // Look for highlighted board cells
      const highlightedCells = await page.locator('[data-component="board-cell"]').all();
      
      // Find a highlighted cell (with ring-4 class)
      for (const cell of highlightedCells) {
        const classes = await cell.getAttribute('class');
        if (classes && classes.includes('ring-4')) {
          await cell.click();
          console.log(`    ✓ Played card successfully`);
          return;
        }
      }
    }
  } catch (error) {
    console.log(`    ⚠️ Could not play card: ${error.message}`);
  }
}

main().catch(console.error);
