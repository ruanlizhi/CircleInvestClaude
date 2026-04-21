# Circle 稳定币数据观察站 — 实施规划

## Context

为Circle投资研究搭建配套数据观察工具。Circle收入 = USDC储备规模 × 国债利率，网站追踪三个核心变量：稳定币市场规模、USDC份额、利率水平。

**数据更新频率：每天一次。** 用定时脚本拉取API数据，生成静态JSON文件，前端读本地数据。不做实时API调用。

---

## 原计划审查：需纠正的问题

1. **DefiLlama ID映射错误**：原计划写 USDC id=1, USDT id=2。实际验证：**USDT = ID 1**，USDC的ID需从完整响应确认
2. **时间戳格式不统一**：DefiLlama用Unix秒，CoinGecko用Unix毫秒——在数据拉取脚本中统一为ISO日期字符串
3. **CoinGecko免费层限制**：30次/分钟，每天只调一次则无问题
4. **FRED API key**：只在数据拉取脚本（服务端/CI）中使用，不暴露到前端

---

## 架构

```
每日定时任务 (GitHub Actions cron)
  ├── 运行 scripts/fetch-data.ts
  ├── 调用 DefiLlama / CoinGecko / FRED API
  ├── 计算衍生指标（份额%、预估收入）
  ├── 输出 public/data/*.json
  └── 自动 commit + deploy

用户浏览器
  ├── 加载静态页面
  ├── fetch /data/*.json（本地静态文件）
  └── 渲染图表
```

**好处**：
- 页面秒开（不等API响应）
- 无API限流问题
- FRED key不暴露到客户端
- 离线也能看上次的数据

---

## 技术选型

| 选项 | 选择 | 理由 |
|------|------|------|
| 框架 | **React + Vite + TypeScript** | 类型安全，组件化管理6个图表 |
| 图表 | **ECharts (echarts-for-react)** | 功能全、交互好、面积图/折线图/柱状图原生支持 |
| 样式 | **Tailwind CSS** | 快速布局，响应式 |
| 数据拉取 | **Node.js 脚本 (TypeScript)** | 与前端共享类型定义 |
| 定时任务 | **GitHub Actions cron** | 每天UTC 00:00跑一次，免费 |
| 部署 | **GitHub Pages 或 Vercel** | 静态站免费部署 |

---

## 实施步骤

### Phase 1: 项目初始化 + 数据拉取脚本

1. `npm create vite@latest` 创建 React + TypeScript 项目
2. 安装依赖：`echarts`, `echarts-for-react`, `tailwindcss`, `axios`, `tsx`（运行TS脚本）
3. 创建数据拉取脚本 `scripts/fetch-data.ts`：
   - 调用 DefiLlama `/stablecoins` 获取总市值 + USDC/USDT数据
   - 调用 DefiLlama `/stablecoin/{id}` 获取USDC和USDT历史市值
   - 调用 CoinGecko 获取USDC交易量
   - 调用 FRED 获取3月国债利率
   - 计算衍生指标：USDC份额%、Circle预估年收入
   - 统一时间戳格式为 `YYYY-MM-DD`
   - 输出到 `public/data/` 下的JSON文件
4. 手动运行脚本，确认数据正确

**输出的JSON文件**：
```
public/data/
├── stablecoin-total-mcap.json    # [{date, totalMcap}]
├── usdc-usdt-mcap.json           # [{date, usdcMcap, usdtMcap}]
├── usdc-market-share.json        # [{date, sharePercent}]
├── treasury-rate.json            # [{date, rate}]
├── usdc-volume.json              # [{date, volume}]
├── estimated-revenue.json        # [{date, revenue}]
└── current-metrics.json          # {totalMcap, usdcMcap, sharePercent, rate, revenue, updatedAt}
```

### Phase 2: 前端图表组件

逐个构建6个图表组件 `src/components/charts/`：

| 顺序 | 组件 | 读取数据文件 | 图表类型 |
|------|------|-------------|---------|
| 1 | `StablecoinMarketCap.tsx` | stablecoin-total-mcap.json | 面积图 |
| 2 | `UsdcVsUsdt.tsx` | usdc-usdt-mcap.json | 双线图 |
| 3 | `UsdcMarketShare.tsx` | usdc-market-share.json | 折线图 + 事件标注 |
| 4 | `TreasuryRate.tsx` | treasury-rate.json | 折线图 |
| 5 | `UsdcVolume.tsx` | usdc-volume.json | 柱状图 |
| 6 | `EstimatedRevenue.tsx` | estimated-revenue.json | 折线图 |

每个图表支持时间范围切换（1M / 3M / 1Y / ALL），前端从完整数据中筛选日期范围。

### Phase 3: 指标卡片 + 页面布局

- 顶部5个指标卡片，读取 `current-metrics.json`
- 单页布局：标题 + 更新时间 → 指标卡片 → 图表网格(2×3) → 数据源说明
- 深色主题
- 响应式：桌面2列，移动端1列

### Phase 4: GitHub Actions 自动更新

创建 `.github/workflows/update-data.yml`：
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 00:00
  workflow_dispatch:       # 手动触发
jobs:
  update:
    - checkout
    - setup node
    - npm install
    - run: npx tsx scripts/fetch-data.ts
      env:
        FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
    - commit & push data changes
    - trigger deploy
```

### Phase 5: 部署

- Vercel 连接 GitHub repo，push 自动部署
- 或 GitHub Pages（GitHub Actions build 后 deploy）
- 配置 `FRED_API_KEY` 为 repo secret

---

## 项目结构

```
circle/
├── .github/workflows/
│   └── update-data.yml         # 每日定时拉数据
├── scripts/
│   └── fetch-data.ts           # 数据拉取+计算脚本
├── public/
│   └── data/                   # 静态JSON数据（git tracked）
│       ├── stablecoin-total-mcap.json
│       ├── usdc-usdt-mcap.json
│       ├── usdc-market-share.json
│       ├── treasury-rate.json
│       ├── usdc-volume.json
│       ├── estimated-revenue.json
│       └── current-metrics.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── MetricCards.tsx
│   │   ├── ChartCard.tsx       # 通用容器（标题+时间切换+图表）
│   │   └── charts/
│   │       ├── StablecoinMarketCap.tsx
│   │       ├── UsdcVsUsdt.tsx
│   │       ├── UsdcMarketShare.tsx
│   │       ├── TreasuryRate.tsx
│   │       ├── UsdcVolume.tsx
│   │       └── EstimatedRevenue.tsx
│   ├── hooks/
│   │   └── useChartData.ts     # fetch JSON + 时间筛选
│   ├── utils/
│   │   └── format.ts           # $1.2B 等格式化
│   └── types/
│       └── index.ts
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── PLAN.md
```

---

## 验证方式

1. 手动运行 `npx tsx scripts/fetch-data.ts`，确认 `public/data/` 下7个JSON文件生成且内容正确
2. `npm run dev` 启动开发服务器，浏览器确认6个图表正确渲染
3. 点击时间范围切换，确认图表响应
4. 检查指标卡片数值与图表一致
5. 缩小窗口确认响应式布局
6. `npm run build` 无错误
7. 模拟 GitHub Actions 流程：拉数据 → commit → build → deploy
