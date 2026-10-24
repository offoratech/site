import { useLocation, useNavigate } from 'react-router-dom'
import { Home, User, LayoutGrid, Image as ImageIcon, Mail } from 'lucide-react'
import { LimelightNav } from '../ui/LimelightNav.jsx'

const links = [
  { id: 'home', to: '/', label: 'Home', icon: Home },
  { id: 'about', to: '/about', label: 'About', icon: User },
  { id: 'services', to: '/services', label: 'Services', icon: LayoutGrid },
  { id: 'gallery', to: '/gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'contact', to: '/contact', label: 'Contact', icon: Mail },
]

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const activeIndex = links.findIndex((link) =>
    link.to === '/' ? pathname === '/' : pathname.startsWith(link.to),
  )

  const items = links.map((link) => ({ ...link, iconOnly: true }))

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center lg:hidden">
      <LimelightNav
        items={items}
        activeIndex={activeIndex}
        onItemClick={(_, item) => navigate(item.to)}
        className="mobile-glass-nav border-white/25 bg-white/[0.14] backdrop-blur-2xl backdrop-saturate-[2] backdrop-brightness-125 shadow-[0_0_50px_8px_rgba(255,255,255,0.06),0_10px_36px_-6px_rgba(0,0,0,0.65),inset_0_1.5px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.08)]"
        itemClassName="px-3"
      />
    </div>
  )
}
