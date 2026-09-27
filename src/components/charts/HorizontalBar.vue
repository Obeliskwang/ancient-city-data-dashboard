<template>
  <div v-if="data">
    <BaseChart :option="option" v-bind="$attrs" ref="chart"/>
  </div>
  <div v-else class="loading">
    数据加载中...
  </div>
</template>

<script>
import * as echarts from 'echarts'
import BaseChart from "@/components/charts/BaseChart.vue";

export default {
  components: { BaseChart },
  props: ['data'],
  watch: {
    data: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          // 强制重新创建实例
          if (this.$refs.chart) {
            this.$refs.chart.$forceUpdate()
          }
        })
      }
    }
  },
  computed: {
    option() {
      console.log('最终图表数据格式:',
          this.data?.values?.map((v, i) => ({
            value: v,
            name: this.data.categories[i]
          }))
      )

      return {
        grid: {
          top: '15%',
          bottom: '15%',
          left: '18%',
          right: '10%'
        },
        yAxis: {
          type: 'category',
          data: this.data?.categories || [],
          axisLabel: {
            color: '#fff',
            fontSize: 12,
            width: 100,
            overflow: 'break'
          },
          axisTick: { show: false }
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff',
            fontSize: 10
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.1)'
            }
          }
        },
        series: [{
          type: 'bar',
          // 新增关键配置
          coordinateSystem: 'cartesian2d',
          showBackground: true, // 调试用背景
          backgroundStyle: {
            color: 'rgba(255,0,0,0.3)' // 红色半透明背景
          },
          universalTransition: true,
          // 修改数据绑定方式
          data: this.data?.values.map((v, i) => ({
            value: v,
            name: this.data.categories[i],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(
                  1, 0, 0, 0, [ // 修改渐变方向为横向
                    { offset: 0, color: '#37A2DA' },
                    { offset: 1, color: '#71D5DE' }
                  ]
              )
            }
          })) || [],

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