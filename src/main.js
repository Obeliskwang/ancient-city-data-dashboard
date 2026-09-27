import './assets/global.css'
import * as echarts from 'echarts'
import { createApp } from 'vue'
import App from './App.vue'
import Tmap from '@map-component/vue-tmap';
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ElMessage } from 'element-plus'
axios.defaults.baseURL = 'http://localhost:8000/'
const app = createApp(App)

// 添加 $http 到全局属性
app.config.globalProperties.$http = axios

app.config.globalProperties.$echarts = echarts
app.use(Tmap)
app.use(ElementPlus) // 使用ElementPlus
app.mount('#app')

import chinaJson from '@/assets/china.json';

echarts.registerMap('china', chinaJson); // 注册中国地图