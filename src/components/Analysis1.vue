<!-- Analysis1.vue -->
<template>
  <div class="main-container">
    <!-- Container 1 -->
    <div class="container container1">
      <div class="title-box2">
        <h3>景点热度排行</h3>
      </div>
      <HorizontalBar
          v-if="hotRankData"
          :data="hotRankData"
          class="chart-content chart-content2"
      />
      <div v-else class="loading">加载景点数据...</div>
    </div>

    <!-- Container 2 -->
    <div class="container container2">
      <div class="sub-container" style="top:10px;height:30%">
        <div class="title-box2">
          <h3>消费业态占比</h3>
        </div>
        <RingPie v-if="consumptionData" :data="consumptionData" class="chart-content" />
        <div v-else class="loading">加载消费数据...</div>
      </div>

      <div class="sub-container" style="top:32%;height:44%">
        <div class="title-box2">
          <h3>游客年龄分布</h3>
        </div>
        <GroupedBar v-if="ageData" :data="ageData" class="chart-content"/>
        <div v-else class="loading">加载年龄数据...</div>
      </div>

      <div class="sub-container" style="top:72%;height:30%">
        <div class="title-box2">
          <h3>来源城市排行</h3>
        </div>
        <HorizontalBar
            v-if="cityRankData"
            :data="cityRankData"
            class="chart-content"
        />
        <div v-else class="loading">加载城市数据...</div>
      </div>
    </div>

    <!-- Container 5 -->
    <div class="container container5">
      <div class="title-box">
        <h3>年度客流量统计</h3>
      </div>
      <CompareBar
          v-if="annualData"
          :data="annualData"
          class="chart-content5"
      />
      <div v-else class="loading">加载年度数据...</div>
    </div>

    <!-- Container 7 -->
    <div class="container container7">
      <div class="title-box2">
        <h3>年度游客对比</h3>
      </div>
      <MultiLine
          v-if="annualCompare"
          :data="annualCompare"
          class="chart-content6"
      />
      <div v-else class="loading">加载对比数据...</div>
    </div>

    <!-- Container 6 -->
    <div class="container container6">
      <div class="title-box2">
        <h3>游客数量统计</h3>
      </div>
      <VisitorStats
          v-if="visitorStats"
          :stats="visitorStats"
          class="stats-content"
      />
      <div v-else class="loading">加载实时统计...</div>
    </div>

    <!-- Container 3 -->
    <div class="container container3">
      <TimeWeather class="time-weather"/>
      <div class="title-box map-title">
        <h3>山西省地图</h3>
        <tmap-map
            mapKey="DHGBZ-S2HHQ-CRO54-BYNEO-WJVWS-2FBIZ"
            :events="events"
            :center="center"
            :zoom="zoom"
            :doubleClickZoom="doubleClickZoom"
            :control="control"
        ></tmap-map>
      </div>
    </div>

    <!-- Container 4 -->
    <div class="container container4">
      <div class="title-box">
        <h3>游客热力分布</h3>
      </div>
      <HeatMap class="chart-content8">

      </HeatMap>
    </div>

    <!-- Container 8 -->
    <div class="container container8">
      <div class="title-box2">
        <h3>游客满意度</h3>
      </div>
      <SatisfactionPie
          :data="satisfactionData"
          class="satisfaction-content"
          :style="{height: satisfactionHeight}"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// 确保所有组件路径正确
import HorizontalBar from './charts/HorizontalBar.vue'
import GroupedBar from './charts/GroupedBar.vue'
import CompareBar from './charts/CompareBar.vue'
import MultiLine from './charts/MultiLine.vue'
import TimeWeather from './charts/TimeWeather.vue'
import MapChart from './charts/MapChart.vue'
import VisitorStats from './charts/VisitorStats.vue'
import HeatMap from './charts/HeatMap.vue'
import SatisfactionPie from './charts/SatisfactionPie.vue'
import RingPie from "@/components/charts/RingPie.vue";
import axios from "axios";

export default {
  components: {
    HorizontalBar, GroupedBar, CompareBar, MultiLine,
    TimeWeather, MapChart, VisitorStats, HeatMap,
    RingPie, SatisfactionPie
  },
  setup() {
    const hotRankData = ref(null)
    const consumptionData = ref(null)
    const cityRankData = ref(null)
    const ageData = ref(null)
    const annualData = ref(null)
    const annualCompare = ref(null)
    const visitorStats = ref(null)
    const loading = ref(true)
    const error = ref(null)

    // 增强版数据验证方法
    const validateDataStructure = (data, structure) => {
      try {
        const missingKeys = []
        const checkStructure = (obj, template) => {
          Object.keys(template).forEach(key => {
            if (!(key in obj)) {
              missingKeys.push(key)
              return
            }
            if (typeof template[key] === 'object' && !Array.isArray(template[key])) {
              checkStructure(obj[key], template[key])
            }
          })
        }
        checkStructure(data, structure)
        if (missingKeys.length > 0) {
          throw new Error(`Missing fields: ${missingKeys.join(', ')}`)
        }
        return true
      } catch (e) {
        console.error('Structure validation failed:', e)
        error.value = e.message
        return false
      }
    }

    // 带日志的数据处理器
    const processWithLog = (processor, data, name) => {
      console.groupCollapsed(`[Process] ${name}`)
      try {
        console.log('Raw data:', JSON.parse(JSON.stringify(data)))
        const result = processor(data)
        console.log('Processed:', result)
        return result
      } catch (e) {
        console.error(`Processing error: ${e.message}`)
        return null
      } finally {
        console.groupEnd()
      }
    }

    // 修改后的transformers
    const transformers = {
      attraction: (data) => processWithLog(data => ({
        categories: data.ranking || [],
        values: (data.ranking || []).map(name => {
          const visits = data.statistics?.[name]?.visits ??
              data.statistics?.[name]?.visit_count ?? 0
          console.assert(typeof visits === 'number',
              `Invalid visits type for ${name}: ${typeof visits}`)
          return Number(visits)
        })
      }), data, 'Attraction Ranking'),

      consumption: (data) => processWithLog(data => ({
        data: (data.consumption_stats || []).map(item => ({
          value: Number(item.percentage?.toFixed(1)) || 0,
          name: item.name || 'Unknown'
        })).filter(item => item.value > 0)
      }), data, 'Consumption Stats'),

      cityRank: (data) => processWithLog(data => ({
        categories: (data.city_ranking?.cities || []).slice(0, 5),
        values: (data.city_ranking?.counts || []).slice(0, 5).map(Number)
      }), data, 'City Ranking'),

      ageDistribution: (data) => processWithLog(data => ({
        categories: (data.age_distribution?.age_groups || []).map(g =>
            g.replace('及以上', '+')),
        male: (data.age_distribution?.male || []).map(Number),
        female: (data.age_distribution?.female || []).map(Number)
      }), data, 'Age Distribution'),

      annualVisitor: (data) => processWithLog(data => ({
        lastYear: (data.annual_stats?.years?.["去年"] || []).map(v => v * 1000),
        currentYear: (data.annual_stats?.years?.["今年"] || []).map(v => v * 1000)
      }), data, 'Annual Visitor'),

      annualCompare: (data) => processWithLog(data => ({
        months: (data.annual_comparison?.months || []).map(m => `${m}月`),
        y2023: data.annual_comparison?.data?.["2023"] || [],
        y2024: data.annual_comparison?.data?.["2024"] || [],
        y2025: data.annual_comparison?.data?.["2025"] || []
      }), data, 'Annual Compare'),

      visitorStats: (data) => processWithLog(data => {
        const getValue = (path) => {
          const keys = path.split('.')
          return keys.reduce((obj, key) => obj?.[key] ?? 0, data)
        }

        return [
          { title: '今日游客', path: 'stats.今日游客总量' },
          { title: '昨日游客', path: 'stats.昨日游客总量' },
          { title: '本周游客', path: 'stats.本周游客总量' },
          { title: '本月游客', path: 'stats.本月游客总量' },
          { title: '当前游客', path: 'stats.当前游客' }
        ].map(({ title, path }) => {
          const value = getValue(`${path}.value`)
          const rate = getValue(`${path}.growth_rate`) ?? 0
          return {
            title,
            value: Number(value).toLocaleString(),
            trend: rate > 0 ? 'up' : rate < 0 ? 'down' : null,
            rate: Math.abs(Math.round(rate * 100))
          }
        })
      }, data, 'Visitor Stats')
    }

    // 增强版数据获取
    const fetchAllData = async () => {
      try {
        console.info('⏳ Starting data fetch...')
        loading.value = true
        error.value = null

        const endpoints = [
          { key: 'attraction', url: '/api/attraction-ranking' },
          { key: 'consumption', url: '/api/consumption-stats' },
          { key: 'cityRank', url: '/api/origin-city-ranking' },
          { key: 'ageDistribution', url: '/api/age-distribution' },
          { key: 'annualVisitor', url: '/api/annual-visitor-stats' },
          { key: 'annualCompare', url: '/api/annual-comparison' },
          { key: 'visitorStats', url: '/api/visitor-stats' }
        ]

        const responses = await Promise.all(
            endpoints.map(async ({ key, url }) => {
              console.log(`⚡ Fetching ${key}: ${url}`)
              const start = Date.now()
              try {
                const res = await axios.get(url)
                console.log(`✅ ${key} fetched in ${Date.now() - start}ms`)
                return { key, data: res.data }
              } catch (err) {
                console.error(`❌ ${key} fetch failed:`, err)
                return { key, error: err }
              }
            })
        )

        // 处理响应
        responses.forEach(({ key, data, error }) => {
          if (error) {
            console.error(`${key}请求失败:`, error)
            // 设置空值，避免一直加载
            switch(key) {
              case 'attraction': hotRankData.value = null; break
              case 'consumption': consumptionData.value = null; break
              case 'cityRank': cityRankData.value = null; break
              case 'ageDistribution': ageData.value = null; break
              case 'annualVisitor': annualData.value = null; break
              case 'annualCompare': annualCompare.value = null; break
              case 'visitorStats': visitorStats.value = null; break
            }
            return
          }

          // 检查数据状态 - 更宽松的验证
          if (!data) {
            console.error(`${key}数据为空`)
            return
          }

          // 如果 status 不是 success，记录警告但继续处理
          if (data.status && data.status !== 'success') {
            console.warn(`${key}数据状态异常:`, data.status, '但继续处理')
          }

          const processor = transformers[key]
          if (!processor) {
            console.error(`找不到${key}的数据处理器`)
            return
          }

          try {
            const result = processor(data)
            if (result) {
              switch(key) {
                case 'attraction': hotRankData.value = result; break
                case 'consumption': consumptionData.value = result; break
                case 'cityRank': cityRankData.value = result; break
                case 'ageDistribution': ageData.value = result; break
                case 'annualVisitor': annualData.value = result; break
                case 'annualCompare': annualCompare.value = result; break
                case 'visitorStats': visitorStats.value = result; break
              }
            } else {
              console.warn(`${key}数据处理后返回空值`)
            }
          } catch (e) {
            console.error(`${key}数据处理出错:`, e)
          }
        })
      } catch (e) {
        console.error('全局错误:', e)
        error.value = `数据加载失败: ${e.message}`
      } finally {
        loading.value = false
        console.log('🎉 最终数据状态:', {
          hotRankData: hotRankData.value,
          consumptionData: consumptionData.value,
          cityRankData: cityRankData.value,
          ageData: ageData.value,
          annualData: annualData.value,
          annualCompare: annualCompare.value,
          visitorStats: visitorStats.value
        })
      }
    }

    onMounted(fetchAllData)
    const satisfactionData = ref([
      { name: '安全满意度', value: 88 },
      { name: '景点满意度', value: 92 },
      { name: '设施满意度', value: 85 },
      { name: '服务满意度', value: 90 },
      { name: '价格满意度', value: 82 },
      { name: '清洁和维护满意度', value: 87 }
    ])

    const generateData = (count) => Array.from({length: count}, () => Math.floor(Math.random()*1000)+500)

    // 地图配置数据
    const center = ref({ lat: 37.2037904, lng: 112.1771043 });
    const zoom = ref(15);
    const doubleClickZoom = ref(true);
    // const print = (e: unknown) => {
    //   console.log(e);
    // };

    const container1Height = computed(() =>
        Math.max(window.innerHeight * 0.1, 180) + 'px' // 至少180px
    )
    const container4Height = computed(() =>
        Math.max(window.innerHeight * 0.1, 180) + 'px' // 至少180px
    )
    const container4top = computed(() => window.innerHeight * 0.1 - 100 + 'px')
    const cityChartHeight = computed(() => window.innerHeight * 0.2 - 30 + 'px')
    const satisfactionHeight = computed(() => window.innerHeight * 0.4 - 50 + 'px')

    // 添加resize监听
    const handleResize = () => {
      window.dispatchEvent(new Event('resize'))
    }

    onMounted(() => {
      fetchAllData()
      window.addEventListener('resize', handleResize)
      handleResize() // 初始化时触发
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      hotRankData,
      consumptionData,
      satisfactionData,
      cityRankData,
      ageData,
      annualData,
      annualCompare,
      visitorStats,
      loading,
      error,
      container1Height,
      container4Height,
      container4top,
      cityChartHeight,
      satisfactionHeight,
      events: {
        dblclick: print,
      },
      center,
      zoom,
      doubleClickZoom,
      control: {
        scale: {},
        zoom: {
          position: 'bottomRight',
        },
      },
    }
  }
}
</script>

<style scoped>
.main-container {
  position: relative;
  height: calc(90vh - 80px);
  /* background:
      linear-gradient(
          135deg,
          #0a1d3a 0%,
          #0a254a 30%,
          #0a1d3a 70%,
          #091732 100%
      ); */
  background: url('../assets/background.png');
  padding: 20px;
  /* overflow: auto; */
}

.container {
  position: absolute;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 15px;
  overflow: hidden;
  box-sizing: border-box;
}

/* 修正容器定位 */
.container1 {
  top: 5px;
  left: 20px;
  width: 27%;
  height: 15vh;
  min-height: 180px;
  z-index: 200;
}

.container2 {
  top: calc(16vh + 40px);
  left: 20px;
  width: 27%;
  height: 67vh;
  min-height: 400px;
}

.container3 {
  top: 10px;
  left: calc(27% + 40px);
  width: 38%;
  height: 45vh;
}

.container4 {
  top: calc(45vh + 40px);
  left: calc(27% + 40px);
  width: 17%;
  height: 38vh;
  min-height: 200px;
}

.container5 {
  top: calc(45vh + 40px);
  left: calc(27% + 40px + 17% + 20px);
  width: 20%;
  height: 38vh;
  min-height: 200px;
}

.container6,
.container7,
.container8{
  display: flex;
  justify-content: flex-start;
  align-items: conter;
}

.container6 {
  top: 20px;
  right: 20px;
  width: 30%;
  height: 25vh;
  min-height: 150px;
}

.container7 {
  top: 25vh;
  right: 20px;
  width: 30%;
  height: 25vh;
  min-height: 200px;
}

.container8 {
  top: calc(25vh + 25vh + 30px);
  right: 20px;
  width: 30%;
  height: 34vh;
  min-height: 280px;
}

.chart-content {
  width: 100%;
  top:20px;
  height: calc(100% - 50px)!important;
}
.chart-content2{
  height: 110% !important;
}
.chart-content5 {
  width: 100%;
  top:20px;
  height: 100%;
}
.chart-content6 {
  width: 100%;
  top:20px;
  height: 100%;
}
.chart-content8{
  display: block;
  width: 100%;
  height: calc(100% - 40px);
}
/* 新增关键样式 */
.sub-container {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.satisfaction-content {
  /* height: calc(50% - 10px) !important; */
  /* padding: 10px; */
  height: 100%;
  width: 90%;
}

.map-content {
  height: calc(100% - 80px) !important;
}
.title-box,
.title-box2 {
  background: rgba(0,0,0,0.3);
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
  /* margin-bottom: 10px; */
}

.title-box h3,
.title-box2 h3 {
  color: #a8d1ff;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

.title-box2{
  /* float: left; */
  width: 5%;
  height: auto;
  padding: 15px 8px;

}

.title-box2 h3{
  writing-mode: vertical-lr;
}

/* Container1 特殊样式 */
.container1 .title-box {
  text-align: center;
  width: max-content;
  margin: 0 auto 15px;
  background: linear-gradient(90deg, rgba(42,91,172,0.6), rgba(25,55,109,0.8));
  border: 1px solid rgba(42,91,172,0.5);
}

/* Container2 子容器标题样式 */
.container2 .sub-container .title-box {
  text-align: center;
  top:15px;
  width: max-content;
  margin: 0 auto 15px;
  background: linear-gradient(90deg, rgba(42,91,172,0.6), rgba(25,55,109,0.8));
  border: 1px solid rgba(42,91,172,0.5);
}

/* Container2地图样式 */
.map-title{
  height: 30vh;
}

.container1,.container2 .sub-container{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>