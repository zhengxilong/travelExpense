"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Search, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

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

interface ExpenseTableProps {
  refreshTrigger?: number
}

export function ExpenseTable({ refreshTrigger }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      } else {
        toast.error('获取费用记录失败')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('获取费用记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('费用记录删除成功')
        fetchExpenses()
      } else {
        toast.error('删除费用记录失败')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('删除费用记录失败')
    }
  }

  const getExpenseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: '酒店住宿',
      flight: '机票',
      train: '火车票',
      transport: '市内交通',
    }
    return labels[type] || type
  }

  const getExpenseTypeBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      hotel: 'default',
      flight: 'secondary',
      train: 'outline',
      transport: 'destructive',
    }
    return variants[type] || 'default'
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || expense.expenseType.name === filterType
    
    return matchesSearch && matchesType
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索费用记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="筛选费用类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="hotel">酒店住宿</SelectItem>
              <SelectItem value="flight">机票</SelectItem>
              <SelectItem value="train">火车票</SelectItem>
              <SelectItem value="transport">市内交通</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-lg font-semibold">
          总计: ¥{totalAmount.toFixed(2)}
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">暂无费用记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户信息</TableHead>
                <TableHead>费用类型</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>地点</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.user.name}</div>
                      {expense.user.email && (
                        <div className="text-sm text-muted-foreground">{expense.user.email}</div>
                      )}
                      {expense.user.department && (
                        <div className="text-sm text-muted-foreground">{expense.user.department}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getExpenseTypeBadgeVariant(expense.expenseType.name)}>
                      {getExpenseTypeLabel(expense.expenseType.name)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ¥{expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(expense.date), 'yyyy年MM月dd日', { locale: zhCN })}
                  </TableCell>
                  <TableCell>{expense.location || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info('编辑功能开发中')
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}