'use client'
import { useState } from 'react'
import { PollCard, BlogCard, AnnouncementCard, DbContentItem } from '@/components/home/EventsSection'
import ShareModal from '@/components/events/ShareModal'
import { getBhavanBySlug } from '@/lib/bhavans-data'

export default function EventsGrid({ 
  events, 
  votes,
  showShare = true
}: { 
  events: DbContentItem[]
  votes: any[]
  showShare?: boolean
}) {
  const [activeShareItem, setActiveShareItem] = useState<DbContentItem | null>(null)

  const handleShare = (item: DbContentItem) => {
    setActiveShareItem(item)
  }

  const selectedBhavan = activeShareItem?.bhavan_scope 
    ? getBhavanBySlug(activeShareItem.bhavan_scope)
    : undefined

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mt-8 sm:mt-16 mb-16 sm:mb-24 w-full">
        {events.map(event => (
          <div key={event.id} className="flex">
            {event.type === 'poll' && (
              <PollCard 
                item={event} 
                votes={votes} 
                onShare={showShare ? handleShare : undefined} 
              />
            )}
            {event.type === 'blog' && (
              <BlogCard 
                item={event} 
                onShare={showShare ? handleShare : undefined} 
              />
            )}
            {event.type === 'announcement' && (
              <AnnouncementCard 
                item={event} 
                onShare={showShare ? handleShare : undefined} 
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
          bhavan={selectedBhavan}
        />
      )}
    </>
  )
}
