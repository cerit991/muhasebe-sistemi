import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Her zaman ilk ayarı al
    const settings = await prisma.settings.findFirst()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Mevcut ayarları kontrol et
    const existingSettings = await prisma.settings.findFirst()

    if (existingSettings) {
      // Varsa güncelle
      const settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data
      })
      return NextResponse.json(settings)
    } else {
      // Yoksa yeni oluştur
      const settings = await prisma.settings.create({
        data
      })
      return NextResponse.json(settings)
    }
  } catch (error) {
    console.error('Ayarlar kaydedilirken hata:', error)
    return NextResponse.json(
      { error: 'Ayarlar kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}