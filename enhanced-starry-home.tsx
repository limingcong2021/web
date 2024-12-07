'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback, useId, useDeferredValue, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Moon, Sun, Star, CloudMoon } from 'lucide-react'

interface Hitokoto {
  hitokoto: string
  from: string
  from_who: string | null
}

interface Image {
  pid: number
  title: string
  author: string
  urls: {
    original: string
  }
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  color: string
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
  </div>
)

const StarryBackground = React.memo(({ stars }: { stars: Star[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    let animationFrameId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw nebula
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      )
      gradient.addColorStop(0, 'rgba(25, 25, 112, 0)')
      gradient.addColorStop(0.5, 'rgba(72, 61, 139, 0.1)')
      gradient.addColorStop(1, 'rgba(25, 25, 112, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`
        ctx.fill()
      })

      // Draw shooting star
      const time = Date.now() * 0.001
      const x = Math.cos(time) * 100 + canvas.width / 2
      const y = Math.sin(time) * 100 + canvas.height / 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 10, y - 10)
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [stars])

  return <canvas ref={canvasRef} className="absolute inset-0" />
})

StarryBackground.displayName = 'StarryBackground'

const Menu = React.memo(({ isOpen, onClose, showR18, setShowR18, fetchImages, images, loading, error }: {
  isOpen: boolean
  onClose: () => void
  showR18: boolean
  setShowR18: (show: boolean) => void
  fetchImages: () => void
  images: Image[]
  loading: boolean
  error: string | null
}) => {
  const menuId = useId()
  
  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-800 bg-opacity-75 backdrop-filter backdrop-blur-md p-4 z-20 overflow-y-auto"
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <nav className="mb-8">
            <ul className="space-y-4">
              <li><Link href="/" className="text-white hover:text-gray-300">首页</Link></li>
              <li><Link href="/game" className="text-white hover:text-gray-300">3D游戏</Link></li>
              <li><button onClick={fetchImages} className="text-white hover:text-gray-300">加载图片库</button></li>
            </ul>
          </nav>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showR18}
                onChange={() => setShowR18(!showR18)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-white">显示R18内容</span>
            </label>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {images.map((image) => (
                <motion.div
                  key={image.pid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative group"
                >
                  <Image
                    src={image.urls.original}
                    alt={image.title}
                    width={150}
                    height={150}
                    className="w-full h-auto object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg?height=150&width=150';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 rounded-lg">
                    <p className="text-white text-sm font-bold truncate">{image.title}</p>
                    <p className="text-gray-300 text-xs truncate">作者: {image.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

Menu.displayName = 'Menu'

export function EnhancedStarryHomeComponent() {
  const [hitokoto, setHitokoto] = useState<Hitokoto | null>(null)
  const [showContent, setShowContent] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [showR18, setShowR18] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stars = useMemo(() => {
    const starColors = ['#ffffff', '#fffaf0', '#ffd700', '#ff8c00', '#87cefa']
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }))
  }, [])

  const deferredStars = useDeferredValue(stars)

  const fetchHitokoto = useCallback(async () => {
    try {
      const response = await fetch('/api/hitokoto');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch hitokoto: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setHitokoto(data);
    } catch (error) {
      console.error('Failed to fetch hitokoto:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
      setShowContent(true);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://api.lolicon.app/setu/v2?r18=${showR18 ? 1 : 0}&num=8`)
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      const data = await response.json()
      setImages(data.data)
    } catch (error) {
      console.error('Failed to fetch images:', error)
      setError('Failed to load images. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [showR18])

  useEffect(() => {
    fetchHitokoto()
  }, [fetchHitokoto])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-white text-center">{error}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        <StarryBackground stars={deferredStars} />
      </Suspense>
      
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center z-20 relative"
          >
            <h1 className="text-4xl font-bold mb-4">您的名字</h1>
            <p className="text-xl mb-8">Web开发者 | 设计师 | 游戏爱好者</p>
            <div className="flex space-x-4 mb-8">
              <a href="#" className="text-blue-400 hover:text-blue-300">GitHub</a>
              <a href="#" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
              <a href="#" className="text-blue-400 hover:text-blue-300">Twitter</a>
            </div>
            {hitokoto && (
              <div className="mt-8 text-sm text-gray-400">
                <p>{hitokoto.hitokoto}</p>
                <p>—— {hitokoto.from_who || hitokoto.from}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 z-30 text-white"
        aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={isMenuOpen}
        aria-controls="menu"
      >
        {isMenuOpen ? '关闭' : '菜单'}
      </button>

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        showR18={showR18}
        setShowR18={setShowR18}
        fetchImages={fetchImages}
        images={images}
        loading={loading}
        error={error}
      />

      <div className="fixed bottom-4 left-4 z-30 flex space-x-2">
        <Moon className="text-white" aria-hidden="true" />
        <Sun className="text-white" aria-hidden="true" />
        <Star className="text-white" aria-hidden="true" />
        <CloudMoon className="text-white" aria-hidden="true" />
      </div>
    </div>
  )
}