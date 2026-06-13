import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boon Rawd Production Portal",
  description: "ระบบบริหารจัดการข้อมูลการผลิต บริษัท บุญรอด บริวเวอรี่ จำกัด",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
