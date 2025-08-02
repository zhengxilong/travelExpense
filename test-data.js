// 测试数据脚本 - 用于初始化一些示例数据
const testData = [
  {
    userName: "张三",
    userEmail: "zhangsan@example.com",
    userDepartment: "技术部",
    expenseType: "hotel",
    amount: 350.00,
    description: "北京出差住宿费",
    date: "2024-01-15",
    location: "北京"
  },
  {
    userName: "李四",
    userEmail: "lisi@example.com",
    userDepartment: "市场部",
    expenseType: "flight",
    amount: 1200.00,
    description: "上海出差机票",
    date: "2024-01-20",
    location: "上海"
  },
  {
    userName: "王五",
    userEmail: "wangwu@example.com",
    userDepartment: "销售部",
    expenseType: "train",
    amount: 450.00,
    description: "广州出差高铁票",
    date: "2024-02-05",
    location: "广州"
  },
  {
    userName: "赵六",
    userEmail: "zhaoliu@example.com",
    userDepartment: "技术部",
    expenseType: "transport",
    amount: 85.50,
    description: "深圳市内交通",
    date: "2024-02-10",
    location: "深圳"
  },
  {
    userName: "张三",
    userEmail: "zhangsan@example.com",
    userDepartment: "技术部",
    expenseType: "hotel",
    amount: 280.00,
    description: "杭州出差住宿",
    date: "2024-02-15",
    location: "杭州"
  }
];

console.log('测试数据示例：');
console.log(JSON.stringify(testData, null, 2));
console.log('\n使用方法：');
console.log('1. 在浏览器中打开 http://localhost:3000');
console.log('2. 手动在"添加费用"页面录入上述数据');
console.log('3. 或者使用浏览器的开发者工具在Console中运行以下代码：');
console.log(`
// 批量创建测试数据
testData.forEach(async (data) => {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    console.log('创建成功:', data);
  } else {
    console.error('创建失败:', data);
  }
});
`);