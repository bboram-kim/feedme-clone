import type { Metadata } from "next";
import { Geist_Mono, Nanum_Gothic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const nanumGothic = Nanum_Gothic({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feedme",
  description: "웹페이지를 Markdown으로 바꿔 ChatGPT·Claude로 넘깁니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistMono.variable, nanumGothic.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
