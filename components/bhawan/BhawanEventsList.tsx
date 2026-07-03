'use client'
import { useState } from 'react'
import { PollCard, BlogCard, AnnouncementCard, DbContentItem } from '@/components/home/EventsSection'
import ShareModal from '@/components/events/ShareModal'

export default function BhawanEventsList({ 
  events, 
  votes,
  bhawan 
}: { 
  events: DbContentItem[]
  votes: any[]
  bhawan: any 
}) {
  const [activeShareItem, setActiveShareItem] = useState<DbContentItem | null>(null)

  const handleShare = (item: DbContentItem) => {
    setActiveShareItem(item)
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {events.map(event => (
          <div key={event.id} className="flex-none w-full sm:w-[360px] flex">
            {event.type === 'poll' && (
              <PollCard 
                item={event} 
                votes={votes} 
                onShare={handleShare} 
                theme={bhawan.theme}
              />
            )}
            {event.type === 'blog' && (
              <BlogCard 
                item={event} 
                onShare={handleShare} 
                theme={bhawan.theme}
              />
            )}
            {event.type === 'announcement' && (
              <AnnouncementCard 
                item={event} 
                onShare={handleShare} 
                theme={bhawan.theme}
              />
            )}
          </div>
        ))}
      </div>

      {activeShareItem && (
        <ShareModal 
          isOpen={!!activeShareItem} 
          onClose={() => setActiveShareItem(null)} 
          item={activeShareItem}
          bhawan={bhawan}
        />
      )}
    </>
  )
}
