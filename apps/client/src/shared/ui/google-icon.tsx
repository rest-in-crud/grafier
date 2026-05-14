import * as React from 'react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 6.5v3h4.3c-.2 1-1.4 3-4.3 3a4.5 4.5 0 1 1 2.9-7.9l2.1-2C11.7 1.5 10 .8 8 .8 4 .8.8 4 .8 8S4 15.2 8 15.2c4.2 0 7-3 7-7.1 0-.5 0-.9-.1-1.6H8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export { GoogleIcon };
