import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agloe",
  description:
    "On-chain proof that a transit station resold your prompts to train a model. Built on Monad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
