/**
 * Visualize the board layout in the console
 */

import boardLayoutData from '../src/lib/game-logic/boardLayout.json'

const layout = boardLayoutData.layout

console.log('\n📋 Sequence Board Layout')
console.log('═'.repeat(80))
console.log()

// Print column headers
console.log('      0      1      2      3      4      5      6      7      8      9')
console.log('   ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐')

for (let y = 0; y < 10; y++) {
  let row = ` ${y} │`
  
  for (let x = 0; x < 10; x++) {
    const card = layout[y][x]
    const cellContent = card === null ? 'FREE' : card.padStart(4, ' ')
    row += ` ${cellContent} │`
  }
  
  console.log(row)
  
  if (y < 9) {
    console.log('   ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤')
  }
}

console.log('   └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘')
console.log()
console.log('Legend:')
console.log('  FREE = Free space (corners)')
console.log('  ♥ = Hearts (red)')
console.log('  ♦ = Diamonds (red)')
console.log('  ♣ = Clubs (black)')
console.log('  ♠ = Spades (black)')
console.log()
console.log('═'.repeat(80))
