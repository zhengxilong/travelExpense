import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const expenses = await db.expense.findMany({
      include: {
        user: true,
        expenseType: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: offset,
      take: limit,
    })

    const total = await db.expense.count()

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userName,
      userEmail,
      userDepartment,
      expenseType,
      amount,
      description,
      date,
      location,
    } = body

    // Find or create user
    let user = await db.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { name: userName },
        ],
      },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          name: userName,
          email: userEmail,
          department: userDepartment,
        },
      })
    }

    // Find or create expense type
    let expenseTypeObj = await db.expenseType.findFirst({
      where: {
        name: expenseType,
      },
    })

    if (!expenseTypeObj) {
      const typeDescriptions: Record<string, string> = {
        hotel: '酒店住宿费用',
        flight: '机票费用',
        train: '火车票费用',
        transport: '市内交通费用',
      }
      
      expenseTypeObj = await db.expenseType.create({
        data: {
          name: expenseType,
          description: typeDescriptions[expenseType] || `${expenseType}费用`,
        },
      })
    }

    // Create expense
    const expense = await db.expense.create({
      data: {
        userId: user.id,
        expenseTypeId: expenseTypeObj.id,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        location,
      },
      include: {
        user: true,
        expenseType: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}