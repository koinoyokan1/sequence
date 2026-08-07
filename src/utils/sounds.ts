// Sound utility for game notifications using Web Audio API

let audioContext: AudioContext | null = null

// Initialize audio context (must be done after user interaction)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a turn notification sound
 * A pleasant two-tone notification sound
 */
export function playTurnNotification() {
  try {
    const ctx = getAudioContext()
    
    // Create oscillator for first tone
    const oscillator1 = ctx.createOscillator()
    const gainNode1 = ctx.createGain()
    
    oscillator1.connect(gainNode1)
    gainNode1.connect(ctx.destination)
    
    // First tone: 800 Hz
    oscillator1.frequency.value = 800
    oscillator1.type = 'sine'
    
    // Envelope for smooth sound
    gainNode1.gain.setValueAtTime(0, ctx.currentTime)
    gainNode1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gainNode1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    
    oscillator1.start(ctx.currentTime)
    oscillator1.stop(ctx.currentTime + 0.15)
    
    // Create oscillator for second tone (slightly delayed)
    const oscillator2 = ctx.createOscillator()
    const gainNode2 = ctx.createGain()
    
    oscillator2.connect(gainNode2)
    gainNode2.connect(ctx.destination)
    
    // Second tone: 1000 Hz (higher pitch)
    oscillator2.frequency.value = 1000
    oscillator2.type = 'sine'
    
    const startTime = ctx.currentTime + 0.1
    gainNode2.gain.setValueAtTime(0, startTime)
    gainNode2.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)
    
    oscillator2.start(startTime)
    oscillator2.stop(startTime + 0.15)
  } catch (error) {
    console.error('Error playing turn notification sound:', error)
  }
}

/**
 * Play a card placement sound (subtle click)
 */
export function playCardPlaceSound() {
  try {
    const ctx = getAudioContext()
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // Short click sound
    oscillator.frequency.value = 200
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  } catch (error) {
    console.error('Error playing card place sound:', error)
  }
}

/**
 * Play a win sound (celebration)
 */
export function playWinSound() {
  try {
    const ctx = getAudioContext()
    
    // Play ascending notes for celebration
    const notes = [523.25, 659.25, 783.99, 1046.50] // C, E, G, C (major chord)
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      const startTime = ctx.currentTime + (index * 0.15)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  } catch (error) {
    console.error('Error playing win sound:', error)
  }
}
