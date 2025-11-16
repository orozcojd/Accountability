'use client';

/**
 * Tab Navigation Component
 * Used for: Official profile page sections
 * Accessibility: Full keyboard navigation with arrow keys
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, className, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Handle URL hash changes
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && tabs.some((tab) => tab.id === hash)) {
      setActiveTab(hash);
    }
  }, [tabs]);

  // Update URL hash when tab changes
  useEffect(() => {
    if (activeTab) {
      window.history.replaceState(null, '', `#${activeTab}`);
      onTabChange?.(activeTab);
    }
  }, [activeTab, onTabChange]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    setActiveTab(tabs[newIndex].id);
    const buttons = tabListRef.current?.querySelectorAll('button');
    (buttons?.[newIndex] as HTMLButtonElement)?.focus();
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        className="flex border-b border-light-gray overflow-x-auto scrollbar-thin"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'px-6 py-4 text-body font-medium whitespace-nowrap',
                'border-b-3 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-dark-gray hover:text-primary hover:border-medium-gray'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={tab.id}
          hidden={tab.id !== activeTab}
          className={cn('py-6 focus:outline-none', tab.id !== activeTab && 'hidden')}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
