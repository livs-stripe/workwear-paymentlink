import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workwear Group — Payments Portal",
  description:
    "Internal B2B payments demo portal for Workwear Group (test mode).",
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
