import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boligsøgning",
  description: "Find din næste bolig i Danmark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
