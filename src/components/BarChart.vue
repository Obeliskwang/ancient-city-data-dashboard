<script>
export default {
  props: ['data', 'title'],
  computed: {
    option() {
      return {
        title: { text: this.title, left: 'center', textStyle: { color: '#fff' }},
        grid: { top: 50, bottom: 30 },
        xAxis: { type: 'value', axisLabel: { color: '#fff' }},
        yAxis: {
          type: 'category',
          data: this.data.categories,
          axisLabel: { color: '#fff' }
        },
        series: [{
          type: 'bar',
          data: this.data.values,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 1, color: '#188df0' }
            ])}
        }]
      }
    }
  }
}
</script>