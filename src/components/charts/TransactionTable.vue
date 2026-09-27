<template>
  <div class="transaction-table">
    <div class="table-header">
      <div class="header-cell">用户</div>
      <div class="header-cell">时间</div>
      <div class="header-cell">操作</div>
      <div class="header-cell">商品</div>
    </div>
    <div class="table-body">
      <div v-for="(row, index) in data" :key="index" class="table-row">
        <div class="body-cell">{{ row.user }}</div>
        <div class="body-cell">{{ formatTime(row.time) }}</div>
        <div class="body-cell">
          <span :class="['operation', row.action]">{{ row.action }}</span>
        </div>
        <div class="body-cell">{{ row.product }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.transaction-table {
  height: 100%;
  color: #fff;
}

.table-header {
  display: flex;
  background: rgba(255,255,255,0.1);
  padding: 10px 0;
  border-radius: 4px;
  margin-bottom: 5px;
}

.header-cell {
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: #7db2ff;
}

.table-body {
  height: calc(100% - 40px);
  overflow-y: auto;
}

.table-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.body-cell {
  flex: 1;
  text-align: center;
  font-size: 12px;
}

.operation {
  padding: 2px 8px;
  border-radius: 4px;
}

.operation.下单 {
  background: rgba(111,207,151,0.2);
  color: #6dd230;
}

.operation.退货 {
  background: rgba(255,77,77,0.2);
  color: #ff4d4d;
}
</style>