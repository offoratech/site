import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'
import Cursor from '../ui/Cursor.jsx'
import ScrollProgress from '../ui/ScrollProgress.jsx'

export default function Layout({ children }) {
  return (
    <div className="grain flex min-h-screen flex-col overflow-x-clip bg-ink">
      <ScrollProgress />
      <Cursor />
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
