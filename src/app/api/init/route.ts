import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Initialize expense types
    const expenseTypes = [
      { name: 'hotel', description: '酒店住宿费用' },
      { name: 'flight', description: '机票费用' },
      { name: 'train', description: '火车票费用' },
      { name: 'transport', description: '市内交通费用' },
    ]

    for (const type of expenseTypes) {
      await db.expenseType.upsert({
        where: { name: type.name },
        update: {},
        create: type,
      })
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      expenseTypes: expenseTypes.length 
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}