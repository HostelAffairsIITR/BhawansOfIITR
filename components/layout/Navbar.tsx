'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BHAVANS } from '@/lib/bhavans-data'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { label: 'MAP', href: '/#campus-map' },
  { label: 'BHAVANS', href: '/#our-bhavans' },
  { label: 'EVENTS', href: '/#whats-happening' },
  { label: 'ABOUT US', href: '/about-us' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileBhavansOpen, setMobileBhavansOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [hasRole, setHasRole] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (currentUser) {
        // Fetch user profile name
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('id', currentUser.id)
            .single()
          setUserName(profile?.name || currentUser.email || 'User')
        } catch {
          setUserName(currentUser.email || 'User')
        }

        // Check user_roles
        try {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
          setHasRole(!!(roles && roles.length > 0))
        } catch {
          setHasRole(false)
        }

        // Check permissions
        try {
          const { data: perms } = await supabase
            .from('permissions')
            .select('role')
            .eq('user_id', currentUser.id)
          setHasPermission(!!(perms && perms.length > 0))
        } catch {
          setHasPermission(false)
        }
      }
    }

    checkSession()

    // Setup auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkSession()
      } else {
        setUser(null)
        setUserName('')
        setHasRole(false)
        setHasPermission(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  return (
    <header className="w-full bg-brand sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-brand-light ring-2 ring-text-on-brand/20 flex-shrink-0">
            <span className="text-text-on-brand text-xs font-bold leading-none text-center" style={{ fontFamily: 'var(--font-sans)' }}>IITR</span>
          </div>
        </Link>
      
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1
            className="text-text-on-brand text-2xl sm:text-3xl md:text-4xl tracking-widest whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            BHAVANS OF IITR
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {/* Dashboard button for managers/volunteers */}
          {user && (hasRole || hasPermission) && (
            <Link 
              href="/dashboard" 
              className="hidden sm:inline-flex bg-brand-light hover:bg-brand-muted text-text-on-brand text-xs font-bold px-3 py-2 rounded-lg tracking-wider uppercase transition-colors" 
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              My Events
            </Link>
          )}

          {/* User profile dropdown or Login button */}
          {user ? (
            <div className="relative group">
              <button 
                className="flex items-center gap-1.5 h-10 px-3 rounded-lg text-text-on-brand/80 hover:text-text-on-brand hover:bg-brand-light transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{userName.split(' ')[0]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full hidden group-hover:block w-40 bg-surface-raised border border-border text-text shadow-lg rounded-xl py-1.5 z-50 mt-0.5">
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-text-muted hover:text-brand hover:bg-surface-muted transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="bg-brand-light hover:bg-brand-muted text-text-on-brand text-xs font-bold px-4 py-2 rounded-lg tracking-wider uppercase transition-colors cursor-pointer" 
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Login
            </button>
          )}

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-text-on-brand/80 hover:text-text-on-brand hover:bg-brand-light transition-colors duration-150"
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>

          <button
            className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-text-on-brand hover:bg-brand-light ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block w-5 h-0.5 bg-text-on-brand transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
              <span className={`block w-5 h-0.5 bg-text-on-brand transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}/>
              <span className={`block w-5 h-0.5 bg-text-on-brand transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
            </div>
          </button>
        </div>
      </div>


      <nav className="hidden sm:block border-t border-text-on-brand/10 bg-brand relative">
        <div className="max-w-7xl mx-auto">
          <ul className="flex">
            {NAV_LINKS.map(link => (
              <li key={link.label} className="flex-1 relative group">
                <Link
                  href={link.href}
                  className="block text-center py-3.5 text-text-on-brand/75 text-xs font-bold tracking-[0.15em] hover:text-text-on-brand hover:bg-brand-light transition-colors duration-150 uppercase"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {link.label}
                </Link>

                {link.label === 'BHAVANS' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block w-[760px] bg-surface-raised border border-border text-text shadow-lg rounded-2xl p-6 z-50 mt-0.5 transition-all duration-200">
                    <div className="grid grid-cols-4 gap-5">
                      {/* Column 1: Boys (A-M) */}
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2 px-2 border-l-2 border-brand/40">Boys (A-M)</p>
                        <ul className="flex flex-col gap-0.5 text-left">
                          {BHAVANS.filter(b => b.category === 'boys' && b.slug < 'radhakrishnan').map(b => (
                            <li key={b.slug}>
                              <Link href={`/bhavans/${b.slug}`} className="text-xs font-semibold text-text-muted hover:text-brand hover:bg-surface-muted py-1.5 px-2.5 block rounded-lg transition-colors">
                                {b.name.replace(' Bhawan', '')}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Column 2: Boys (R-Z) */}
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2 px-2 border-l-2 border-brand/40">Boys (R-Z)</p>
                        <ul className="flex flex-col gap-0.5 text-left">
                          {BHAVANS.filter(b => b.category === 'boys' && b.slug >= 'radhakrishnan').map(b => (
                            <li key={b.slug}>
                              <Link href={`/bhavans/${b.slug}`} className="text-xs font-semibold text-text-muted hover:text-brand hover:bg-surface-muted py-1.5 px-2.5 block rounded-lg transition-colors">
                                {b.name.replace(' Bhawan', '')}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Column 3: Girls */}
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2 px-2 border-l-2 border-accent/40">Girls</p>
                        <ul className="flex flex-col gap-0.5 text-left">
                          {BHAVANS.filter(b => b.category === 'girls').map(b => (
                            <li key={b.slug}>
                              <Link href={`/bhavans/${b.slug}`} className="text-xs font-semibold text-text-muted hover:text-brand hover:bg-surface-muted py-1.5 px-2.5 block rounded-lg transition-colors">
                                {b.name.replace(' Bhawan', '')}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Column 4: Married & Co-ed */}
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-2 px-2 border-l-2 border-brand-muted/40">Co-ed & Married</p>
                        <ul className="flex flex-col gap-0.5 text-left">
                          {BHAVANS.filter(b => ['married', 'coed'].includes(b.category)).map(b => (
                            <li key={b.slug}>
                              <Link href={`/bhavans/${b.slug}`} className="text-xs font-semibold text-text-muted hover:text-brand hover:bg-surface-muted py-1.5 px-2.5 block rounded-lg transition-colors">
                                {b.name.replace(' Bhawan', '').replace(' Hostel', '').replace(' House', '')}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {menuOpen && (
        <nav className="sm:hidden border-t border-text-on-brand/10 bg-brand">
          <ul>
            {NAV_LINKS.map(link => {
              if (link.label === 'BHAVANS') {
                return (
                  <li key={link.label} className="border-b border-text-on-brand/10">
                    <button
                      onClick={() => setMobileBhavansOpen(!mobileBhavansOpen)}
                      className="w-full flex items-center justify-between px-6 py-4 text-text-on-brand/80 text-xs font-bold tracking-[0.15em] hover:bg-brand-light hover:text-text-on-brand transition-colors text-left cursor-pointer"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      <span>BHAVANS</span>
                      <span className="text-[10px] opacity-65">{mobileBhavansOpen ? '▲' : '▼'}</span>
                    </button>
                    {mobileBhavansOpen && (
                      <div className="bg-brand-light px-6 py-4 flex flex-col gap-4 text-left border-t border-text-on-brand/10">
                        {/* Boys Category */}
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-on-brand/40 mb-2 border-l border-text-on-brand/20 pl-2">Boys Hostels</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {BHAVANS.filter(b => b.category === 'boys').map(b => (
                              <Link key={b.slug} href={`/bhavans/${b.slug}`} onClick={() => { setMenuOpen(false); setMobileBhavansOpen(false); }} className="text-xs text-text-on-brand/70 hover:text-text-on-brand py-1 block">
                                {b.name.replace(' Bhawan', '')}
                              </Link>
                            ))}
                          </div>
                        </div>
                        {/* Girls Category */}
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-on-brand/40 mb-2 border-l border-text-on-brand/20 pl-2">Girls Hostels</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {BHAVANS.filter(b => b.category === 'girls').map(b => (
                              <Link key={b.slug} href={`/bhavans/${b.slug}`} onClick={() => { setMenuOpen(false); setMobileBhavansOpen(false); }} className="text-xs text-text-on-brand/70 hover:text-text-on-brand py-1 block">
                                {b.name.replace(' Bhawan', '')}
                              </Link>
                            ))}
                          </div>
                        </div>
                        {/* Married & Co-ed Category */}
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-on-brand/40 mb-2 border-l border-text-on-brand/20 pl-2">Co-ed & Married</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {BHAVANS.filter(b => ['married', 'coed'].includes(b.category)).map(b => (
                              <Link key={b.slug} href={`/bhavans/${b.slug}`} onClick={() => { setMenuOpen(false); setMobileBhavansOpen(false); }} className="text-xs text-text-on-brand/70 hover:text-text-on-brand py-1 block">
                                {b.name.replace(' Bhawan', '').replace(' Hostel', '').replace(' House', '')}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                )
              }

              return (
                <li key={link.label} className="border-b border-text-on-brand/10">
                  <Link
                    href={link.href}
                    className="block px-6 py-4 text-text-on-brand/80 text-xs font-bold tracking-[0.15em] hover:bg-brand-light hover:text-text-on-brand transition-colors uppercase"
                    style={{ fontFamily: 'var(--font-sans)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}

            {/* Mobile Auth Actions */}
            {user ? (
              <>
                {user && (hasRole || hasPermission) && (
                  <li className="border-b border-text-on-brand/10 bg-brand-light/10">
                    <Link
                      href="/dashboard"
                      className="block px-6 py-4 text-text-on-brand text-xs font-extrabold tracking-[0.15em] hover:bg-brand-light transition-colors uppercase"
                      style={{ fontFamily: 'var(--font-sans)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      My Events
                    </Link>
                  </li>
                )}
                <li className="border-b border-text-on-brand/10">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-4 text-red-200 text-xs font-bold tracking-[0.15em] hover:bg-brand-light transition-colors uppercase cursor-pointer"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Logout ({userName.split(' ')[0]})
                  </button>
                </li>
              </>
            ) : (
              <li className="border-b border-text-on-brand/10">
                <button
                  onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}
                  className="w-full text-left px-6 py-4 text-text-on-brand/80 hover:text-text-on-brand text-xs font-bold tracking-[0.15em] hover:bg-brand-light transition-colors uppercase cursor-pointer"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      {/* Channel I Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-raised border border-border text-text rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setShowLoginModal(false)} 
              className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h3 className="text-lg font-bold text-brand mb-2" style={{ fontFamily: 'var(--font-sans)' }}>CHANNEL I LOGIN</h3>
            <p className="text-text-muted text-xs leading-relaxed mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
              Channel I OAuth login is coming soon. For now, you can sign in directly through Supabase or mock sessions to test user workflows.
            </p>
            <button 
              onClick={() => setShowLoginModal(false)} 
              className="btn-primary w-full py-3.5 text-xs font-bold tracking-wider uppercase cursor-pointer"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

