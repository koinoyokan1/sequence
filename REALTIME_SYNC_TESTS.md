# Realtime Synchronization Test Suite

## Overview

Comprehensive test suite to validate realtime synchronization, prevent race conditions, and catch edge cases in multiplayer gameplay.

## Test Files

### 1. `src/hooks/__tests__/useGame.realtime.test.ts`
**Tests for optimistic updates and race conditions**

#### Coverage:
- ✅ **Optimistic Updates**
  - UI updates happen immediately (< 100ms) before database call
  - Rollback on RPC error restores original state
  
- ✅ **Race Conditions**
  - Rapid successive moves without state corruption
  - Concurrent RPC calls completing out of order
  - No filtering of database updates after optimistic update

#### Key Tests:
```typescript
// Validates optimistic update speed
it('should update local state immediately before database call')

// Validates error recovery
it('should rollback optimistic updates on RPC error')

// Validates concurrent operations
it('should handle rapid successive moves without state corruption')
it('should handle concurrent RPC calls completing out of order')

// Validates realtime integration
it('should not filter database updates after optimistic update')
```

### 2. `src/hooks/__tests__/useRealtime.sync.test.ts`
**Tests for multi-client synchronization**

#### Coverage:
- ✅ **Database Update Synchronization**
  - All database updates applied regardless of turn number
  - INSERT, UPDATE, DELETE events handled correctly
  - No stale data filtering
  
- ✅ **Concurrent Player Updates**
  - Simultaneous updates from multiple players
  - Updates arriving out of order
  - Database is always source of truth

- ✅ **Player List Synchronization**
  - Refetch players on any player change

#### Key Tests:
```typescript
// No turn number filtering
it('should apply all database updates regardless of turn number')

// Event handling
it('should handle INSERT events')
it('should handle DELETE events')

// Concurrency
it('should handle simultaneous updates from multiple players')
it('should handle updates arriving out of order')
```

### 3. `src/hooks/__tests__/useGame.edgecases.test.ts`
**Tests for edge cases and error scenarios**

#### Coverage:
- ✅ **Network Failures**
  - Deck fetch network error
  - RPC network timeout
  - Database connection loss during RPC
  
- ✅ **Invalid Game States**
  - Prevent move when not player's turn
  - Prevent move when no card selected
  - Prevent move when game is null

- ✅ **Concurrent Move Attempts**
  - Double-click on same card

- ✅ **Empty Deck Scenarios**
  - Empty draw pile handled gracefully

#### Key Tests:
```typescript
// Network resilience
it('should handle deck fetch network error')
it('should handle RPC network timeout')
it('should handle database connection loss during RPC')

// State validation
it('should prevent move when not player turn')
it('should prevent move when no card selected')
it('should prevent move when game is null')

// Edge cases
it('should handle double-click on same card')
it('should handle empty draw pile gracefully')
```

### 4. `src/__tests__/integration/multiplayer.sync.test.ts`
**End-to-end integration tests**

#### Coverage:
- ✅ **Two-Player Synchronization**
  - Player 1 makes move, Player 2 sees update via realtime
  - Both players see identical state
  - Simulates real database + realtime flow

#### Key Tests:
```typescript
// Full flow validation
it('should sync board state between two players', async () => {
  // 1. Player 1 makes move
  // 2. Database updates
  // 3. Realtime fires to Player 2
  // 4. Verify both see same turn number
})
```

## Running the Tests

### Run all tests:
```bash
npm test
```

### Run specific test file:
```bash
npm test useGame.realtime.test
npm test useRealtime.sync.test
npm test useGame.edgecases.test
npm test multiplayer.sync.test
```

### Run with coverage:
```bash
npm test -- --coverage
```

### Run in watch mode:
```bash
npm test -- --watch
```

## What These Tests Prevent

### ❌ Race Conditions
- **Problem**: Optimistic update happens, database update completes, realtime fires, but local state filters it as "stale"
- **Prevention**: Tests verify all realtime updates are applied

### ❌ State Inconsistency
- **Problem**: Player 1 sees different board than Player 2
- **Prevention**: Integration tests validate both players see identical state

### ❌ Update Filtering
- **Problem**: Turn number check blocks valid database updates
- **Prevention**: Tests verify no turn-based filtering exists

### ❌ Network Failures
- **Problem**: App crashes on network error
- **Prevention**: Tests verify graceful error handling and rollback

### ❌ Concurrent Moves
- **Problem**: Multiple moves in quick succession corrupt state
- **Prevention**: Tests verify rapid moves are handled correctly

## Test Patterns Used

### 1. Mock-Based Unit Tests
```typescript
vi.mock('@/lib/supabase')
vi.mock('@/stores/gameStore')
```
Isolates component logic from dependencies

### 2. Timing Tests
```typescript
const startTime = Date.now()
// ... operation ...
const elapsed = Date.now() - startTime
expect(elapsed).toBeLessThan(100)
```
Validates performance requirements

### 3. Callback Capture
```typescript
let realtimeCallbacks = {}
mockChannel.on = vi.fn((event, config, callback) => {
  realtimeCallbacks[`${config.table}_${config.event}`] = callback
})
// Later: simulate realtime event
realtimeCallbacks['games_*']({ new: gameData })
```
Simulates realtime events

### 4. State Snapshots
```typescript
const originalState = { ...currentState }
// ... operation that might fail ...
expect(currentState).toEqual(originalState) // Verify rollback
```
Validates rollback behavior

## Future Test Additions

- [ ] Test for sequence detection synchronization
- [ ] Test for chat message synchronization
- [ ] Test for player disconnect/reconnect
- [ ] Load testing with 100+ concurrent updates
- [ ] WebSocket connection failure recovery
- [ ] Browser tab visibility change handling

## Continuous Integration

These tests run automatically on:
- Every commit (via GitHub Actions)
- Every pull request
- Before deployment

Deployment is blocked if tests fail.
