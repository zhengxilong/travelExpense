import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "差旅费用统计系统",
  description: "管理和分析您的差旅费用的专业系统",
  keywords: ["差旅费用", "费用管理", "费用统计", "数据分析"],
  authors: [{ name: "差旅费用统计系统" }],
  openGraph: {
    title: "差旅费用统计系统",
    description: "管理和分析您的差旅费用的专业系统",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "差旅费用统计系统",
    description: "管理和分析您的差旅费用的专业系统",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
