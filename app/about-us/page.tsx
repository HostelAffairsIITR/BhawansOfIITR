'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  HOSTEL_AFFAIRS_SECRETARY,
  SECRETARIAT_TEAMS,
} from '@/lib/about-us-data'

const TEAMS = ['Events', 'Media and Outreach', 'Design', 'Editorials', 'Web Development']

export default function AboutUsPage() {
  const [activeTeam, setActiveTeam] = useState<string>(TEAMS[0])

  // Filter members based on selected team tab
  const members = SECRETARIAT_TEAMS.filter(m => m.team === activeTeam)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface/30 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl text-brand uppercase tracking-wider font-extrabold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
              Hostel Affairs Secretariat
            </h1>
            <p className="text-text-muted text-sm sm:text-base mt-2 max-w-md mx-auto">
              Meet the student representatives and divisions working behind the residential community at IIT Roorkee.
            </p>
          </div>

          {/* Secretary Section (Top in Middle) */}
          <section className="mb-16">
            <div className="max-w-md mx-auto rounded-2xl border border-border bg-surface-raised p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-200">
              {/* Profile Avatar */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-4xl font-extrabold mx-auto shadow-sm mb-5 relative overflow-hidden group">
                <span>{HOSTEL_AFFAIRS_SECRETARY.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              
              {/* Secretary Info */}
              <h2 className="text-lg sm:text-xl font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>
                {HOSTEL_AFFAIRS_SECRETARY.name}
              </h2>
              <p className="text-xs font-bold text-brand uppercase tracking-wider mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                {HOSTEL_AFFAIRS_SECRETARY.role}
              </p>
              <p className="text-xs text-text-muted font-medium mt-1">
                {HOSTEL_AFFAIRS_SECRETARY.year} · {HOSTEL_AFFAIRS_SECRETARY.bhavan}
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-4 bg-surface/50 border border-border/60 rounded-xl p-3">
                {HOSTEL_AFFAIRS_SECRETARY.bio}
              </p>

              <a
                href={`mailto:${HOSTEL_AFFAIRS_SECRETARY.email}`}
                className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm border border-border bg-surface/50 hover:bg-surface-muted cursor-pointer text-text w-full"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{HOSTEL_AFFAIRS_SECRETARY.email}</span>
              </a>
            </div>
          </section>

          {/* Separator */}
          <div className="border-t border-border/60 mb-12 max-w-5xl mx-auto" />

          {/* Secretariat Divisions */}
          <section className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl text-brand uppercase tracking-wider font-extrabold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                Secretariat Teams
              </h3>
              <p className="text-text-muted text-xs sm:text-sm mt-1">
                Explore the functional branches of the hostel council
              </p>
            </div>

            {/* Tabs control */}
            <div className="flex overflow-x-auto scroll-hidden gap-2 pb-3 mb-8 border-b border-border/60 justify-start sm:justify-center">
              {TEAMS.map((teamName) => {
                const isActive = teamName === activeTeam
                return (
                  <button
                    key={teamName}
                    onClick={() => setActiveTeam(teamName)}
                    className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border
                      ${isActive
                        ? 'bg-brand border-brand text-white shadow-xs'
                        : 'bg-surface-raised border-border text-text hover:bg-surface-muted hover:border-border-strong'
                      }`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {teamName}
                  </button>
                )
              })}
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {members.map(member => (
                <div
                  key={member.name}
                  className="flex flex-col items-center gap-3 bg-surface-raised border border-border rounded-xl p-4 text-center shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Photo / Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-light/10 to-brand-muted/20 flex items-center justify-center text-brand text-lg font-extrabold border border-border-strong/20">
                    <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  {/* Info */}
                  <div className="w-full">
                    <p className="text-xs font-bold text-text leading-tight truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                      {member.name}
                    </p>
                    <p className="text-[10px] font-bold text-brand uppercase tracking-wider mt-1 truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                      {member.role}
                    </p>
                    {member.year && (
                      <p className="text-[10px] text-text-muted mt-0.5 truncate">
                        {member.year} · {member.bhavan?.replace(' Bhawan', '').replace(' Hostel', '')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
