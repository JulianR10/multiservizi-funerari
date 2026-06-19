export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/20 bg-chalk/60 backdrop-blur-lg">
      {children}
    </div>
  )
}
