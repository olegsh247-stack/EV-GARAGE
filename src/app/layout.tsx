import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CompareProvider } from "@/lib/compareContext";

export const metadata: Metadata = {
  title: "EV-GARAGE.RU — электромобили из Китая",
  description:
    "Каталог электромобилей из Китая: характеристики, цены, подбор модели. Zeekr, NIO, BYD и другие бренды.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-body">
        <CompareProvider>{children}</CompareProvider>
      </body>
    </html>
  );
}
