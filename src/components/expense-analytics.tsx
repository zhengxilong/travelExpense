"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { zhCN } from "date-fns/locale"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

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

interface ExpenseAnalyticsProps {
  refreshTrigger?: number
}

export function ExpenseAnalytics({ refreshTrigger }: ExpenseAnalyticsProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("6months")

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

  const getFilteredExpenses = () => {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case "1month":
        startDate = subMonths(now, 1)
        break
      case "3months":
        startDate = subMonths(now, 3)
        break
      case "6months":
        startDate = subMonths(now, 6)
        break
      case "1year":
        startDate = subMonths(now, 12)
        break
      default:
        startDate = subMonths(now, 6)
    }

    return expenses.filter(expense => 
      isWithinInterval(new Date(expense.date), { start: startDate, end: now })
    )
  }

  const getExpenseTypeData = () => {
    const filteredExpenses = getFilteredExpenses()
    const typeMap = new Map<string, number>()
    
    const typeLabels: Record<string, string> = {
      hotel: '酒店住宿',
      flight: '机票',
      train: '火车票',
      transport: '市内交通',
    }

    filteredExpenses.forEach(expense => {
      const label = typeLabels[expense.expenseType.name] || expense.expenseType.name
      typeMap.set(label, (typeMap.get(label) || 0) + expense.amount)
    })

    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const getMonthlyTrendData = () => {
    const filteredExpenses = getFilteredExpenses()
    const monthlyData = new Map<string, number>()
    
    // 生成过去12个月的月份标签
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthKey = format(date, 'yyyy-MM')
      monthlyData.set(monthKey, 0)
    }

    // 累加每月费用
    filteredExpenses.forEach(expense => {
      const monthKey = format(new Date(expense.date), 'yyyy-MM')
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, monthlyData.get(monthKey)! + expense.amount)
      }
    })

    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month: format(new Date(month + '-01'), 'yyyy年MM月'),
      amount,
    }))
  }

  const getDepartmentData = () => {
    const filteredExpenses = getFilteredExpenses()
    const departmentMap = new Map<string, number>()
    
    filteredExpenses.forEach(expense => {
      const department = expense.user.department || '未分类'
      departmentMap.set(department, (departmentMap.get(department) || 0) + expense.amount)
    })

    return Array.from(departmentMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const getUserRankingData = () => {
    const filteredExpenses = getFilteredExpenses()
    const userMap = new Map<string, { name: string; amount: number; count: number }>()
    
    filteredExpenses.forEach(expense => {
      const userName = expense.user.name
      const current = userMap.get(userName) || { name: userName, amount: 0, count: 0 }
      userMap.set(userName, {
        name: userName,
        amount: current.amount + expense.amount,
        count: current.count + 1,
      })
    })

    return Array.from(userMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  const filteredExpenses = getFilteredExpenses()
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const avgAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">最近1个月</SelectItem>
              <SelectItem value="3months">最近3个月</SelectItem>
              <SelectItem value="6months">最近6个月</SelectItem>
              <SelectItem value="1year">最近1年</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">¥{totalAmount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">总费用</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">¥{avgAmount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">平均费用</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
            <div className="text-sm text-muted-foreground">记录数量</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览分析</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="departments">部门分析</TabsTrigger>
          <TabsTrigger value="users">用户排行</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>费用类型分布</CardTitle>
                <CardDescription>各类费用的金额占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getExpenseTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getExpenseTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>费用类型统计</CardTitle>
                <CardDescription>各类费用的详细统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getExpenseTypeData().map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">¥{item.value.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {((item.value / totalAmount) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>月度费用趋势</CardTitle>
              <CardDescription>过去12个月的费用变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getMonthlyTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="费用金额"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>部门费用统计</CardTitle>
              <CardDescription>各部门的费用金额对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getDepartmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="费用金额" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户费用排行</CardTitle>
              <CardDescription>按费用金额排序的用户排行榜</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUserRankingData().map((user, index) => (
                  <div key={user.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.count} 笔记录</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">¥{user.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        平均 ¥{(user.amount / user.count).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}