/**
 * About Page
 * Information about the Accountability Platform
 */

export default function AboutPage() {
  return (
    <div className="bg-off-white min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-light-gray p-8 mb-8">
          <h1 className="text-page-title mb-4">About the Accountability Platform</h1>
          <p className="text-body-large text-dark-gray">
            A nonpartisan platform for tracking elected officials&apos; campaign promises, voting records, and financial disclosures.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-lg border border-light-gray p-8 mb-8">
          <h2 className="text-section-title mb-4">Our Mission</h2>
          <p className="text-body text-dark-gray mb-4">
            The Accountability Platform provides citizens with transparent, factual information about their elected officials. We believe that democracy works best when voters have access to comprehensive, nonpartisan data about their representatives&apos; promises and actions.
          </p>
          <p className="text-body text-dark-gray">
            Our goal is to empower citizens to make informed decisions by presenting objective data without editorial bias or partisan interpretation.
          </p>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-lg border border-light-gray p-8 mb-8">
          <h2 className="text-section-title mb-4">Methodology</h2>
          <p className="text-body text-dark-gray mb-4">
            All data on this platform is sourced from official government records and public disclosures:
          </p>
          <ul className="space-y-3 text-body text-dark-gray mb-4">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span><strong>Voting Records:</strong> ProPublica Congress API and GovTrack</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span><strong>Campaign Finance:</strong> Federal Election Commission (FEC) and OpenSecrets</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span><strong>Stock Trades:</strong> Congressional financial disclosure reports</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span><strong>Campaign Promises:</strong> Official campaign websites and public statements</span>
            </li>
          </ul>
          <p className="text-body text-dark-gray">
            All data is updated regularly and includes timestamps showing when information was last verified.
          </p>
        </div>

        {/* Principles */}
        <div className="bg-white rounded-lg border border-light-gray p-8 mb-8">
          <h2 className="text-section-title mb-4">Our Principles</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-component-title font-semibold mb-2">Strict Neutrality</h3>
              <p className="text-body text-dark-gray">
                We present facts without partisan bias. Our platform uses neutral colors, avoids judgment language, and provides equal treatment to all officials regardless of party affiliation.
              </p>
            </div>
            <div>
              <h3 className="text-component-title font-semibold mb-2">Transparency</h3>
              <p className="text-body text-dark-gray">
                All data sources are cited and linked. We clearly indicate when information is AI-generated or summarized, and provide access to original source documents.
              </p>
            </div>
            <div>
              <h3 className="text-component-title font-semibold mb-2">Accessibility</h3>
              <p className="text-body text-dark-gray">
                Our platform is designed to be accessible to all users, meeting WCAG 2.1 AA standards with keyboard navigation, screen reader support, and clear visual hierarchy.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-light-gray p-8">
          <h2 className="text-section-title mb-4">Contact Us</h2>
          <p className="text-body text-dark-gray mb-4">
            Have questions, feedback, or found an error? We welcome your input.
          </p>
          <a href="mailto:contact@accountabilityplatform.org" className="btn btn-primary inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
