<template>
  <div v-if="data">
    <BaseChart :option="option" v-bind="$attrs"/>
  </div>
  <div v-else class="loading">
    数据加载中...
  </div>
</template>

<script>
import BaseChart from "@/components/charts/BaseChart.vue";

export default {
  components: {BaseChart},
  props: ['data'],
  computed: {
    option() {
      return {
        legend: {
          data: ['2023', '2024', '2025'],
          textStyle: { color: '#fff' }
        },
        xAxis: {
          type: 'category',
          data: this.data.months,
          axisLabel: { color: '#fff' }
        },
        yAxis: { axisLabel: { color: '#fff' }},
        series: [
          {
            name: '2023',
            type: 'line',
            data: this.data.y2023,
            smooth: true,
            itemStyle: { color: '#73c0de' }
          },
          {
            name: '2024',
            type: 'line',
            data: this.data.y2024,
            smooth: true,
            itemStyle: { color: '#fac858' }
          },
          {
            name: '2025',
            type: 'line',
            data: this.data.y2025,
            smooth: true,
            itemStyle: { color: '#ee6666' }
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.loading {
  color: #fff;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}
</style>