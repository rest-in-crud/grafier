import * as React from 'react';

function PublicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="6.25" />
      <ellipse cx="8" cy="8" rx="2.75" ry="6.25" />
      <path d="M1.75 8h12.5" />
    </svg>
  );
}

function PrivateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.25" y="7.25" width="9.5" height="6.75" rx="0.5" />
      <path d="M5 7.25V5a3 3 0 0 1 6 0v2.25" />
    </svg>
  );
}

export { PublicIcon, PrivateIcon };
