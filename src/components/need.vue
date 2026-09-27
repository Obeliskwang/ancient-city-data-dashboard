<template>
  <div class="chart-container">
    <div ref="lineChart" class="chart-top"></div>
    <div class="divider"></div>
    <div ref="barChart" class="chart-bottom"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      years: Array.from({length: 8}, (_, i) => 2015 + i),
      premium: [763, 1295, 2441, 2921, 4029, 5448, 8175, 8447],
      payout: [763*0.3, 1295*0.3, 2441*0.3, 2921*0.3, 4029*0.3, 5448*0.3, 8175*0.3, 8447*0.3],
      growth_premium: [67.6, 34.7, 34.8, 37.9, 31.2, 29.4, 24.2, -11],
      growth_payout: [29.7, 24.1, 2.4, 15.7, 8.6, 3.4, 0, 0]
    };
  },
  mounted() {
    this.initCharts();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initCharts() {
      // 折线图配置
      const lineOption = {
        title: { text: '赔付增速趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['赔付支出增速', '保费收入增速'],
          top: 30
        },
        grid: { bottom: '15%' },
        xAxis: {
          type: 'category',
          data: this.years,
          axisTick: { alignWithLabel: true }
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}%' }
        },
        series: [
          {
            name: '赔付支出增速',
            type: 'line',
            data: this.growth_payout,
            itemStyle: { color: '#5470C6' }
          },
          {
            name: '保费收入增速',
            type: 'line',
            data: this.growth_premium,
            itemStyle: { color: '#91CC75' }
          }
        ]
      };

      // 柱状图配置
      const barOption = {
        title: { text: '保费与赔付情况（亿元）', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['赔付支出', '保费收入'],
          bottom: 0
        },
        grid: { top: '15%' },
        xAxis: {
          type: 'category',
          data: this.years,
          axisTick: { alignWithLabel: true }
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value} 亿' }
        },
        series: [
          {
            name: '赔付支出',
            type: 'bar',
            data: this.payout,
            itemStyle: { color: '#5470C6' },
            barWidth: '30%'
          },
          {
            name: '保费收入',
            type: 'bar',
            data: this.premium,
            itemStyle: { color: '#91CC75' },
            barWidth: '30%'
          }
        ]
      };

      this.lineChart = echarts.init(this.$refs.lineChart);
      this.barChart = echarts.init(this.$refs.barChart);
      this.lineChart.setOption(lineOption);
      this.barChart.setOption(barOption);
    },
    handleResize() {
      this.lineChart.resize();
      this.barChart.resize();
    }
  }
};
</script>

<style scoped>
.chart-container {
  height: 700px;
  width: 100%;
  position: relative;
}

.chart-top, .chart-bottom {
  width: 100%;
}

.chart-top {
  height: 57%; /* 4/7 ≈ 57% */
}

.chart-bottom {
  height: 43%; /* 3/7 ≈ 43% */
}

.divider {
  height: 2px;
  background: #999;
  margin: 10px 0;
}
</style>