import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import InteractiveBackground from "@/components/ui/interactive-background";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "A student study dashboard with notices, materials, videos and progress tracking."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <InteractiveBackground />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
