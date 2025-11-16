/**
 * Skip Link Component
 * Accessibility feature to skip to main content
 */

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="skip-link"
    >
      {children}
    </a>
  );
}
