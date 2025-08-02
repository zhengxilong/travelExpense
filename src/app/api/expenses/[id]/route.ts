import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await db.expense.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
        expenseType: true,
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update expense
    const expense = await db.expense.update({
      where: {
        id: params.id,
      },
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

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.expense.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}