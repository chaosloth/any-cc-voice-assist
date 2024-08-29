"use client";

import type { Viewport } from "next";
import "@/app/styles.css";
import { SyncProvider } from "@/app/context/Sync";
import { Theme } from "@twilio-paste/core/theme";
import { CustomizationProvider } from "@twilio-paste/core/customization";

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
  userScalable: false,
  maximumScale: 1,
  height: "100vh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Voice Assist</title>
        <meta property="og:url" content="https://twilio.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Twilio - Individualised Communications at Scale"
        />
        <meta
          property="og:description"
          content="Connect with customers on their preferred channels—anywhere in the world. Quickly integrate powerful communication APIs to start building solutions for SMS and WhatsApp messaging, voice, video, and email."
        />
        {/* <meta property="og:image" content="/preview.png"/> */}
      </head>
      <body>
        <Theme.Provider theme="twilio">
          <CustomizationProvider
            elements={{
              CUSTOM_ID_FORM: {
                rowGap: "space20",
              },
            }}
          >
            <SyncProvider>{children}</SyncProvider>
          </CustomizationProvider>
        </Theme.Provider>
      </body>
    </html>
  );
}
