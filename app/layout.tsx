import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriveSync - Car Rental",
  description: "Rent the perfect car for any occasion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-border py-8">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-[13px] text-muted-foreground font-medium">
                  © {new Date().getFullYear()} DriveSync Car Rental. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}
