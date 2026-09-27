<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>山西智慧旅游大数据中心</h2>
        <p>Shanxi Smart Tourism Data Center</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label for="username">
            <span class="user-icon"></span>

          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username" 
          />
          </label>
        </div>
        
        <div class="form-item">
          <label for="password">
            <span class="password-icon"></span>
        
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
          </label>
        </div>
        
        <div class="form-item remember-me">
          <label>
            <input v-model="rememberMe" type="checkbox" />
            <span>记住密码</span>
          </label>
        </div>
        
        <div class="form-item">
          <button 
            type="submit" 
            class="login-button"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </div>
      </form>
      
      <div class="login-footer">
        <span>三晋文脉千古，一数智汇今朝</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  emits: ['login-success'],
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rememberMe: false,
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      // 表单验证
      if (!this.loginForm.username) {
        this.$message.error('请输入用户名')
        return
      }
      if (!this.loginForm.password) {
        this.$message.error('请输入密码')
        return
      }
      if (this.loginForm.password.length < 6) {
        this.$message.error('密码长度至少为6位')
        return
      }
      
      this.loading = true
      
      try {
        const res = await this.$http.post('/api/login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        
        if (res.data.success) {
          // 保存登录信息
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
          
          this.$message.success('登录成功！')
          
          // 跳转到主页面
          this.$emit('login-success')
        } else {
          this.$message.error(res.data.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        this.$message.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1d3a 0%, #1b3a6d 50%, #2a5bac 100%);
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/login/login_background.png') no-repeat center center;
  background-size: cover;
  opacity: 0.2;
}

.login-box {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 600;
  font-family: "KaiTi", "楷体", serif;
  color: #fff;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.login-header p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}

.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 24px;
  position: relative;
}

.form-item label {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0 15px;
  transition: all 0.3s;
}

.form-item label:hover,
.form-item label:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.form-item .user-icon {
  width: 50px;
  height: 50px;
  background-image: url('@/assets/login/user.png');
  background-size: contain; /* 让图片适应容器大小 */
  background-repeat: no-repeat;
  display: inline-block;
  margin-right: 10px;
}
.form-item .password-icon {
  width: 50px;
  height: 50px;
  background-image: url('@/assets/login/password.png');
  background-size: contain; /* 让图片适应容器大小 */
  background-repeat: no-repeat;
  display: inline-block;
  margin-right: 10px;
}


.form-item input[type="text"],
.form-item input[type="password"] {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 20px;
  padding: 14px 0;
  height: 48px;
}

.form-item input[type="text"]::placeholder,
.form-item input[type="password"]::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.remember-me label {
  background: transparent;
  border: none;
  padding: 0;
}

.remember-me label:hover {
  box-shadow: none;
}

.remember-me input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #409eff;
}

.remember-me span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(64, 158, 255, 0.4);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
}
</style>
