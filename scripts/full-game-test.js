#!/usr/bin/env node

/**
 * Full End-to-End Game Testing
 * Simulates 5 complete games with 2 players (mobile + desktop)
 * Tests: game flow, chat, sequences, winner detection, card dealing
 */

const { chromium } = require('playwright');
const path = require('path');

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };
const BASE_URL = `file://${path.resolve(__dirname, '../dist/index.html')}`;
const SCREENSHOT_DIR = path.resolve(__dirname, '../.screenshots/e2e-test');

// Test configuration
const GAMES_TO_PLAY = 5;
const CHAT_MESSAGES = [
  "Good luck!",
  "Nice move!",
  "Great strategy!",
  "Almost there!",
  "Well played!",
  "Let's see how this goes",
  "Interesting choice",
  "Getting close!",
  "This is fun!",
  "Good game!"
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createGame(page, playerName) {
  console.log(`  Creating game as ${playerName}...`);
  
  // Click create game
  await page.click('button:has-text("Create Game")');
  await sleep(1000);
  
  // Enter player name
  await page.fill('input[placeholder*="name" i]', playerName);
  await page.click('button:has-text("Create")');
  await sleep(2000);
  
  // Get game code from URL or page
  const url = page.url();
  const gameId = url.split('/game/')[1];
  
  console.log(`  Game created: ${gameId}`);
  return gameId;
}

async function joinGame(page, gameId, playerName) {
  console.log(`  ${playerName} joining game ${gameId}...`);
  
  await page.goto(`${BASE_URL}#/game/${gameId}`);
  await sleep(1000);
  
  // Enter player name
  await page.fill('input[placeholder*="name" i]', playerName);
  await page.click('button:has-text("Join")');
  await sleep(2000);
  
  console.log(`  ${playerName} joined successfully`);
}

async function sendChatMessage(page, message, playerName) {
  console.log(`  ${playerName}: "${message}"`);
  
  // Open header if needed
  const gameInfoBtn = await page.$('button:has-text("Game Info")');
  if (gameInfoBtn) {
    await gameInfoBtn.click();
    await sleep(300);
  }
  
  // Click chat button
  await page.click('button:has-text("Chat")');
  await sleep(500);
  
  // Type and send message
  await page.fill('input[placeholder*="message" i]', message);
  await page.click('button:has-text("Send")');
  await sleep(500);
  
  // Close chat
  await page.click('button[data-component="chat-close-button"]');
  await sleep(300);
}

async function playTurn(page, playerName) {
  // Check if it's this player's turn
  const yourTurnBtn = await page.$('text=Your Turn!');
  if (!yourTurnBtn) {
    return false; // Not this player's turn
  }
  
  console.log(`  ${playerName}'s turn`);
  
  // Select a card (click first card)
  const cards = await page.$$('[data-component="playing-card"]');
  if (cards.length === 0) {
    console.log(`  ${playerName} has no cards!`);
    return false;
  }
  
  await cards[0].click();
  await sleep(500);
  
  // Find and click a highlighted position
  const highlightedCells = await page.$$('.ring-primary-500');
  if (highlightedCells.length > 0) {
    await highlightedCells[0].click();
    await sleep(1000);
    console.log(`  ${playerName} played a card`);
    return true;
  }
  
  // If no valid moves, try to discard
  const discardBtn = await page.$('button:has-text("Discard")');
  if (discardBtn) {
    await discardBtn.click();
    await sleep(1000);
    console.log(`  ${playerName} discarded a dead card`);
    return true;
  }
  
  console.log(`  ${playerName} has no valid moves`);
  return false;
}

async function checkGameOver(page) {
  const gameOverBanner = await page.$('text=Game Over');
  if (gameOverBanner) {
    const winnerText = await page.$eval('text=/Team (Red|Green) Wins/', el => el.textContent);
    return winnerText;
  }
  return null;
}

async function playFullGame(browser, gameNumber) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎮 GAME ${gameNumber}/${GAMES_TO_PLAY}`);
  console.log('='.repeat(60));
  
  // Create two browser contexts (different sessions)
  const mobileContext = await browser.newContext({ viewport: MOBILE_VIEWPORT });
  const desktopContext = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  
  const mobilePage = await mobileContext.newPage();
  const desktopPage = await desktopContext.newPage();
  
  try {
    // Player 1 (Mobile) creates game
    await mobilePage.goto(BASE_URL);
    await sleep(1000);
    const gameId = await createGame(mobilePage, 'MobilePlayer');
    
    // Player 2 (Desktop) joins game
    await joinGame(desktopPage, gameId, 'DesktopPlayer');
    
    // Wait for game to start
    await sleep(2000);
    
    let turn = 0;
    let maxTurns = 100; // Safety limit
    let chatMessagesSent = 0;
    let winner = null;
    
    while (turn < maxTurns) {
      turn++;
      
      // Alternate turns
      const currentPage = turn % 2 === 1 ? mobilePage : desktopPage;
      const currentPlayer = turn % 2 === 1 ? 'MobilePlayer' : 'DesktopPlayer';
      
      // Play turn
      const played = await playTurn(currentPage, currentPlayer);
      
      if (!played) {
        // If no move was made, switch player
        continue;
      }
      
      // Send chat message occasionally (total 2 per game = 10 across 5 games)
      if (chatMessagesSent < 2 && turn % 5 === 0) {
        const messageIndex = (gameNumber - 1) * 2 + chatMessagesSent;
        await sendChatMessage(currentPage, CHAT_MESSAGES[messageIndex], currentPlayer);
        chatMessagesSent++;
      }
      
      // Check for game over
      winner = await checkGameOver(mobilePage);
      if (!winner) {
        winner = await checkGameOver(desktopPage);
      }
      
      if (winner) {
        console.log(`\n  🏆 ${winner}!`);
        break;
      }
      
      await sleep(500);
    }
    
    if (!winner) {
      console.log(`\n  ⚠️  Game did not finish within ${maxTurns} turns`);
    }
    
    // Take final screenshots
    await mobilePage.screenshot({ 
      path: `${SCREENSHOT_DIR}/game${gameNumber}-mobile-final.png`,
      fullPage: true 
    });
    await desktopPage.screenshot({ 
      path: `${SCREENSHOT_DIR}/game${gameNumber}-desktop-final.png`,
      fullPage: true 
    });
    
    console.log(`\n  Total turns: ${turn}`);
    console.log(`  Chat messages sent: ${chatMessagesSent}`);
    console.log(`  ✅ Game ${gameNumber} complete`);
    
    return { gameNumber, turns: turn, winner, chatMessages: chatMessagesSent };
    
  } catch (error) {
    console.error(`\n  ❌ Error in game ${gameNumber}:`, error.message);
    return { gameNumber, error: error.message };
  } finally {
    await mobilePage.close();
    await desktopPage.close();
    await mobileContext.close();
    await desktopContext.close();
  }
}

async function main() {
  console.log('\n🚀 Starting Full End-to-End Game Testing\n');
  console.log(`Testing ${GAMES_TO_PLAY} complete games`);
  console.log(`Mobile viewport: ${MOBILE_VIEWPORT.width}x${MOBILE_VIEWPORT.height}`);
  console.log(`Desktop viewport: ${DESKTOP_VIEWPORT.width}x${DESKTOP_VIEWPORT.height}\n`);
  
  const browser = await chromium.launch({ headless: false }); // Set to true for headless
  
  const results = [];
  
  for (let i = 1; i <= GAMES_TO_PLAY; i++) {
    const result = await playFullGame(browser, i);
    results.push(result);
    await sleep(2000); // Pause between games
  }
  
  await browser.close();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => !r.error && r.winner);
  const failed = results.filter(r => r.error || !r.winner);
  
  console.log(`\n✅ Successful games: ${successful.length}/${GAMES_TO_PLAY}`);
  console.log(`❌ Failed games: ${failed.length}/${GAMES_TO_PLAY}`);
  
  const totalChatMessages = results.reduce((sum, r) => sum + (r.chatMessages || 0), 0);
  console.log(`💬 Total chat messages: ${totalChatMessages}/10`);
  
  console.log('\nGame Results:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  Game ${r.gameNumber}: ❌ Error - ${r.error}`);
    } else {
      console.log(`  Game ${r.gameNumber}: ${r.winner || 'No winner'} (${r.turns} turns, ${r.chatMessages} chats)`);
    }
  });
  
  console.log('\n🎉 Testing complete!\n');
}

main().catch(console.error);
