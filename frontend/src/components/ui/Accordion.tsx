'use client';

/**
 * Accordion Component
 * Used for: Promise categories, expandable sections
 * Accessibility: Full keyboard support, ARIA attributes
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  id?: string;
}

export function Accordion({
  title,
  children,
  defaultExpanded = false,
  className,
  id,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const panelId = id || `accordion-panel-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('border border-light-gray rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={cn(
          'w-full flex items-center justify-between px-6 py-4 text-left',
          'bg-white hover:bg-off-white transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
          isExpanded && 'border-l-4 border-primary'
        )}
      >
        <span className="text-component-title font-semibold">{title}</span>
        <svg
          className={cn(
            'w-5 h-5 text-dark-gray transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!isExpanded}
        className={cn(
          'px-6 py-4 bg-off-white',
          'transition-all duration-200',
          !isExpanded && 'hidden'
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * AccordionGroup - Wrapper for multiple accordions
 */
interface AccordionGroupProps {
  children: React.ReactNode;
  className?: string;
  allowMultiple?: boolean;
}

export function AccordionGroup({
  children,
  className,
  allowMultiple = true,
}: AccordionGroupProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
