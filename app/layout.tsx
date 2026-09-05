import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '您的名字 · 个人主页',
  description: 'Web开发者 | 设计师 | 游戏爱好者',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-black text-white antialiased">{children}</body>
    </html>
  )
}
