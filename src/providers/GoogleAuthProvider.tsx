'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Add type declaration for Google accounts API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: () => void;
            auto_select: boolean;
            cancel_on_tap_outside: boolean;
            context: string;
            ux_mode: string;
          }) => void;
        };
      };
    };
  }
}

export function GoogleAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider 
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      onScriptLoadSuccess={() => {
        // Add popup window configuration
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: () => {},
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
        });
      }}
    >
      {children}
    </GoogleOAuthProvider>
  );
} 