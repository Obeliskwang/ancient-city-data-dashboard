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
  components:{BaseChart},
  props: ['data'],
  computed: {
    option() {
      return {
        tooltip: { trigger: 'item' },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#fff' }
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          data: this.data.data,
          label: { color: '#fff' },
          itemStyle: {
            borderColor: '#0a1d3a',
            borderWidth: 3
          }
        }]
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