export function validatePlayerName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' }
  }
  
  if (name.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' }
  }
  
  if (!/^[a-zA-Z0-9_\s-]+$/.test(name)) {
    return { valid: false, error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores' }
  }
  
  return { valid: true }
}

export function validateTeam(team: number): { valid: boolean; error?: string } {
  if (team !== 1 && team !== 2) {
    return { valid: false, error: 'Team must be 1 or 2' }
  }
  
  return { valid: true }
}
