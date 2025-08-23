import * as React from "react"

export interface SidebarContext {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: (value: boolean | ((value: boolean) => boolean)) => void
  toggleSidebar: () => void
}

export const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}
