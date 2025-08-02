"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const expenseFormSchema = z.object({
  userName: z.string().min(2, "姓名至少需要2个字符"),
  userEmail: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  userDepartment: z.string().optional(),
  expenseType: z.string().min(1, "请选择费用类型"),
  amount: z.string().min(1, "请输入金额"),
  description: z.string().optional(),
  date: z.string().min(1, "请选择日期"),
  location: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
  onExpenseCreated: () => void
}

export function ExpenseForm({ onExpenseCreated }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userDepartment: "",
      expenseType: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      location: "",
    },
  })

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('创建费用记录失败')
      }

      toast.success('费用记录创建成功')
      form.reset()
      onExpenseCreated()
    } catch (error) {
      console.error('Error creating expense:', error)
      toast.error('创建费用记录失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">用户信息</CardTitle>
            <CardDescription>填写费用发生人的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">姓名 *</Label>
              <Input
                id="userName"
                placeholder="请输入姓名"
                {...form.register("userName")}
              />
              {form.formState.errors.userName && (
                <p className="text-sm text-red-500">{form.formState.errors.userName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userEmail">邮箱</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="请输入邮箱地址"
                {...form.register("userEmail")}
              />
              {form.formState.errors.userEmail && (
                <p className="text-sm text-red-500">{form.formState.errors.userEmail.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userDepartment">部门</Label>
              <Input
                id="userDepartment"
                placeholder="请输入部门名称"
                {...form.register("userDepartment")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">费用信息</CardTitle>
            <CardDescription>填写费用的详细信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseType">费用类型 *</Label>
              <Select onValueChange={(value) => form.setValue("expenseType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择费用类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">酒店住宿</SelectItem>
                  <SelectItem value="flight">机票</SelectItem>
                  <SelectItem value="train">火车票</SelectItem>
                  <SelectItem value="transport">市内交通</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.expenseType && (
                <p className="text-sm text-red-500">{form.formState.errors.expenseType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">金额 (¥) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">日期 *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">地点</Label>
              <Input
                id="location"
                placeholder="请输入费用发生地点"
                {...form.register("location")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">补充信息</CardTitle>
          <CardDescription>费用的详细描述和其他信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">费用描述</Label>
            <Textarea
              id="description"
              placeholder="请输入费用的详细描述..."
              className="min-h-[100px]"
              {...form.register("description")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isSubmitting}
        >
          重置
        </Button>
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "创建中..." : "创建费用记录"}
        </Button>
      </div>
    </div>
  )
}