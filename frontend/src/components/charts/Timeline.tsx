'use client';

/**
 * Timeline Visualization Component
 * Used for: Voting history, stock trading activity over time
 * Accessibility: Keyboard navigable, screen reader friendly
 */

import { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'warning' | 'info';
}

interface TimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const typeColors = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
};

export function Timeline({ events, orientation = 'vertical', className }: TimelineProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  if (orientation === 'horizontal') {
    return <HorizontalTimeline events={events} className={className} />;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-light-gray" aria-hidden="true" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const isExpanded = expandedEvent === event.id;
          const color = typeColors[event.type || 'default'];

          return (
            <div key={event.id} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white',
                  color
                )}
                aria-hidden="true"
              />

              {/* Event content */}
              <div className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-small text-medium-gray mb-1">
                      {formatDate(event.date)}
                    </p>
                    <h4 className="text-body font-semibold text-text-black">
                      {event.title}
                    </h4>
                    {event.description && (
                      <button
                        type="button"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        className="mt-2 text-body-small text-primary hover:underline"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && event.description && (
                  <p className="mt-3 text-body text-dark-gray pt-3 border-t border-light-gray">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Horizontal Timeline (for year-based views)
 */
function HorizontalTimeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const years = Object.keys(eventsByYear).sort();

  return (
    <div className={cn('overflow-x-auto scrollbar-thin pb-4', className)}>
      <div className="min-w-max space-y-4">
        {years.map((year) => {
          const yearEvents = eventsByYear[Number(year)];

          return (
            <div key={year} className="space-y-2">
              {/* Year label */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-body text-text-black w-16">
                  {year}
                </span>
                <div className="flex-1 h-0.5 bg-light-gray relative">
                  {/* Event markers */}
                  {yearEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
                      style={{
                        left: `${(index / yearEvents.length) * 100}%`,
                      }}
                      title={event.title}
                    />
                  ))}
                </div>
              </div>

              {/* Event count */}
              <p className="text-body-small text-medium-gray pl-16">
                {yearEvents.length} {yearEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
