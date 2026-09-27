<template>
  <div
      ref="chartDom"
      :style="{
      width,
      height,
    }"
  ></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

export default {
  props: {
    option: Object,
    top:{type: String, default: '10px' },
    width: { type: String, default: '100%' },
    height: { type: String, default: '100%' }
  },
  setup(props) {
    const chartDom = ref(null)
    let chartInstance = null

    const initChart = () => {
      chartInstance = echarts.init(chartDom.value)
      chartInstance.setOption(props.option)
      window.addEventListener('resize', handleResize)
    }

    const handleResize = () => {
      chartInstance?.resize()
    }

    onMounted(initChart)
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      chartInstance?.dispose()
    })

    return { chartDom }
  }
}
</script>