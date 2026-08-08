import { useDeviceType } from '@/hooks/useDeviceType'
import { GameLayoutMobile } from './mobile/GameLayoutMobile'
import { GameLayoutDesktop } from './desktop/GameLayoutDesktop'

interface ResponsiveGameLayoutProps {
  isGameOver: boolean
  winnerTeam: number | null
}

/**
 * Responsive layout orchestrator
 * Detects device type and renders the appropriate layout:
 * - Mobile: < 768px (uses GameLayoutMobile)
 * - Tablet: 768px - 1024px (uses GameLayoutDesktop - same as desktop)
 * - Desktop: >= 1024px (uses GameLayoutDesktop)
 * 
 * This component is the single entry point for rendering game UI.
 * It automatically switches between mobile and desktop layouts based on screen size.
 */
export function ResponsiveGameLayout({ isGameOver, winnerTeam }: ResponsiveGameLayoutProps) {
  const { isMobile } = useDeviceType()

  // Mobile layout for phones
  if (isMobile) {
    return <GameLayoutMobile isGameOver={isGameOver} winnerTeam={winnerTeam} />
  }

  // Desktop layout for tablets and desktops
  return <GameLayoutDesktop isGameOver={isGameOver} winnerTeam={winnerTeam} />
}
