import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/manrope/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Princess Skye",
  description: "Step into the world of Princess Skye. For visitors aged 18 and over.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#100e0d", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
