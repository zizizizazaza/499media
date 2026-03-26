import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "499 - Web3 Media",
  description: "Web3 media platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
