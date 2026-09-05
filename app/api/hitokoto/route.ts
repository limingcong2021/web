import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 首页的“每日一言”接口：聚合一言 API，失败时返回兜底文案，避免页面报错。
export async function GET() {
  try {
    const res = await fetch('https://v1.hitokoto.cn/?encode=json')
    if (!res.ok) throw new Error(`hitokoto ${res.status}`)
    const data = await res.json()
    return NextResponse.json({
      hitokoto: data.hitokoto,
      from: data.from,
      from_who: data.from_who ?? null,
    })
  } catch (e) {
    console.error('[hitokoto]', e)
    return NextResponse.json({
      hitokoto: '此处应有言语，落得空白纸一张。',
      from: '系统',
      from_who: null,
    })
  }
}
