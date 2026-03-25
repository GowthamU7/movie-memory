import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Movie Memory",
  description: "Movie Memory take-home exercise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}