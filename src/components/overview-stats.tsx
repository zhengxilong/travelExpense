"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Expense {
  id: string
  amount: number
  description: string | null
  date: string
  location: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string | null
    department: string | null
  }
  expenseType: {
    id: string
    name: string
    description: string | null
  }
}

interface OverviewStatsProps {
  refreshTrigger?: number
  onTabChange?: (value: string) => void
}

export function OverviewStats({ refreshTrigger, onTabChange }: OverviewStatsProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [refreshTrigger])

  const calculateStats = () => {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const currentMonthExpenses = expenses.filter(expense => 
      isWithinInterval(new Date(expense.date), { start: currentMonthStart, end: currentMonthEnd })
    )
    const currentMonthAmount = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0

    return {
      totalAmount,
      currentMonthAmount,
      recordCount: expenses.length,
      avgAmount,
    }
  }

  const getExpenseTypeData = () => {
    const typeMap = new Map<string, number>()
    
    const typeLabels: Record<string, string> = {
      hotel: '酒店住宿',
      flight: '机票',
      train: '火车票',
      transport: '市内交通',
    }

    expenses.forEach(expense => {
      const label = typeLabels[expense.expenseType.name] || expense.expenseType.name
      typeMap.set(label, (typeMap.get(label) || 0) + expense.amount)
    })

    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const stats = calculateStats()
  const expenseTypeData = getExpenseTypeData()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总费用</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">累计费用</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月费用</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.currentMonthAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">当前月份</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">记录数量</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recordCount}</div>
            <p className="text-xs text-muted-foreground">费用记录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均费用</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.avgAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">每笔平均</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快捷入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <button
                onClick={() => onTabChange?.('add-expense')}
                className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">添加新费用</div>
                <div className="text-sm text-muted-foreground">录入新的差旅费用记录</div>
              </button>
              <button
                onClick={() => onTabChange?.('expenses')}
                className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">查看费用记录</div>
                <div className="text-sm text-muted-foreground">浏览和管理所有费用</div>
              </button>
              <button
                onClick={() => onTabChange?.('analytics')}
                className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="font-medium">数据分析</div>
                <div className="text-sm text-muted-foreground">查看费用统计和趋势</div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>费用类型分布</CardTitle>
            <CardDescription>各类费用占比情况</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseTypeData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`¥${value}`, '金额']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {expenseTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ¥{item.value.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}