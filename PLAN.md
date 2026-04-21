# 稳定币数据观察站 — 建站方案

> 目的：持续追踪USDT/USDC核心数据，为Circle估值决策树提供可视化的数据观察面板。
> 创建日期：2026-04-21

---

## 背景

这个网站是Circle投资研究的配套工具。Circle的收入 = USDC储备规模 × 国债利率，所以需要持续观察：稳定币市场有多大、USDC占多少份额、利率是多少。这三个变量的历史趋势和实时状态，是判断Circle估值的地基。

---

## 第一版：6个图表

先做最小可用版本，6个图表覆盖估值决策树的核心变量。

### 图表1：稳定币总市值趋势
- **对应决策树**：Layer 1（TAM）
- **数据**：所有稳定币总市值，日级别，历史趋势
- **图表类型**：面积图
- **数据源**：DefiLlama `/stablecoins`
- **观察要点**：总盘子在涨还是缩？增速如何？

### 图表2：USDC vs USDT 市值对比
- **对应决策树**：Layer 2（份额）
- **数据**：USDC市值、USDT市值，双线
- **图表类型**：双线图
- **数据源**：DefiLlama `/stablecoin/{id}`（USDC id=1, USDT id=2，需确认）
- **观察要点**：两条线的差距在拉大还是缩小？

### 图表3：USDC市场份额
- **对应决策树**：Layer 2（份额）— 最核心的一条线
- **数据**：USDC市值 / 稳定币总市值 × 100%
- **图表类型**：折线图，标注关键事件（MiCA生效、GENIUS Act等）
- **数据源**：图表1和图表2的数据计算得出
- **观察要点**：份额趋势方向和拐点

### 图表4：美国短期国债利率
- **对应决策树**：Layer 3（利息基本盘）
- **数据**：3个月国债利率（DGS3MO）或联邦基金利率（FEDFUNDS）
- **图表类型**：折线图
- **数据源**：FRED API，series_id=`DGS3MO`
- **观察要点**：利率下行多少？Circle的利润空间在压缩还是稳定？

### 图表5：USDC日交易量
- **对应决策树**：Layer 1场景A（交易结算活跃度）
- **数据**：USDC 24h交易量
- **图表类型**：柱状图
- **数据源**：CoinGecko `/coins/usd-coin/market_chart`
- **观察要点**：交易量趋势，是否与市值增长同步

### 图表6：Circle预估年收入（计算指标）
- **对应决策树**：Layer 3 + Layer 5
- **数据**：USDC市值 × 国债利率 × 50%（扣除Coinbase分成）
- **图表类型**：折线图
- **数据源**：图表2（USDC市值）+ 图表4（利率）计算得出
- **观察要点**：这条线是Circle赚钱能力的直接可视化。看它随时间的变化，尤其是利率下降时收入是否被市值增长对冲

---

## 数据源

| 数据源 | 用途 | API基地址 | 认证 | 限制 |
|--------|------|-----------|------|------|
| DefiLlama | 稳定币市值、份额、链上数据 | `https://stablecoins.llama.fi` | 无需key | 无明确限制 |
| CoinGecko | 交易量、价格历史 | `https://api.coingecko.com/api/v3` | 无需key（免费层） | 30次/分钟 |
| FRED | 美国国债利率 | `https://api.stlouisfed.org/fred` | 需申请API key（免费） | 无明确限制 |

### DefiLlama 关键接口

```
# 所有稳定币概览（含历史市值）
GET https://stablecoins.llama.fi/stablecoins?includePrices=true

# 单个稳定币详情（含按链拆分的历史市值）
GET https://stablecoins.llama.fi/stablecoin/{id}

# 所有稳定币按链分布
GET https://stablecoins.llama.fi/stablecoinchains
```

### CoinGecko 关键接口

```
# USDC历史市值和交易量
GET https://api.coingecko.com/api/v3/coins/usd-coin/market_chart?vs_currency=usd&days=365
```

### FRED 关键接口

```
# 3个月国债利率
GET https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO&api_key={key}&file_type=json
```

---

## 技术方案

### 架构：纯前端静态站

```
用户浏览器
  ├── 页面加载
  ├── 直接调 DefiLlama / CoinGecko / FRED API
  ├── 前端计算衍生指标（份额%、预估收入）
  └── 图表渲染
```

不需要后端，不需要数据库。所有数据实时从公开API获取。

### 技术栈

- **框架**：React（Vite脚手架）或纯HTML+JS（更简单）
- **图表库**：ECharts（功能全、中文友好）或 Chart.js（轻量）
- **样式**：Tailwind CSS
- **部署**：GitHub Pages 或 Vercel（免费）

### 页面结构

```
首页（单页）
├── 顶部：标题 + 最后更新时间
├── 核心指标卡片（当前值）
│   ├── 稳定币总市值
│   ├── USDC市值
│   ├── USDC份额
│   ├── 国债利率
│   └── Circle预估年收入
├── 图表区（6个图表，2列×3行）
│   ├── 图表1-6（如上）
│   └── 每个图表支持切换时间范围（1M/3M/1Y/ALL）
└── 底部：数据源说明
```

---

## 后续可扩展（不在第一版）

做完第一版后，根据观察需要可以加：

- 各稳定币份额饼图（USDT/USDC/DAI/FDUSD/PYUSD）
- USDC按链分布（Ethereum/Solana/Arbitrum/Base等）
- 稳定币铸造/销毁量（净流入流出）
- CCTP跨链交易量（如果能拿到数据）
- 关键事件标注（监管、合作、竞品动态）
- 定期自动截图存档（配合估值决策树的验证日志）

---

## 开工步骤

1. 初始化项目（Vite + React 或纯HTML）
2. 先跑通一个DefiLlama API调用，确认数据格式
3. 画第一个图（稳定币总市值）
4. 逐个加其余5个图
5. 加顶部指标卡片
6. 样式调整
7. 部署
