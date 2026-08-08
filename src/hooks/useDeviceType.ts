import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface DeviceTypeConfig {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  screenWidth: number
}

/**
 * Hook to detect device type based on screen width
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: >= 1024px
 */
export function useDeviceType(): DeviceTypeConfig {
  const [config, setConfig] = useState<DeviceTypeConfig>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    return getDeviceConfig(width)
  })

  useEffect(() => {
    const handleResize = () => {
      setConfig(getDeviceConfig(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return config
}

function getDeviceConfig(width: number): DeviceTypeConfig {
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const isDesktop = width >= 1024

  let deviceType: DeviceType = 'desktop'
  if (isMobile) deviceType = 'mobile'
  else if (isTablet) deviceType = 'tablet'

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    screenWidth: width,
  }
}
