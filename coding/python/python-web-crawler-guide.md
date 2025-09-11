## 第一部分：Python语言基础

### Python简介和环境搭建

Python是一种简单易学、功能强大的编程语言。它语法简洁清晰，特别适合初学者学习。在本部分，我们将从零开始学习Python编程基础。</p>

**Python环境搭建**

1. 访问[Python官网](https://www.python.org/downloads/)下载安装包。
2. 运行安装程序（记得勾选`Add Python to PATH`）。
3. 安装完成后，在命令行输入 `python --version` 验证安装。


### 项目1-1：第一个Python程序

```python
# 打印欢迎信息
print("欢迎学习Python编程！")

# 变量使用
name = "小明"
age = 15

# 字符串格式化
print(f"{name}今年{age}岁，是一名中学生。")

# 基本运算
a = 10
b = 5
print(f"{a} + {b} = {a+b}")
print(f"{a} * {b} = {a*b}")

```

**知识点解析**

**print()函数**：用于输出信息到控制台

**变量**：存储数据的容器，如name和age

**字符串格式化**：f-string方式（Python 3.6+）

**基本运算符**：+、-、*、/ 等

**注释**：以#开头的内容不会被程序执行



### 项目1-2：简易计算器
```python
# 获取用户输入
num1 = float(input("请输入第一个数字: "))
num2 = float(input("请输入第二个数字: "))

# 选择运算类型
print("请选择运算：")
print("1. 加法")
print("2. 减法")
print("3. 乘法")
print("4. 除法")

choice = input("输入选择(1/2/3/4): ")

# 条件判断
if choice == '1':
        result = num1 + num2
        print(f"结果: {num1} + {num2} = {result}")
elif choice == '2':
        result = num1 - num2
        print(f"结果: {num1} - {num2} = {result}")
elif choice == '3':
        result = num1 * num2
        print(f"结果: {num1} × {num2} = {result}")
elif choice == '4':
        if num2 != 0:
                result = num1 / num2
                print(f"结果: {num1} ÷ {num2} = {result}")
        else:
                print("错误：除数不能为零！")
else:
        print("无效输入")

```

**知识点解析**

**input()函数**：获取用户输入

**类型转换**：float()将字符串转为浮点数

**条件语句**：if/elif/else实现多分支选择

**错误处理**：除法操作前检查除数是否为零

**格式化输出**：使用f-string格式化计算结果

            
### 项目1-3：猜数字游戏

```python
import random

def guess_number():
        # 生成随机数
        secret = random.randint(1, 100)
        attempts = 0

        print("欢迎来到猜数字游戏！")
        print("我已经想好了一个1到100之间的数字。")

        while True:
                try:
                        guess = int(input("\n请输入你猜的数字: "))
                        attempts += 1

                        if guess < secret:
                                print("太小了！再试一次。")
                        elif guess > secret:
                                print("太大了！再试一次。")
                        else:
                                print(f"恭喜你！你用了{attempts}次猜中了数字{secret}！")
                                break
                except ValueError:
                        print("请输入有效的整数！")

# 运行游戏
if __name__ == "__main__":
        guess_number()

```

**知识点解析**

**模块导入**：import random 导入随机模块

**函数定义**：def 创建可重用的代码块

**循环结构**：while循环实现重复输入

**异常处理**：try/except捕获输入错误

**随机数生成**：random.randint()生成随机整数


### Python基础知识要点总结

|概念|描述|示例|
|----|----|----|
|变量|存储数据的容器|name = "小明"|
|数据类型|整数(int)、浮点数(float)、字符串(str)、布尔值(bool)|age = 15<br>price = 9.99|
|输入输出|input()获取输入，print()输出信息|name = input("请输入姓名:")|
|条件语句|根据条件执行不同代码块|if age >= 18:<br>&nbsp;&nbsp;&nbsp;&nbsp;print("成年人")|
|循环结构|重复执行代码块|for i in range(5):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(i)|
|函数|封装可重用代码|def greet(name):<br>&nbsp;&nbsp;&nbsp;&nbsp;print(f"你好, {name}")|




