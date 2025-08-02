# Git文件修改时间查询工具

这是一个Node.js工具，用于获取Git仓库中修改文件的修改时间，并按修改时间倒序排列输出。

## 功能特点

- 自动执行 `git status --porcelain` 命令获取修改的文件列表
- 获取每个文件的详细修改时间
- 按修改时间倒序排列（最新修改的文件在前）
- 输出格式包括：序号、文件相对路径、修改时间
- 支持自定义目标目录
- **支持时间过滤**：只显示指定时间之后修改的文件
- 提供详细的帮助信息和错误处理

## 安装要求

- Node.js >= 12.0.0
- Git（系统中需要安装Git并且目标目录是Git仓库）

## 使用方法

### 方法1：使用默认目录

```bash
node git-file-times.js
```

默认会查询目录：`/Users/flashcloudf/dev/mobile_dev/worksapce/sungole-icloud/grsoft/litemall`

### 方法2：指定自定义目录

```bash
node git-file-times.js /path/to/your/git/repository
```

### 方法3：使用时间过滤

```bash
# 只显示2025-07-31之后修改的文件
node git-file-times.js /path/to/repo 2025-07-31

# 只显示指定时间点之后修改的文件
node git-file-times.js /path/to/repo "2025-07-31 15:00:00"
```

### 方法4：使用npm脚本

```bash
npm start
# 或者
npm test
```

### 查看帮助信息

```bash
node git-file-times.js --help
# 或者
node git-file-times.js -h
```

## 输出示例

### 基本输出

```text
Git文件修改时间查询工具
========================

=== Git修改文件列表（按修改时间倒序排列）===
目标目录: /Users/flashcloudf/dev/mobile_dev/worksapce/sungole-icloud/grsoft/litemall
找到 12 个文件

12. litemall-vue/src/views/login/login.vue, 2025-07-31 16:29:05
11. litemall-vue/src/views/order/checkout.vue, 2025-07-31 16:00:53
10. litemall-vue/public/index.html, 2025-07-31 15:54:57
...
```

### 使用时间过滤的输出

```text
Git文件修改时间查询工具
========================

=== Git修改文件列表（按修改时间倒序排列）===
目标目录: /Users/flashcloudf/dev/mobile_dev/worksapce/sungole-icloud/grsoft/litemall
时间过滤: 只显示 2025-07-31 15:00:00 之后修改的文件
找到 3 个文件 (总共 12 个修改文件)

3. litemall-vue/src/views/login/login.vue, 2025-07-31 16:29:05
2. litemall-vue/src/views/order/checkout.vue, 2025-07-31 16:00:53
1. litemall-vue/public/index.html, 2025-07-31 15:54:57
```

## 工作原理

1. 使用 `child_process.execSync()` 执行 `git status --porcelain` 命令
2. 解析Git输出获取修改文件的相对路径
3. 使用 `fs.statSync()` 获取每个文件的修改时间
4. 如果指定了时间过滤条件，过滤出符合条件的文件
5. 按修改时间进行倒序排列
6. 格式化输出结果

## 时间格式支持

- `YYYY-MM-DD`：日期格式，例如 `2025-07-30`（会自动补充为 00:00:00）
- `YYYY-MM-DD HH:mm:ss`：完整时间格式，例如 `2025-07-30 14:30:00`

## 命令行参数

```bash
node git-file-times.js [目标目录] [时间过滤]
```

- **目标目录**（可选）：Git仓库的路径，默认为预设路径
- **时间过滤**（可选）：只显示指定时间之后修改的文件

## 示例用法

```bash
# 基本用法 - 显示所有修改文件
node git-file-times.js

# 指定目录
node git-file-times.js /path/to/repo

# 时间过滤 - 只显示7月31日之后的文件
node git-file-times.js /path/to/repo 2025-07-31

# 精确时间过滤 - 只显示指定时间点之后的文件
node git-file-times.js /path/to/repo "2025-07-31 15:00:00"

# 查看帮助
node git-file-times.js --help
```

## 错误处理

- 目录不存在时会显示错误信息并退出
- 无效的时间格式会显示错误信息和支持的格式示例
- 无法访问的文件会显示警告但不会中断程序执行
- Git命令执行失败时会显示错误信息

## 文件结构

```text
git-modify-time/
├── git-file-times.js    # 主程序文件
├── package.json         # 项目配置文件
└── README.md           # 说明文档
```

## 许可证

MIT License
