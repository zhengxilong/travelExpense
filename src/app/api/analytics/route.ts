import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '6months'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    }

    // Get all expenses within the time range
    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        user: true,
        expenseType: true,
      },
    })

    // Calculate basic statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0

    // Group by expense type
    const expenseTypeStats = new Map()
    expenses.forEach(expense => {
      const typeName = expense.expenseType.name
      if (!expenseTypeStats.has(typeName)) {
        expenseTypeStats.set(typeName, {
          name: typeName,
          total: 0,
          count: 0,
        })
      }
      const stats = expenseTypeStats.get(typeName)
      stats.total += expense.amount
      stats.count += 1
    })

    // Group by department
    const departmentStats = new Map()
    expenses.forEach(expense => {
      const department = expense.user.department || '未分类'
      if (!departmentStats.has(department)) {
        departmentStats.set(department, {
          name: department,
          total: 0,
          count: 0,
        })
      }
      const stats = departmentStats.get(department)
      stats.total += expense.amount
      stats.count += 1
    })

    // Group by user
    const userStats = new Map()
    expenses.forEach(expense => {
      const userName = expense.user.name
      if (!userStats.has(userName)) {
        userStats.set(userName, {
          name: userName,
          total: 0,
          count: 0,
        })
      }
      const stats = userStats.get(userName)
      stats.total += expense.amount
      stats.count += 1
    })

    // Group by month
    const monthlyStats = new Map()
    expenses.forEach(expense => {
      const month = expense.date.toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, {
          month,
          total: 0,
          count: 0,
        })
      }
      const stats = monthlyStats.get(month)
      stats.total += expense.amount
      stats.count += 1
    })

    // Convert Maps to Arrays and sort
    const expenseTypeData = Array.from(expenseTypeStats.values()).sort((a, b) => b.total - a.total)
    const departmentData = Array.from(departmentStats.values()).sort((a, b) => b.total - a.total)
    const userData = Array.from(userStats.values()).sort((a, b) => b.total - a.total)
    const monthlyData = Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      summary: {
        totalAmount,
        avgAmount,
        recordCount: expenses.length,
        timeRange,
      },
      expenseTypes: expenseTypeData,
      departments: departmentData,
      users: userData,
      monthly: monthlyData,
    })
  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}