/**
 * Footer Component
 * Site-wide footer with links and information
 */

import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    'About': [
      { name: 'Methodology', href: '/about/methodology' },
      { name: 'Data Sources', href: '/about/data-sources' },
      { name: 'Contact', href: '/about/contact' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Accessibility Statement', href: '/accessibility' },
      { name: 'Terms of Use', href: '/terms' },
    ],
    'Developers': [
      { name: 'API Documentation', href: '/api/docs' },
      { name: 'GitHub', href: 'https://github.com' },
    ],
  };

  return (
    <footer className="bg-off-white border-t border-light-gray mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-body font-semibold text-text-black mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-body-small text-dark-gray hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-light-gray pt-8">
          <p className="text-body-small text-medium-gray text-center">
            &copy; {new Date().getFullYear()} Accountability Platform. All rights reserved.
            <br />
            <span className="text-caption">
              A nonpartisan platform for tracking elected officials&apos; promises and actions.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
