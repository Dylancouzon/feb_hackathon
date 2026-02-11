import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Actually Hang",
  description: "AI-powered IRL meetup coordination for NYC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
