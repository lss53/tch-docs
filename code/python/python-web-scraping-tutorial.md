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

## 第二部分：爬虫基础知识

网络爬虫是一种自动获取网页内容的程序。它模拟人类浏览网页的行为，从互联网上抓取所需的信息。

`爬虫程序，发送请求` → `目标网站，返回HTML` → `解析内容，提取数据` → `保存数据，CSV/JSON/数据库`

### 项目2-1：获取网页内容

```python
# 导入requests库
import requests

# 目标网页URL
url = "https://www.example.com"

# 发送HTTP GET请求
response = requests.get(url)

# 检查响应状态码
if response.status_code == 200:
        print("请求成功！")
        # 打印网页内容的前500个字符
        print(response.text[:500])
else:
        print(f"请求失败，状态码: {response.status_code}")
```

**知识点解析**

**HTTP协议**：客户端与服务器通信的基础

**requests库**：发送HTTP请求的Python库

**GET请求**：获取网页内容的基本方法

**状态码**：200表示成功，404表示未找到

**响应内容**：response.text包含网页HTML

### 项目2-2：解析HTML页面

```python
# 导入BeautifulSoup库
from bs4 import BeautifulSoup
import requests

# 获取网页内容
url = "https://books.toscrape.com/"
response = requests.get(url)
html_content = response.text

# 创建BeautifulSoup对象
soup = BeautifulSoup(html_content, 'html.parser')

# 查找所有书籍标题
books = soup.find_all('h3')

# 打印前5本书的标题
print("前5本书籍标题：")
for i, book in enumerate(books[:5], 1):
        title = book.a['title']
        print(f"{i}. {title}")
```

**知识点解析**

**HTML结构**：网页由标签、属性和内容组成

**BeautifulSoup**：解析HTML/XML的Python库

**查找元素**：find()和find_all()方法

**元素属性**：通过['属性名']获取属性值

**CSS选择器**：select()方法使用CSS选择器

### 项目2-3：天气预报爬虫
```python
import requests
from bs4 import BeautifulSoup

def get_weather(city_code):
        url = f"http://www.weather.com.cn/weather/{city_code}.shtml"
        headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
        }

        try:
                response = requests.get(url, headers=headers)
                response.encoding = "utf-8"
                
                if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')
                        weather_div = soup.find("div", class_="today")
                        
                        if weather_div:
                                city = weather_div.find("h1").text
                                weather = weather_div.find("p", class_="wea").text
                                temperature = weather_div.find("p", class_="tem").text.strip()
                                
                                print(f"{city}天气预报：")
                                print(f"天气状况：{weather}")
                                print(f"温度：{temperature}")
                        else:
                                print("未找到天气信息")
                else:
                        print(f"请求失败，状态码：{response.status_code}")
        except Exception as e:
                print(f"获取天气信息时出错: {e}")

# 使用示例
get_weather("101010100")  # 北京
```

**知识点解析**

**请求头设置**：模拟浏览器访问避免被拒绝

**异常处理**：try/except捕获可能出现的错误

**数据提取**：从特定元素中获取文本内容

**编码处理**：response.encoding解决中文乱码

**城市代码**：不同城市有不同的气象代码

### 爬虫基础知识要点总结

|概念|描述|重要方法/属性|
|----|----|----|
|HTTP请求|客户端向服务器请求数据|requests.get()<br>requests.post()|
|HTML解析|从HTML中提取结构化数据|BeautifulSoup()<br>find()<br>find_all()|
|数据提取|获取元素内容和属性|.text<br>['属性名']|
|请求头|模拟浏览器访问|User-Agent<br>Referer|
|状态码|服务器响应状态|200(成功)<br>404(未找到)<br>503(服务不可用)|

## 第三部分：爬虫进阶知识

在掌握基础爬虫技能后，我们将学习更高级的技术：处理分页数据、存储爬取结果、应对网站反爬措施以及处理动态加载的内容。

### 项目3-1：豆瓣电影Top250爬取
```python
import requests
from bs4 import BeautifulSoup
import time

base_url = "https://movie.douban.com/top250"
headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
}

movies = []

# 循环爬取10页数据
for start in range(0, 250, 25):
        url = f"{base_url}?start={start}"
        print(f"正在爬取: {url}")

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 查找所有电影条目
        items = soup.find_all('div', class_='item')
        for item in items:
                title = item.find('span', class_='title').text
                rating = item.find('span', class_='rating_num').text
                quote_tag = item.find('span', class_='inq')
                quote = quote_tag.text if quote_tag else "无"

                movies.append({
                        "title": title,
                        "rating": rating,
                        "quote": quote
                })

        # 礼貌性延迟，避免请求过快
        time.sleep(1.5)

print(f"成功爬取{len(movies)}部电影信息！")
```

**知识点解析**

**分页处理**：分析URL规律实现多页爬取

**数据封装**：使用字典存储单条数据

**列表存储**：使用列表存储所有数据

**请求延迟**：time.sleep()避免请求过快

**空值处理**：处理可能缺失的字段

### 项目3-2：数据存储到CSV文件
```python
import csv

# 假设movies是上一项目中获取的数据
# movies = [
#   {"title": "肖申克的救赎", "rating": "9.7", ...},
#   ...
# ]

# 定义CSV文件名和表头
filename = "douban_top250.csv"
headers = ["title", "rating", "quote"]

# 写入CSV文件
with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()  # 写入表头
        writer.writerows(movies)  # 写入所有数据

print(f"数据已保存到{filename}")
```
    
**知识点解析**

**CSV格式**：逗号分隔值，通用数据存储格式

**csv模块**：Python标准库中的CSV处理模块

**文件操作**：with open()安全地打开文件

**编码处理**：utf-8-sig解决Excel中文乱码

**DictWriter**：将字典数据写入CSV文件

### 项目3-3：使用Selenium处理动态网页

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

# 设置ChromeDriver路径
service = Service(executable_path='chromedriver.exe')
driver = webdriver.Chrome(service=service)

# 访问目标网站
driver.get("https://www.jd.com")
print("页面标题:", driver.title)

# 查找搜索框并输入关键词
search_box = driver.find_element(By.ID, "key")
search_box.send_keys("Python编程")

# 查找搜索按钮并点击
search_button = driver.find_element(
        By.CSS_SELECTOR, ".button")
search_button.click()

# 等待页面加载
time.sleep(2)

# 获取商品列表
products = driver.find_elements(
        By.CSS_SELECTOR, ".gl-item")

print(f"找到{len(products)}个商品：")
for i, product in enumerate(products[:5], 1):
        name = product.find_element(
                By.CSS_SELECTOR, ".p-name em").text
        price = product.find_element(
                By.CSS_SELECTOR, ".p-price").text
        print(f"{i}. {name} - {price}")

# 关闭浏览器
driver.quit()
```

**知识点解析**

**Selenium**：自动化测试工具，用于动态网页

**浏览器驱动**：需要下载对应浏览器的驱动

**元素定位**：多种方式定位页面元素

**页面交互**：输入文本、点击按钮等操作

**等待机制**：time.sleep()或显式等待

### 爬虫进阶知识要点总结

|主题|技术/工具|应用场景|
|----|----|----|
|分页爬取|URL分析、循环请求|多页数据采集|
|数据存储|CSV、JSON、数据库|保存爬取结果|
|动态网页|Selenium、Playwright|处理JavaScript渲染|
|反爬应对|User-Agent、代理IP、延迟|绕过网站反爬机制|
|爬虫道德|robots.txt、合理请求频率|合法合规爬取|


