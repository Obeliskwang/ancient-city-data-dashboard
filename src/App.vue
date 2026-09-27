<template>
  <!-- 未登录时显示登录页面 -->
  <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
  
  <!-- 登录后显示主页面 -->
  <div v-else class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="btn-group">
          <button
              v-for="tab in 4"
              :key="tab"
              :class="['tab-btn', { 'active': currentTab === tab }]"
              @click="switchTab(tab)"
              :style="tab === 3 && currentTab === 3 ? activeGreenStyle : {}"
          >
            {{ ['综合分析', '舆情分析', '用户管理', '对外沟通'][tab - 1] }}
          </button>
        </div>
        <h1 class="title">山西智慧旅游大数据中心</h1>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <main class="main-container">
      <component
          :is="currentComponent"
          :key="componentKey + currentTab"/>
    </main>
  </div>
</template>

<script>
import Analysis1 from './components/Analysis1.vue'
import Analysis2 from './components/Analysis2.vue'
import Analysis3 from './components/Analysis3.vue'
import Analysis4 from './components/Analysis4.vue'
import Login from './components/Login.vue'

export default {
  components: { Analysis1, Analysis2, Analysis3, Analysis4, Login },
  data() {
    return {
      currentTab: 1,
      componentKey: 0, // 新增强制刷新键
      activeGreenStyle: { /* 原有样式 */ },
      isLoggedIn: false // 登录状态
    }
  },
  computed: {
    currentComponent() {
      return ['Analysis1', 'Analysis2', 'Analysis3', 'Analysis4'][this.currentTab - 1]
    }
  },
  mounted() {
    // 检查登录状态
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token')
      this.isLoggedIn = !!token
    },
    handleLoginSuccess() {
      this.isLoggedIn = true
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      this.isLoggedIn = false
      this.currentTab = 1
    },
    switchTab(tab) {
      // 强制触发重新渲染
      this.componentKey += 1
      this.currentTab = tab
      console.log(`切换到标签${tab}，组件键值：${this.componentKey}`)
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.app-container {
  height: 200vh;
  display: flex;
  flex-direction: column;
  background: #0a1d3a;
}

.main-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  height: 200vh;
  scroll-behavior: smooth; /* 平滑滚动 */
}

.header {
  height: 80px;
  background: linear-gradient(90deg, #1b3a6d 30%, #0a1d3a 100%);
  position: relative;
  box-shadow: 0 2px 15px rgba(0,0,0,0.3);
  z-index: 1000;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  letter-spacing: 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  background: linear-gradient(180deg, #ffffff 0%, #7dabf5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.tab-btn {
  padding: 10px 30px;
  border: none;
  background: rgba(255,255,255,0.05);
  color: #a8c7ff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
  position: relative;
  outline: none;
}

.tab-btn:hover {
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(90deg, #2a5bac 0%, #3b7ad9 100%);
  color: white !important;
  box-shadow: 0 4px 12px rgba(42,91,172,0.4);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 30px;
}

.btn-group {
  display: flex;
  gap: 20px;
}

.logout-btn {
  position: absolute;
  right: 30px;
  padding: 8px 20px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>