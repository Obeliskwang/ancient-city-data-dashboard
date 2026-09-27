<template>
  <div class="container">
    <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { MapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import * as echarts from 'echarts';
import chinaJson from '@/assets/china.json'; // 确保路径正确

// 注册地图数据
echarts.registerMap('china', chinaJson);

use([
  CanvasRenderer,
  MapChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
]);

// 生成模拟数据（注意省份名称需与地图数据匹配）
const generateData = () => {
  return [
    { name: '北京', value: 950000 },
    { name: '天津', value: 420000 },
    { name: '河北', value: 780000 },
    { name: '山西', value: 650000 },
    { name: '内蒙古', value: 320000 },
    { name: '辽宁', value: 550000 },
    { name: '吉林', value: 480000 },
    { name: '黑龙江', value: 510000 },
    { name: '上海', value: 880000 },
    { name: '江苏', value: 920000 },
    { name: '浙江', value: 890000 },
    { name: '安徽', value: 720000 },
    { name: '福建', value: 680000 },
    { name: '江西', value: 610000 },
    { name: '山东', value: 940000 },
    { name: '河南', value: 850000 },
    { name: '湖北', value: 730000 },
    { name: '湖南', value: 690000 },
    { name: '广东', value: 980000 },
    { name: '广西', value: 580000 },
    { name: '海南', value: 450000 },
    { name: '重庆', value: 620000 },
    { name: '四川', value: 760000 },
    { name: '贵州', value: 540000 },
    { name: '云南', value: 590000 },
    { name: '西藏', value: 210000 },
    { name: '陕西', value: 670000 },
    { name: '甘肃', value: 490000 },
    { name: '青海', value: 230000 },
    { name: '宁夏', value: 380000 },
    { name: '新疆', value: 410000 },
    { name: '台湾', value: 520000 },
    { name: '香港', value: 710000 },
    { name: '澳门', value: 320000 }
  ];
};

const option = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>访问量：{c}'
  },
  visualMap: {
    min: 0,
    max: 1000000,
    text: ['高访问量', '低访问量'],
    realtime: false,
    calculable: true,
    inRange: {
      color: ['#f7f7f7', '#d6604d', '#b2182b']
    }
  },
  series: [{
    name: '访问量',
    type: 'map',
    map: 'china', // 必须与registerMap的名称一致
    roam: true,
    label: {
      show: true,
      fontSize: 10
    },
    emphasis: {
      label: {
        show: true,
        color: '#333'
      },
      itemStyle: {
        areaColor: '#ffd700' // 高亮颜色
      }
    },
    data: generateData(),
    itemStyle: {
      areaColor: '#e9e9e9',
      borderColor: '#666'
    }
  }]
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>