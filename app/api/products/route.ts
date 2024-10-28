import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Ürünler yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate product code
    const productCount = await prisma.product.count()
    const code = `PRD${(productCount + 1).toString().padStart(4, '0')}`

    const product = await prisma.product.create({
      data: {
        code,
        name: data.name,
        unit: data.unit,
        price: 0, // Başlangıçta 0, alış faturalarından güncellenecek
        vatRate: parseFloat(data.vatRate),
        quantity: 0, // Başlangıçta stok 0
        minQuantity: 0, // Minimum stok miktarı 0
        category: "Genel", // Varsayılan kategori
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Ürün kayıt hatası:', error)
    return NextResponse.json({ error: 'Ürün kaydedilirken hata oluştu' }, { status: 500 })
  }
}