# Ancient City Data Dashboard · 古城大数据分析中控平台（前端数据大屏）

> 山西古城大数据分析中控平台 · 数据大屏前端（Vue3 + ECharts）

面向景区管理方的**数据可视化大屏（中控台）**，实时展示客流与消费多维指标，数据来自 FastAPI 后端（`ancient-city-backend`）的统计接口。

## 项目简介

以 ECharts 为核心的可视化数据大屏，集中呈现山西古城景区经营数据：

- **景点热度排行**（横向柱状图）
- **消费业态占比**（环形图）
- **游客年龄分布**（分组柱状图）
- **来源城市排行**（横向柱状图）
- **年度客流量统计**（对比柱状图）
- **年度游客对比**（多折线图）
- **游客数量统计**（实时指标卡）
- **景区地图展示**（腾讯地图）
- **实时数据**（今日概况）

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 |
| 构建 | Vite 6 |
| 图表 | ECharts 5 · echarts-wordcloud |
| UI | Element Plus |
| 地图 | 腾讯地图（@map-component/vue-tmap） |
| HTTP | Axios（`/api` 代理到后端） |

## 与后端 API 对应关系

| 前端组件 | 后端接口 |
|----------|----------|
| `HorizontalBar`（景点热度） | `GET /api/attraction-ranking` |
| `RingPie`（消费业态） | `GET /api/consumption-stats` |
| `GroupedBar`（年龄分布） | `GET /api/age-distribution` |
| `HorizontalBar`（来源城市） | `GET /api/origin-city-ranking` |
| `CompareBar`（年度客流） | `GET /api/annual-visitor-stats` |
| `MultiLine`（年度对比） | `GET /api/annual-comparison` |
| `VisitorStats`（游客统计） | `GET /api/visitor-stats` |

> 代理配置见 `vite.config.js`：`/api` → `http://localhost:8000`

## 快速启动

```bash
cd D:\AncientCity\resources\text
npm install
npm run dev
```

默认端口由 Vite 分配（通常在 `http://localhost:5173`）。需先启动后端 `ancient-city-backend`（端口 8000）以正常取数。

## 项目结构

```
text/
├── src/
│   ├── components/
│   │   ├── charts/       # 各可视化图表组件
│   │   ├── Analysis1~4.vue  # 大屏分屏布局
│   │   └── ...
│   ├── assets/           # 背景图、登录图、地图 GeoJSON 等
│   └── main.js / App.vue
├── vite.config.js        # 构建与 /api 代理配置
└── index.html
```
