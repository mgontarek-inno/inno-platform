import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Innovations Hub Foundation - platforma",
  description: "Platforma matchmakingowa Innovations Hub Foundation umożliwia uczestnikom programu inkubacyjnego utworzenie profilu, wypełnienie ankiety dotyczącej kompetencji i zainteresowań oraz znalezienie współzałożycieli i członków zespołów do realizacji projektów startupowych. Logowanie przez Google służy do bezpiecznej identyfikacji użytkownika i dostępu do platformy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
