<template>
  <BaseChart :option="chartOption" class="chart"/>
</template>

<script>
import BaseChart from './BaseChart.vue'
import * as echarts from 'echarts' // 添加缺失的引用

export default {
  components: { BaseChart },
  props: {
    data: { // 添加 prop 类型验证
      type: Object,
      required: true,
      validator: value => {
        return 'xAxis' in value && 'values' in value
      }
    }
  },
  computed: {
    chartOption() {
      return {
        grid: { // 添加布局配置
          top: '25%',
          bottom: '25%',
          left: '10%',
          right: '10%'
        },
        xAxis: {
          type: 'category',
          axisLine: { lineStyle: { color: '#7db2ff' } }, // 添加轴线样式
          axisLabel: {
            color: '#fff',
            interval: 0 // 强制显示所有标签
          },
          data: this.data.xAxis
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          },
          axisLabel: { color: '#fff' }
        },
        series: [{
          data: this.data.values,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#37A2DA'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(55,162,218,0.6)' },
              { offset: 1, color: 'rgba(55,162,218,0)' }
            ])
          }
        }]
      }
    }
  }
}
</script>
