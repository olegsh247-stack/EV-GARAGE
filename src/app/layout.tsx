import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EV-GARAGE.RU — электромобили из Китая",
  description:
    "Каталог электромобилей из Китая: характеристики, цены, подбор модели. Zeekr, NIO, BYD и другие бренды.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-body">{children}</body>
    </html>
  );
}
