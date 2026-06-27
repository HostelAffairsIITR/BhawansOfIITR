'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  adminName: string
}

export default function AdminSidebar({ adminName }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/admin/events', label: 'Events', icon: '📝' },
    { href: '/admin/user-roles', label: 'User Roles', icon: '👥' },
    { href: '/admin/members', label: 'Members', icon: '🎓' },
    { href: '/admin/wardens', label: 'Wardens', icon: '🛡️' },
    { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { href: '/admin/issues', label: 'Issues', icon: '⚠️' },
  ]

  return (
    <div className="flex flex-col md:flex-row md:h-screen shrink-0 w-full md:w-64 bg-surface-raised border-b md:border-b-0 md:border-r border-border">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between p-4 border-b border-border w-full bg-surface-raised z-30">
        <div>
          <h1 className="text-xs font-extrabold text-brand uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
            Super Admin
          </h1>
          <p className="text-[9px] text-text-muted mt-0.5 truncate" style={{ fontFamily: 'var(--font-mono)' }}>
            👤 {adminName}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-border rounded-lg text-text hover:bg-surface-muted transition-colors cursor-pointer text-xs font-bold font-mono"
        >
          {isOpen ? 'CLOSE ✕' : 'MENU ☰'}
        </button>
      </div>

      {/* Sidebar Panel - Always vertical, collapsible on mobile */}
      <aside className={`w-full md:w-64 flex flex-col justify-between flex-1 md:h-full transition-all duration-200 bg-surface-raised
        ${isOpen ? 'block border-b border-border' : 'hidden md:flex'}`}>
        
        <div>
          {/* Desktop Identity Header */}
          <div className="hidden md:block p-6 border-b border-border">
            <h1 className="text-sm font-extrabold text-brand uppercase tracking-widest" style={{ fontFamily: 'var(--font-mono)' }}>
              Super Admin
            </h1>
            <p className="text-[10px] text-text-muted mt-1 truncate" style={{ fontFamily: 'var(--font-mono)' }}>
              👤 {adminName}
            </p>
          </div>

          {/* Navigation Links - Always vertical */}
          <nav className="p-4 flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)} // Auto close menu on click
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors
                    ${isActive
                      ? 'bg-brand text-white'
                      : 'text-text-muted hover:text-text hover:bg-surface-muted border border-transparent hover:border-border'
                    }`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  <span className="text-sm shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Link */}
        <div className="p-4 md:p-6 border-t border-border">
          <a 
            href="/" 
            className="text-[10px] font-bold text-text-muted hover:text-brand uppercase tracking-wider block text-center md:text-left"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ← Go To Main Site
          </a>
        </div>
      </aside>
    </div>
  )
}
