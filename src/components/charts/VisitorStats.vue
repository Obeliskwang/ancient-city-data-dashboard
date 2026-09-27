<template>
  <div class="stats-grid">
    <template v-if="stats">
    <div v-for="(stat, index) in stats" :key="index" class="stat-item"
    :class="{ 'stat-item-full': index === stats.length - 1 }">
      <div class="stat-title">{{ stat.title }}</div>
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-trend" :class="stat.trend">
        <span v-if="stat.trend === 'up'">↑</span>
        <span v-else>↓</span>
        {{ stat.rate }}%
      </div>

    </div>
    </template>
    <div v-else class="loading">
      加载游客统计...
    </div>
  </div>
</template>

<script>
export default {
  props: ['stats']
}
</script>

<style>
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
  padding: 10px 15px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.stat-item {
  background: rgba(255,255,255,0.1);
  padding: 15px 20px;
  border-radius: 6px;
  text-align: center;
  box-sizing: border-box;
  height: 140px;
  /* 第一排4个等宽排列 */
  width: calc(25% - 8px);
  margin-bottom: 10px;
}
/* 最后一个（当前游客）占满整行 */
.stat-item-full {
  width: 100%;
  margin-bottom: 0;
}
.stat-title {
  color: #7ec2f3;
  font-size: 1.2em;
}
.stat-value {
  color: #fff;
  font-size: 1.5em;
  margin: 5px 0;
}
.stat-trend.up {
  color: #90ee90;
}
.stat-trend.down {
  color: #ff6b6b;
}
 .loading {
   width: 100%;
   text-align: center;
   color: #7ec2f3;
   padding: 15px;
   font-size: 14px;
 }
</style>