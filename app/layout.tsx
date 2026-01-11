import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCWS Site",
  description: "Old Crows Wireless Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
