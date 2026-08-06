const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous characters

export function generateInviteCode(length: number = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
  }
  return code
}

export function formatInviteCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function isValidInviteCode(code: string): boolean {
  const formatted = formatInviteCode(code)
  return formatted.length === 6 && /^[A-Z0-9]+$/.test(formatted)
}
