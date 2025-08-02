"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseTable } from "@/components/expense-table"
import { ExpenseAnalytics } from "@/components/expense-analytics"
import { OverviewStats } from "@/components/overview-stats"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const handleExpenseCreated = () => {
    setRefreshKey(prev => prev + 1)
    toast({
      title: "成功",
      description: "费用记录已添加",
    })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">差旅费用统计系统</h1>
              <p className="text-muted-foreground mt-1">管理和分析您的差旅费用</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                今日: {new Date().toLocaleDateString('zh-CN')}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="add-expense">添加费用</TabsTrigger>
            <TabsTrigger value="expenses">费用记录</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewStats key={refreshKey} onTabChange={handleTabChange} />
          </TabsContent>

          <TabsContent value="add-expense">
            <Card>
              <CardHeader>
                <CardTitle>添加费用记录</CardTitle>
                <CardDescription>录入新的差旅费用信息</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm onExpenseCreated={handleExpenseCreated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>费用记录</CardTitle>
                <CardDescription>查看和管理所有费用记录</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTable key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>数据分析</CardTitle>
                <CardDescription>多维度费用统计和趋势分析</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseAnalytics key={refreshKey} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}