import Link from 'next/link'

export default function GamePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">3D 游戏</h1>
      <p className="text-gray-400 mb-6">开发中，敬请期待。</p>
      <Link href="/" className="text-blue-400 hover:text-blue-300">
        返回首页
      </Link>
    </div>
  )
}
