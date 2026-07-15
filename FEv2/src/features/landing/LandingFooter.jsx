function LandingFooter() {
  return (
    <footer className="border-t border-walnut/15">
      <div className="max-w-[1040px] mx-auto px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-medium text-ink">
            The Marginalia
          </span>

          <nav className="flex items-center gap-4 text-xs text-walnut/50 font-mono">
            <a href="#" className="hover:text-ink transition-colors no-underline text-walnut/50">
              About
            </a>
            <a href="#" className="hover:text-ink transition-colors no-underline text-walnut/50">
              Privacy
            </a>
            <a href="#" className="hover:text-ink transition-colors no-underline text-walnut/50">
              Terms
            </a>
          </nav>

          <span className="text-xs text-walnut/30 font-mono">
            Made with care for students
          </span>
        </div>
      </div>
    </footer>
  )
}

export { LandingFooter }
