<template>
  <div class="comm-page">

    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="sidebar-title">对外沟通管理</div>
      <el-menu
        :default-active="activeMenu"
        :default-openeds="['1','2','3']"
        class="side-menu"
        @select="activeMenu = $event"
      >
        <el-sub-menu index="1">
          <template #title>
            <span class="menu-group-label label-blue"><span class="menu-logo"><img src="@/assets/externalManagement/发布公告.png" alt=""></span>发布公告</span>
          </template>
          <el-menu-item index="1-1">发布公告</el-menu-item>
          <el-menu-item index="1-2">发布结果分析</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <span class="menu-group-label label-green"><span class="menu-logo"><img src="@/assets/externalManagement/接收反馈.png" alt=""></span>接收反馈</span>
          </template>
          <el-menu-item index="2-1">游客反馈</el-menu-item>
          <el-menu-item index="2-2">商户反馈</el-menu-item>
          <el-menu-item index="2-3">工作人员反馈</el-menu-item>
          <el-menu-item index="2-4">损伤检测</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <span class="menu-group-label label-orange"><span class="menu-logo menu-logo-lg"><img src="@/assets/externalManagement/工单管理.png" alt=""></span>工单管理</span>
          </template>
          <el-menu-item index="3-1">工单创建与分派</el-menu-item>
          <el-menu-item index="3-2">工单流程追踪</el-menu-item>
          <el-menu-item index="3-3">工单统计与分析</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 右侧内容区 -->
    <main class="content-area">

      <!-- 1-1 发布公告 -->
      <template v-if="activeMenu === '1-1'">
        <div class="area-header">
          <h3 class="area-title">发布公告</h3>
          <span class="area-sub">发布景区通知，同步至游客端与商户端</span>
        </div>

        <!-- 公告列表 -->
        <div class="panel list-panel">
          <div class="panel-title">
            已发布公告
            <span class="count-badge">{{ filteredAnnouncements.length }}</span>
            <select v-model="filterType" class="filter-select">
              <option value="">全部类型</option>
              <option v-for="t in allTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <button class="new-btn" @click="openDialog">+ 新建公告</button>
          </div>
          <div v-if="filterType && typeStats" class="stats-row">
            <div class="stat-card">
              <div class="stat-val">{{ typeStats.total }}</div>
              <div class="stat-label">{{ filterType }}数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">{{ typeStats.ratio }}%</div>
              <div class="stat-label">占全部公告</div>
            </div>
            <div class="stat-card wide">
              <div class="stat-label">最近一条</div>
              <div class="stat-recent">{{ typeStats.latestTitle }}</div>
              <div class="stat-time">{{ typeStats.latestTime }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-val-sm">{{ typeStats.topChannel }}</div>
              <div class="stat-label">主要推送渠道</div>
            </div>
          </div>
          <div v-if="loading" class="tip-text">加载中...</div>
          <div v-else-if="filteredAnnouncements.length === 0" class="tip-text">
            {{ filterType ? `暂无"${filterType}"类型的公告` : '暂无公告' }}
          </div>
          <div v-else class="notice-list">
            <div v-for="item in filteredAnnouncements" :key="item.id" class="notice-item">
              <div class="notice-top">
                <span class="type-tag">{{ item.type }}</span>
                <span class="notice-title">{{ item.title }}</span>
                <el-button size="small" class="edit-btn" @click="openEditDialog(item)">编辑</el-button>
                <button class="del-btn" @click="deleteAnnouncement(item.id)">删除</button>
              </div>
              <div class="notice-content">{{ item.content }}</div>
              <div v-if="item.channels && item.channels.length" class="channel-tags">
                <span v-for="ch in item.channels" :key="ch" :class="['ch-tag', channelColor(ch)]">{{ channelLabel(ch) }}</span>
              </div>
              <div class="notice-meta">
                <span>发布人：{{ item.author }}</span>
                <span>{{ formatTime(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 新建公告弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="editingId ? '编辑公告' : '新建公告'"
          width="900px"
          :close-on-click-modal="false"
          class="announce-dialog"
        >
          <div class="dialog-body">
            <!-- 左侧表单 -->
            <div class="form-side">
              <div class="form-body">
                <div class="form-item">
                  <label>公告标题</label>
                  <input v-model="form.title" class="input" placeholder="请输入公告标题" maxlength="50" />
                </div>
                <div class="form-item">
                  <label>公告类型</label>
                  <select v-model="form.type" class="input" @change="form.subtype = ''">
                    <option value="通知">通知</option>
                    <option value="限流通知">限流通知</option>
                    <option value="开放调整">开放调整</option>
                    <option value="安全提示">安全提示</option>
                    <option value="活动公告">活动公告</option>
                  </select>
                </div>
                <div v-if="form.type === '安全提示'" class="form-item">
                  <label>预警细分</label>
                  <select v-model="form.subtype" class="input">
                    <option value="">请选择预警类型</option>
                    <option value="天气预警">天气预警</option>
                    <option value="人流预警">人流预警</option>
                  </select>
                </div>
                <div class="form-item">
                  <label>公告内容</label>
                  <textarea v-model="form.content" class="input textarea" placeholder="请输入公告内容..." rows="4" maxlength="500"></textarea>
                  <span class="char-count">{{ form.content.length }}/500</span>
                </div>
                <div class="form-item">
                  <label>发布渠道</label>
                  <div class="channel-groups">
                    <div v-for="group in channelGroups" :key="group.key" class="ch-group">
                      <label class="ch-group-header">
                        <input
                          type="checkbox"
                          :checked="groupAllChecked(group)"
                          :ref="el => setGroupRef(el, group.key)"
                          @change="toggleGroup(group, $event.target.checked)"
                        />
                        <span :class="['ch-tag', group.color]">{{ group.label }}</span>
                      </label>
                      <div class="ch-children">
                        <label v-for="child in group.children" :key="child.key" class="ch-child">
                          <input type="checkbox" :value="child.key" v-model="form.channels" />
                          <span class="ch-child-label">{{ child.label }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <span v-if="form.channels.length === 0" class="warn-tip">请至少选择一个渠道</span>
                </div>
                <div v-if="submitMsg" :class="['submit-msg', submitMsg.type]">{{ submitMsg.text }}</div>
              </div>
            </div>

            <!-- 右侧预览 -->
            <div class="preview-side">
              <div class="preview-label">游客端展示预览</div>
              <!-- 背景图切换 -->
              <div class="bg-picker">
                <span class="bg-picker-label">背景图</span>
                <div class="bg-picker-list">
                  <div
                    v-for="(bg, i) in previewBgList"
                    :key="i"
                    :class="['bg-thumb', previewBgIndex === i ? 'bg-thumb-active' : '']"
                    :style="{ backgroundImage: 'url(' + bg.src + ')' }"
                    @click="previewBgIndex = i"
                  >
                    <span v-if="previewBgIndex === i" class="bg-thumb-check">✓</span>
                  </div>
                </div>
              </div>
              <div class="phone-frame" :style="previewBgIndex >= 0 ? { backgroundImage: 'url(' + previewBgList[previewBgIndex].src + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
                <div class="phone-status">山西智慧旅游</div>
                <div v-if="form.channels.includes('tourist_home')" class="preview-banner preview-banner-glass">
                  <div class="preview-banner-type">{{ form.type || '通知' }}</div>
                  <div class="preview-banner-title">{{ form.title || '公告标题' }}</div>
                  <div class="preview-banner-content">{{ form.content || '公告内容将显示在此处...' }}</div>
                </div>
                <div v-else class="preview-banner-empty">首页Banner区域（未选择）</div>
                <div v-if="form.channels.includes('tourist_notify')" class="preview-notify">
                  <span class="preview-notify-icon">🔔</span>
                  <div class="preview-notify-body">
                    <div class="preview-notify-title">{{ form.title || '公告标题' }}</div>
                    <div class="preview-notify-text">{{ (form.content || '').slice(0, 40) }}{{ form.content && form.content.length > 40 ? '...' : '' }}</div>
                  </div>
                </div>
                <div v-if="selectedScenicNames.length" class="preview-scenic">
                  <div class="preview-scenic-label">推送至景区管理区：</div>
                  <div class="preview-scenic-tags">
                    <span v-for="name in selectedScenicNames" :key="name" class="preview-scenic-tag">{{ name }}</span>
                  </div>
                </div>
                <div v-if="selectedSocialNames.length" class="preview-social">
                  <div class="preview-social-label">同步社交平台：</div>
                  <span v-for="name in selectedSocialNames" :key="name" class="preview-social-tag">{{ name }}</span>
                </div>
              </div>
              <div class="preview-hint">以上为游客端展示效果预览</div>
            </div>
          </div>

          <template #footer>
            <div class="dialog-footer">
              <button class="cancel-btn" @click="dialogVisible = false">取消</button>
              <button
                class="submit-btn"
                :disabled="submitting || !form.title || !form.content || form.channels.length === 0"
                @click="submitAnnouncement"
              >{{ submitting ? (editingId ? '保存中...' : '发布中...') : (editingId ? '保存修改' : '立即发布') }}</button>
            </div>
          </template>
        </el-dialog>
      </template>

      <!-- 2-1 游客反馈 -->
      <template v-else-if="activeMenu === '2-1'">
        <div class="area-header">
          <h3 class="area-title">游客反馈</h3>
          <span class="area-sub">汇总游客提交的意见与问题，支持分类筛选</span>
        </div>
        <!-- controls: time picker + severity segmented buttons -->
        <div class="fb-controls">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            size="small"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="margin-right:12px;"
          ></el-date-picker>
          <el-radio-group v-model="feedbackSeverity" class="severity-group" size="small">
            <el-radio-button label="all" class="seg-all">全部</el-radio-button>
            <el-radio-button label="urgent" class="seg-urgent">紧急</el-radio-button>
            <el-radio-button label="normal" class="seg-normal">一般</el-radio-button>
            <el-radio-button label="suggestion" class="seg-suggestion">建议</el-radio-button>
          </el-radio-group>
        </div>
        <div class="fb-page">
          <div class="fb-main">
            <div class="fb-section">
              <div class="fb-section-title">建筑损伤</div>
              <div class="fb-list">
                <div v-for="item in buildingDamageFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" :type="catTagType(item.category)" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-section">
              <div class="fb-section-title">提议</div>
              <div class="fb-list">
                <div v-for="item in suggestionFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" :type="catTagType(item.category)" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-charts">
              <div class="fb-chart-block">
                <div class="fb-chart-title">问题 TOP5</div>
                <div ref="chartTop5" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">数据概览</div>
                <div ref="chartOverview" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">损伤检测</div>
                <div ref="chartDamage" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">情感分析</div>
                <div ref="chartSentiment" class="fb-chart-canvas"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 聚合反馈列表（可创建工单） -->
        <div class="aggregated-feedback-section">
          <div class="section-title">游客反馈列表（已自动聚合）</div>
          <div
            v-for="item in aggregatedFeedbacks"
            :key="item.id"
            class="aggregate-card"
          >
            <div class="aggregate-main">
              <div class="aggregate-header">
                <span class="dot" :class="item.level"></span>
                <div class="title-block">
                  <div class="title-line">
                    <span class="title-text">{{ item.title }}</span>
                    <span class="title-meta">
                      【{{ item.count }}条反馈，最后{{ item.lastMinutes }}分钟前】
                    </span>
                  </div>
                </div>
              </div>
              <div class="aggregate-body">
                <div>代表反馈：{{ item.representative }}</div>
                <div>影响范围：约{{ item.impact }}名游客</div>
              </div>
              <div class="aggregate-footer">
                <el-checkbox v-model="item.selected">已选</el-checkbox>
                <el-button type="primary" size="small" @click="goCreateTicket(item)">
                  创建工单
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 2-2 商户反馈 -->
      <template v-else-if="activeMenu === '2-2'">
        <div class="area-header">
          <h3 class="area-title">商户反馈</h3>
          <span class="area-sub">汇总商户提交的意见与问题，支持分类筛选</span>
        </div>
        <!-- controls: time picker + severity segmented buttons (并列) -->
        <div class="fb-controls">
          <el-date-picker
            v-model="merchantDateRange"
            type="daterange"
            size="small"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="margin-right:12px;"
          ></el-date-picker>
          <el-radio-group v-model="merchantFeedbackSeverity" class="severity-group" size="small">
            <el-radio-button label="all" class="seg-all">全部</el-radio-button>
            <el-radio-button label="urgent" class="seg-urgent">紧急</el-radio-button>
            <el-radio-button label="normal" class="seg-normal">一般</el-radio-button>
            <el-radio-button label="suggestion" class="seg-suggestion">建议</el-radio-button>
          </el-radio-group>
        </div>
        <div class="fb-page">
          <div class="fb-main">
            <div class="fb-section">
              <div class="fb-section-title">经营问题</div>
              <div class="fb-list">
                <div v-for="item in merchantBusinessFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar merchant"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" :type="merchantCatTagType(item.category)" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-section">
              <div class="fb-section-title">建议意见</div>
              <div class="fb-list">
                <div v-for="item in merchantSuggestionFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar merchant"><img :src="item.avatar" /></div>
                  
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" :type="merchantCatTagType(item.category)" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-charts">
              <div class="fb-chart-block">
                <div class="fb-chart-title">问题 TOP5</div>
                <div ref="chartMerchantTop5" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">损伤检测</div>
                <div ref="chartMerchantDamage" class="fb-chart-canvas"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 2-3 工作人员反馈 -->
      <template v-else-if="activeMenu === '2-3'">
        <div class="area-header">
          <h3 class="area-title">工作人员反馈</h3>
          <span class="area-sub">汇总工作人员提交的问题与建议</span>
        </div>
        <!-- controls: time picker + severity segmented buttons (并列) -->
        <div class="fb-controls">
          <el-date-picker
            v-model="staffDateRange"
            type="daterange"
            size="small"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="margin-right:12px;"
          ></el-date-picker>
          <el-radio-group v-model="staffFeedbackSeverity" class="severity-group" size="small">
            <el-radio-button label="all" class="seg-all">全部</el-radio-button>
            <el-radio-button label="safety" class="seg-urgent">安全隐患</el-radio-button>
            <el-radio-button label="security" class="seg-normal">治安管理</el-radio-button>
            <el-radio-button label="other" class="seg-suggestion">其他</el-radio-button>
          </el-radio-group>
        </div>
        <div class="fb-page">
          <div class="fb-main">
            <div class="fb-section">
              <div class="fb-section-title">安全隐患</div>
              <div class="fb-list">
                <div v-for="item in staffSafetyFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar staff"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" type="danger" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-section">
              <div class="fb-section-title">治安管理</div>
              <div class="fb-list">
                <div v-for="item in staffSecurityFeedback" :key="item.id" class="fb-card">
                  <div class="fb-avatar staff"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.name }}</span>
                      <el-tag size="small" type="warning" class="fb-tag">{{ item.category }}</el-tag>
                      <el-tag size="small" :type="sentimentType(item.sentiment)" class="fb-tag">{{ item.sentiment }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.content }}</div>
                    <div class="fb-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-charts">
              <div class="fb-chart-block">
                <div class="fb-chart-title">问题 TOP5</div>
                <div ref="chartStaffTop5" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">损伤检测</div>
                <div ref="chartStaffDamage" class="fb-chart-canvas"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 2-4 损伤检测独立模块 -->
      <template v-else-if="activeMenu === '2-4'">
        <div class="area-header">
          <h3 class="area-title">损伤检测</h3>
          <span class="area-sub">基于YOLO11的古城建筑损伤检测分析</span>
        </div>
        <div class="fb-controls">
          <el-date-picker
            v-model="damageDateRange"
            type="daterange"
            size="small"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="margin-right:12px;"
          ></el-date-picker>
          <el-radio-group v-model="damageType" class="severity-group" size="small">
            <el-radio-button label="all" class="seg-all">全部</el-radio-button>
            <el-radio-button label="concrete" class="seg-urgent">混凝土裂缝</el-radio-button>
            <el-radio-button label="brick" class="seg-normal">砖裂缝</el-radio-button>
            <el-radio-button label="spall" class="seg-suggestion">剥落</el-radio-button>
            <el-radio-button label="wood" class="seg-suggestion">木裂缝</el-radio-button>
            <el-radio-button label="mold" class="seg-suggestion">发霉</el-radio-button>
            <el-radio-button label="rebar" class="seg-suggestion">裸露钢筋</el-radio-button>
          </el-radio-group>
        </div>
        <div class="fb-page">
          <div class="fb-main">
            <div class="fb-section">
              <div class="fb-section-title">检测记录</div>
              <div class="fb-list">
                <div v-for="item in damageRecords" :key="item.id" class="fb-card">
                  <div class="fb-avatar damage"><img :src="item.avatar" /></div>
                  <div class="fb-body">
                    <div class="fb-top">
                      <span class="fb-name">{{ item.location }}</span>
                      <el-tag size="small" :type="damageTagType(item.type)" class="fb-tag">{{ item.type }}</el-tag>
                      <el-tag size="small" :type="item.severity === '高风险' ? 'danger' : item.severity === '中风险' ? 'warning' : 'success'" class="fb-tag">{{ item.severity }}</el-tag>
                    </div>
                    <div class="fb-content">{{ item.description }}</div>
                    <div class="fb-time">{{ item.time }} · 检测置信度: {{ item.confidence }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fb-charts">
              <div class="fb-chart-block">
                <div class="fb-chart-title">数据概览</div>
                <div ref="chartDamageOverview" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">问题 TOP5</div>
                <div ref="chartDamageTop5" class="fb-chart-canvas"></div>
              </div>
              <div class="fb-chart-block">
                <div class="fb-chart-title">损伤检测趋势</div>
                <div ref="chartDamageTrend" class="fb-chart-canvas"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 3-1 工单创建与分派 -->
      <template v-else-if="activeMenu === '3-1'">
        <div class="area-header">
          <h3 class="area-title">工单创建与分派</h3>
          <span class="area-sub">基于聚合反馈，逐步创建并分派处理工单</span>
        </div>

        <!-- 步骤条 -->
        <div class="ticket-steps-wrap">
          <el-steps :active="ticketStep" finish-status="success" align-center>
            <el-step title="问题确认" description="确认来源反馈" />
            <el-step title="工单详情" description="设置任务与紧急程度" />
            <el-step title="分派设置" description="指定管理区与人员" />
            <el-step title="确认提交" description="审核并提交工单" />
          </el-steps>
        </div>

        <!-- 步骤内容区 -->
        <div class="ticket-body">

          <!-- Step 0: 问题确认 -->
          <div v-if="ticketStep === 0" class="ticket-step-panel">
            <div class="step-panel-title">确认来源问题</div>
            <div v-if="ticketSource" class="source-feedback-card">
              <div class="source-header">
                <span class="dot" :class="ticketSource.level"></span>
                <span class="source-title">{{ ticketSource.title }}</span>
                <el-tag size="small" :type="ticketSource.level === 'urgent' ? 'danger' : ticketSource.level === 'warning' ? 'warning' : 'info'">
                  {{ ticketSource.level === 'urgent' ? '紧急' : ticketSource.level === 'warning' ? '警告' : '一般' }}
                </el-tag>
              </div>
              <div class="source-meta">
                <span>反馈数量：<b>{{ ticketSource.count }}</b> 条</span>
                <span>影响游客：约 <b>{{ ticketSource.impact }}</b> 人</span>
                <span>最近反馈：{{ ticketSource.lastMinutes }} 分钟前</span>
              </div>
              <div class="source-rep">代表反馈：{{ ticketSource.representative }}</div>
            </div>
            <div v-else class="no-source-tip">
              <el-empty description="未关联来源反馈，将创建独立工单" :image-size="60" />
            </div>
            <div class="step-form-item">
              <label class="step-label">工单标题 <span class="required">*</span></label>
              <el-input v-model="ticketForm.title" placeholder="请输入工单标题" maxlength="60" show-word-limit />
            </div>
          </div>

          <!-- Step 1: 工单详情 -->
          <div v-else-if="ticketStep === 1" class="ticket-step-panel">
            <div class="step-panel-title">填写工单详情</div>
            <div class="step-form-row">
              <div class="step-form-item half">
                <label class="step-label">工单类型 <span class="required">*</span></label>
                <el-select v-model="ticketForm.type" placeholder="请选择" style="width:100%">
                  <el-option label="设施维修" value="设施维修" />
                  <el-option label="环境清洁" value="环境清洁" />
                  <el-option label="安全处置" value="安全处置" />
                  <el-option label="服务改善" value="服务改善" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </div>
              <div class="step-form-item half">
                <label class="step-label">紧急程度 <span class="required">*</span></label>
                <el-radio-group v-model="ticketForm.urgency" class="urgency-group">
                  <el-radio-button label="紧急" />
                  <el-radio-button label="高" />
                  <el-radio-button label="中" />
                  <el-radio-button label="低" />
                </el-radio-group>
              </div>
            </div>
            <div class="step-form-item">
              <label class="step-label">任务说明 <span class="required">*</span></label>
              <el-input
                v-model="ticketForm.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述需要处理的任务内容、具体位置及注意事项..."
                maxlength="500"
                show-word-limit
              />
            </div>
            <div class="step-form-item">
              <label class="step-label">期望完成时间 <span class="required">*</span></label>
              <el-date-picker
                v-model="ticketForm.deadline"
                type="datetime"
                placeholder="请选择截止时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width:100%"
              />
            </div>
          </div>

          <!-- Step 2: 分派设置 -->
          <div v-else-if="ticketStep === 2" class="ticket-step-panel">
            <div class="step-panel-title">分派工单</div>
            <div class="step-form-item">
              <label class="step-label">管理区域 <span class="required">*</span></label>
              <el-select v-model="ticketForm.area" placeholder="请选择管理区域" style="width:100%" @change="ticketForm.assignee = ''">
                <el-option v-for="a in managementAreas" :key="a.name" :label="a.name" :value="a.name" />
              </el-select>
            </div>
            <div class="step-form-item">
              <label class="step-label">负责人员 <span class="required">*</span></label>
              <el-select v-model="ticketForm.assignee" placeholder="请先选择管理区域" style="width:100%" :disabled="!ticketForm.area">
                <el-option
                  v-for="s in currentAreaStaff"
                  :key="s.name"
                  :label="`${s.name}（${s.role}）`"
                  :value="s.name"
                />
              </el-select>
            </div>
            <div v-if="ticketForm.assignee" class="assignee-card">
              <div class="assignee-avatar">{{ ticketForm.assignee[0] }}</div>
              <div class="assignee-info">
                <div class="assignee-name">{{ ticketForm.assignee }}</div>
                <div class="assignee-area">{{ ticketForm.area }}</div>
              </div>
              <el-tag type="success" size="small">已选定</el-tag>
            </div>
            <div class="step-form-item">
              <label class="step-label">备注说明</label>
              <el-input
                v-model="ticketForm.notes"
                type="textarea"
                :rows="3"
                placeholder="可填写额外说明或特殊要求（选填）"
                maxlength="200"
                show-word-limit
              />
            </div>
          </div>

          <!-- Step 3: 确认提交 -->
          <div v-else-if="ticketStep === 3" class="ticket-step-panel">
            <div v-if="!ticketSubmitted">
              <div class="step-panel-title">确认工单信息</div>
              <div class="confirm-card">
                <div class="confirm-row">
                  <span class="confirm-label">工单标题</span>
                  <span class="confirm-value">{{ ticketForm.title }}</span>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">工单类型</span>
                  <el-tag size="small">{{ ticketForm.type }}</el-tag>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">紧急程度</span>
                  <el-tag size="small" :type="urgencyTagType(ticketForm.urgency)">{{ ticketForm.urgency }}</el-tag>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">任务说明</span>
                  <span class="confirm-value desc">{{ ticketForm.description }}</span>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">截止时间</span>
                  <span class="confirm-value">{{ ticketForm.deadline }}</span>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">管理区域</span>
                  <span class="confirm-value">{{ ticketForm.area }}</span>
                </div>
                <div class="confirm-row">
                  <span class="confirm-label">负责人员</span>
                  <span class="confirm-value">{{ ticketForm.assignee }}</span>
                </div>
                <div v-if="ticketForm.notes" class="confirm-row">
                  <span class="confirm-label">备注说明</span>
                  <span class="confirm-value desc">{{ ticketForm.notes }}</span>
                </div>
                <div v-if="ticketSource" class="confirm-row">
                  <span class="confirm-label">来源反馈</span>
                  <span class="confirm-value">{{ ticketSource.title }}（{{ ticketSource.count }} 条）</span>
                </div>
              </div>
            </div>
            <div v-else class="submit-success">
              <el-result icon="success" title="工单创建成功" :sub-title="`工单已分派给 ${ticketForm.area} · ${ticketForm.assignee}`">
                <template #extra>
                  <el-button type="primary" @click="resetTicket">创建新工单</el-button>
                  <el-button @click="activeMenu = '3-2'">查看工单追踪</el-button>
                </template>
              </el-result>
            </div>
          </div>

        </div>

        <!-- 底部导航按钮 -->
        <div v-if="!ticketSubmitted" class="ticket-nav">
          <el-button v-if="ticketStep > 0" @click="ticketStep--">上一步</el-button>
          <el-button
            v-if="ticketStep < 3"
            type="primary"
            :disabled="!ticketStepValid"
            @click="ticketStep++"
          >下一步</el-button>
          <el-button
            v-if="ticketStep === 3"
            type="primary"
            :loading="ticketSubmitting"
            @click="submitTicket"
          >提交工单</el-button>
        </div>
      </template>

      <!-- 3-2 工单流程追踪 -->
      <template v-else-if="activeMenu === '3-2'">
        <!-- 面包屑 -->
        <div class="track-breadcrumb">
          <span :class="['bc-item', trackView==='list' ? 'bc-cur' : 'bc-link']" @click="trackView='list'">工单流程追踪</span>
          <template v-if="trackView !== 'list'">
            <span class="bc-sep">›</span>
            <span :class="['bc-item', trackView==='detail' ? 'bc-cur' : 'bc-link']" @click="trackView='detail'">工单详情</span>
          </template>
          <template v-if="trackView === 'track'">
            <span class="bc-sep">›</span>
            <span class="bc-item bc-cur">追踪流程</span>
          </template>
        </div>

        <!-- 工单列表 -->
        <div v-if="trackView === 'list'" class="panel list-panel">
          <div class="panel-title">工单列表 <span class="count-badge">{{ trackTickets.length }}</span></div>
          <div v-if="trackTickets.length === 0" class="tip-text">暂无工单，请先在「工单创建与分派」中创建工单</div>
          <div v-else class="track-list">
            <div v-for="t in trackTickets" :key="t.id" class="track-item" @click="selectedTicket = t; trackView = 'detail'">
              <div class="track-item-top">
                <el-tag :type="urgencyTagType(t.urgency)" size="small">{{ t.urgency }}</el-tag>
                <span class="track-item-title">{{ t.title }}</span>
                <el-tag :type="statusTagType(t.status)" size="small">{{ t.status }}</el-tag>
              </div>
              <div class="track-item-meta">
                <span>{{ t.id }}</span>
                <span>{{ t.area }} · {{ t.assignee }}</span>
                <span>{{ t.createdAt }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 工单详情 -->
        <div v-else-if="trackView === 'detail'" class="panel">
          <div class="panel-title">工单详情</div>
          <div class="confirm-card">
            <div class="confirm-row"><span class="confirm-label">工单编号</span><span class="confirm-value">{{ selectedTicket.id }}</span></div>
            <div class="confirm-row"><span class="confirm-label">工单标题</span><span class="confirm-value">{{ selectedTicket.title }}</span></div>
            <div class="confirm-row"><span class="confirm-label">类型</span><span class="confirm-value">{{ selectedTicket.type }}</span></div>
            <div class="confirm-row"><span class="confirm-label">紧急程度</span><span class="confirm-value"><el-tag :type="urgencyTagType(selectedTicket.urgency)" size="small">{{ selectedTicket.urgency }}</el-tag></span></div>
            <div class="confirm-row"><span class="confirm-label">负责区域</span><span class="confirm-value">{{ selectedTicket.area }}</span></div>
            <div class="confirm-row"><span class="confirm-label">负责人</span><span class="confirm-value">{{ selectedTicket.assignee }}</span></div>
            <div class="confirm-row"><span class="confirm-label">问题描述</span><span class="confirm-value desc">{{ selectedTicket.description }}</span></div>
            <div class="confirm-row"><span class="confirm-label">截止日期</span><span class="confirm-value">{{ selectedTicket.deadline }}</span></div>
            <div class="confirm-row"><span class="confirm-label">当前状态</span><span class="confirm-value"><el-tag :type="statusTagType(selectedTicket.status)" size="small">{{ selectedTicket.status }}</el-tag></span></div>
          </div>
          <div class="ticket-nav" style="margin-top:16px">
            <el-button @click="trackView = 'list'">返回</el-button>
            <el-button type="primary" @click="trackView = 'track'">查看追踪流程</el-button>
          </div>
        </div>

        <!-- 追踪流程 -->
        <div v-else-if="trackView === 'track'" class="panel">
          <div class="panel-title">追踪流程 — {{ selectedTicket.title }}</div>

          <!-- 步骤条 -->
          <div class="ticket-steps-wrap">
            <el-steps :active="currentStep" finish-status="success" align-center>
              <el-step
                v-for="(s,i) in stepNames"
                :key="i"
                :title="s"
                @click.native="changeStep(i+1)"
              />
            </el-steps>
          </div>

          <!-- 步骤内容 -->
          <div class="track-step-content">
            <!-- Step 1: 待接收 -->
            <div v-if="currentStep === 1" class="step-panel">
              <div class="step-label">来源反馈 / 问题描述</div>
              <p class="step-text">{{ selectedTicket.description }}</p>
              <el-button type="primary" @click="confirmReceive">接收确认</el-button>
            </div>
            <!-- Step 2: 待修复 -->
            <div v-else-if="currentStep === 2" class="step-panel">
              <div class="step-label">接收人</div>
              <p class="step-text">{{ selectedTicket.assignee }} / {{ selectedTicket.receivedAt }}</p>
              <el-button @click="viewProgress">查看进度</el-button>
            </div>
            <!-- Step 3: 待反馈 -->
            <div v-else-if="currentStep === 3" class="step-panel">
              <div class="step-label">检查描述</div>
              <el-input type="textarea" v-model="examDescription" :rows="3" placeholder="请输入检查情况描述" />
              <div class="step-label" style="margin-top:8px">检查图片</div>
              <el-upload
                action=""
                list-type="picture-card"
                :on-preview="handlePreview"
                :on-remove="handleRemoveExam"
                :file-list="examFiles"
                :auto-upload="false"
                multiple
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-button type="primary" @click="confirmExamResult" style="margin-top:8px">确认检查结果</el-button>
            </div>
            <!-- Step 4: 待验收 -->
            <div v-else-if="currentStep === 4" class="step-panel">
              <div class="step-label">修复描述</div>
              <el-input type="textarea" v-model="repairDescription" :rows="3" placeholder="请输入修复结果描述" />
              <div class="step-label" style="margin-top:8px">修复图片</div>
              <el-upload
                action=""
                list-type="picture-card"
                :on-preview="handlePreview"
                :on-remove="handleRemoveRepair"
                :file-list="repairFiles"
                :auto-upload="false"
                multiple
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <div class="step-btns" style="margin-top:8px">
                <el-button type="danger" @click="returnForRepair">退回重新处理</el-button>
                <el-button type="primary" @click="acceptRepair">验收通过</el-button>
              </div>
            </div>
            <!-- Step 5: 已完成 -->
            <div v-else-if="currentStep === 5" class="step-panel">
              <div class="step-label">完成时间</div>
              <p class="step-text">{{ selectedTicket.completedAt }}</p>

              <div v-if="selectedTicket.exam" class="step-section">
                <div class="step-label" style="margin-top:8px">检查情况</div>
                <p class="step-text">{{ selectedTicket.exam.description }}</p>
                <div class="image-preview" v-if="selectedTicket.exam.images && selectedTicket.exam.images.length">
                  <el-image
                    v-for="(f,i) in selectedTicket.exam.images"
                    :key="i"
                    :src="f.url || f.preview || ''"
                    style="width:80px; height:80px; margin-right:6px"
                    :preview-src-list="[f.url || f.preview]"
                  />
                </div>
              </div>

              <div v-if="selectedTicket.repair" class="step-section">
                <div class="step-label" style="margin-top:8px">修复情况</div>
                <p class="step-text">{{ selectedTicket.repair.description }}</p>
                <div class="image-preview" v-if="selectedTicket.repair.images && selectedTicket.repair.images.length">
                  <el-image
                    v-for="(f,i) in selectedTicket.repair.images"
                    :key="i"
                    :src="f.url || f.preview || ''"
                    style="width:80px; height:80px; margin-right:6px"
                    :preview-src-list="[f.url || f.preview]"
                  />
                </div>
              </div>

              <div class="step-label" style="margin-top:8px">最终结果</div>
              <p class="step-text">{{ selectedTicket.finalResult }}</p>
              <el-button @click="trackView='detail'">查看详情</el-button>
            </div>
          </div>

          <!-- step navigation (previous/next) -->
          <div class="track-nav" style="margin-top:12px; text-align:center">
            <el-button
              v-if="currentStep > 1"
              @click="changeStep(currentStep - 1)"
            >上一步</el-button>
            <el-button
              v-if="currentStep < stepNames.length"
              type="primary"
              @click="changeStep(currentStep + 1)"
            >下一步</el-button>
          </div>

          <div class="ticket-nav" style="margin-top:16px">
            <el-button @click="trackView = 'detail'">返回</el-button>
          </div>
        </div>
      </template>

      <!-- 3-3 工单统计与分析 -->
      <template v-else-if="activeMenu === '3-3'">
        <div class="area-header">
          <h3 class="area-title">工单统计与分析</h3>
          <span class="area-sub">基于已有工单与反馈数据生成关键指标与图表</span>
          <el-button type="primary" class="export-btn" size="small" @click="exportReport" style="float:right; margin-top:4px">导出报表</el-button>
        </div>
        <!-- 模块一：工单核心指标 -->
        <div class="sm-section sm-section-blue">
          <div class="sm-header">
            <div class="sm-header-left">
              <img src="@/assets/workOrderAnalysis/工单指标.png" class="sm-icon-img" alt="">
              <div>
                <div class="sm-title">工单核心指标</div>
                <div class="sm-sub">高频问题 · 区域分布 · 处理效率 · 人员工作量</div>
              </div>
            </div>
            <div class="sm-kpi-row">
              <div class="sm-kpi">
                <div class="sm-kpi-val">{{ trackTickets.length }}</div>
                <div class="sm-kpi-label">总工单数</div>
              </div>
              <div class="sm-kpi">
                <div class="sm-kpi-val sm-kpi-green">{{ trackTickets.filter(t=>t.status==='已完成').length }}</div>
                <div class="sm-kpi-label">已完成</div>
              </div>
              <div class="sm-kpi">
                <div class="sm-kpi-val sm-kpi-orange">{{ trackTickets.filter(t=>t.status==='处理中').length }}</div>
                <div class="sm-kpi-label">处理中</div>
              </div>
              <div class="sm-kpi">
                <div class="sm-kpi-val sm-kpi-red">{{ efficiencyStats.overdueCount }}</div>
                <div class="sm-kpi-label">超时工单</div>
              </div>
            </div>
          </div>
          <div class="sm-grid">
            <!-- 高频问题 TOP10 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-purple"></span>高频问题 TOP10</div>
              </template>
              <el-table :data="problemTop10" stripe style="width:100%" size="small" class="sm-table">
                <el-table-column prop="rank" label="排名" width="52" align="center">
                  <template #default="{ row }">
                    <span :class="['sm-rank', row.rank <= 3 ? 'sm-rank-hot' : '']">{{ row.rank }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="问题类型" />
                <el-table-column prop="count" label="数量" width="64" align="center" />
                <el-table-column prop="ratio" label="占比" width="64" align="center" />
                <el-table-column prop="trend" label="趋势" width="64" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.trend==='上升'?'danger':'success'" size="small">{{ row.trend }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <!-- 各区域工单分布 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-blue"></span>各区域工单分布</div>
              </template>
              <BaseChart :option="regionBarOption" height="260px" />
            </el-card>

            <!-- 处理效率 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-cyan"></span>处理效率分析</div>
              </template>
              <BaseChart :option="efficiencyDoughnutOption" height="200px" />
              <div class="eff-stats">
                <div class="eff-stat-item">
                  <div class="eff-stat-val" style="color:#52c41a">{{ efficiencyStats.ontime }}</div>
                  <div class="eff-stat-label">按时完成</div>
                </div>
                <div class="eff-stat-item">
                  <div class="eff-stat-val" style="color:#ff4d4f">{{ efficiencyStats.overdueCount }}</div>
                  <div class="eff-stat-label">超时工单</div>
                </div>
                <div class="eff-stat-item">
                  <div class="eff-stat-val" style="color:#1890ff">{{ efficiencyStats.avgTime }}h</div>
                  <div class="eff-stat-label">平均处理时长</div>
                </div>
              </div>
            </el-card>

            <!-- 人员工作量排行 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-orange"></span>人员工作量排行</div>
              </template>
              <el-table :data="staffWorkload" stripe style="width:100%" size="small" class="sm-table">
                <el-table-column prop="rank" label="排名" width="52" align="center">
                  <template #default="{ row }">
                    <span :class="['sm-rank', row.rank <= 3 ? 'sm-rank-hot' : '']">{{ row.rank }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="processed" label="处理" width="52" align="center" />
                <el-table-column prop="completed" label="完成" width="52" align="center" />
                <el-table-column prop="rate" label="完成率" width="72" align="center">
                  <template #default="{ row }">
                    <el-tag :type="parseInt(row.rate)>=80?'success':parseInt(row.rate)>=60?'warning':'danger'" size="small">{{ row.rate }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>

        <!-- 模块二：游客满意度与舆情 -->
        <div class="sm-section sm-section-teal">
          <div class="sm-header">
            <div class="sm-header-left">
              <img src="@/assets/workOrderAnalysis/满意度.png" class="sm-icon-img" alt="">
              <div>
                <div class="sm-title">游客满意度与舆情分析</div>
                <div class="sm-sub">满意度趋势对比 · 高频词云（处理前 / 处理后）</div>
              </div>
            </div>
          </div>
          <div class="sm-grid sm-grid-full">
            <!-- 满意度趋势 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-teal"></span>游客满意度趋势（近30天）</div>
              </template>
              <BaseChart :option="satisfactionOption" height="280px" />
            </el-card>

            <!-- 词云对比 -->
            <el-card class="sm-card">
              <template #header>
                <div class="sm-card-header"><span class="sm-dot sm-dot-pink"></span>词云对比（处理前 / 处理后）</div>
              </template>
              <div class="wc-wrap">
                <div class="wc-col">
                  <div class="wc-label wc-label-red">处理前</div>
                  <BaseChart :option="wordCloudOptionBefore" height="220px" />
                </div>
                <div class="wc-divider"></div>
                <div class="wc-col">
                  <div class="wc-label wc-label-green">处理后</div>
                  <BaseChart :option="wordCloudOptionAfter" height="220px" />
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 古建损伤修复工单统计分析 -->
        <div class="dr-section">
          <div class="dr-header">
            <div class="dr-header-left">
              <img src="@/assets/workOrderAnalysis/损伤分析.png" class="sm-icon-img" alt="">
              <div>
                <div class="dr-header-title">古建损伤修复工单统计分析</div>
                <div class="dr-header-sub">基于 YOLO11 检测数据与修复工单的综合分析</div>
              </div>
            </div>
            <div class="dr-header-badges">
              <span class="dr-badge dr-badge-red">高风险 3</span>
              <span class="dr-badge dr-badge-orange">中风险 4</span>
              <span class="dr-badge dr-badge-green">低风险 3</span>
            </div>
          </div>

          <div class="dr-grid">
            <!-- 图1: 古建损伤类型分布 饼图 -->
            <el-card class="dr-card">
              <template #header>
                <div class="dr-card-header">
                  <span class="dr-card-dot dot-blue"></span>古建损伤类型分布
                </div>
              </template>
              <div ref="chartDmgPie" class="dr-chart-box"></div>
            </el-card>

            <!-- 图2: 各区域损伤热力图 -->
            <el-card class="dr-card">
              <template #header>
                <div class="dr-card-header">
                  <span class="dr-card-dot dot-orange"></span>各区域损伤热力图（平遥古城）
                </div>
              </template>
              <div ref="chartDmgHeat" class="dr-chart-box"></div>
            </el-card>

            <!-- 图3: 古建损伤 TOP10 列表 -->
            <el-card class="dr-card">
              <template #header>
                <div class="dr-card-header">
                  <span class="dr-card-dot dot-red"></span>古建损伤 TOP10
                </div>
              </template>
              <div class="dr-top10">
                <div v-for="(item, i) in damageTop10" :key="i" class="dr-top10-row">
                  <span :class="['dr-rank', i < 3 ? 'dr-rank-hot' : '']">{{ i + 1 }}</span>
                  <div class="dr-top10-info">
                    <span class="dr-top10-loc">{{ item.location }}</span>
                    <span class="dr-top10-type">{{ item.type }}</span>
                  </div>
                  <div class="dr-top10-bar-wrap">
                    <div class="dr-top10-bar" :style="{ width: item.ratio + '%', background: item.color }"></div>
                  </div>
                  <span class="dr-top10-cnt">{{ item.count }}</span>
                </div>
              </div>
            </el-card>

            <!-- 图4: 损伤原因分布 横版柱状图 -->
            <el-card class="dr-card">
              <template #header>
                <div class="dr-card-header">
                  <span class="dr-card-dot dot-green"></span>损伤原因分布
                </div>
              </template>
              <div ref="chartDmgCause" class="dr-chart-box"></div>
            </el-card>
          </div>
        </div>
      </template>

      <!-- 占位面板（其他模块） -->
      <div v-else class="placeholder-panel">
        <div class="ph-icon"></div>
        <div class="ph-title">{{ menuTitles[activeMenu] }}</div>
        <div class="ph-desc">该模块正在建设中，敬请期待</div>
      </div>

    </main>
  </div>
</template>

<script>
import axios from 'axios'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import BaseChart from './charts/BaseChart.vue'
import boardBg1 from '@/assets/boardBg/背景1.png'
import boardBg2 from '@/assets/boardBg/背景2.png'
import boardBg3 from '@/assets/boardBg/背景3.png'

// 各类反馈所用的头像集合（import.meta.glob 路径必须是静态字符串）
const animalAvatars = Object.values(import.meta.glob('@/assets/profilePicture/animal/*.{jpg,jpeg,png,gif}', { eager: true })).map(m => m.default)
const peopleAvatars = Object.values(import.meta.glob('@/assets/profilePicture/people/*.{jpg,jpeg,png,gif}', { eager: true })).map(m => m.default)
const workerAvatars = Object.values(import.meta.glob('@/assets/profilePicture/worker/*.{jpg,jpeg,png,gif}', { eager: true })).map(m => m.default)
const cityAvatars   = Object.values(import.meta.glob('@/assets/profilePicture/city/*.{jpg,jpeg,png,gif}',   { eager: true })).map(m => m.default)

// 从给定数组中随机取一个
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 给列表填充随机头像，可指定头像数组
function setRandomAvatars(feedbackList, avatarArray) {
  return feedbackList.map(item => ({
    ...item,
    avatar: pickRandom(avatarArray)
  }))
}

export default {
  components: { BaseChart },
  data() {
    return {
      activeMenu: '1-1',
      menuTitles: {
        '1-2': '发布结果分析',
        '2-1': '游客反馈',
        '2-2': '商户反馈',
        '2-3': '工作人员反馈',
        '2-4': '损伤检测',
        '3-1': '工单创建与分派',
        '3-2': '工单流程追踪',
        '3-3': '工单统计与分析'
      },
      loading: false,
      submitting: false,
      submitMsg: null,
      announcements: [],
      filterType: '',
      dialogVisible: false,
      editingId: null,
      previewBgIndex: 0,
      previewBgList: [
        { src: boardBg1, label: '背景1' },
        { src: boardBg2, label: '背景2' },
        { src: boardBg3, label: '背景3' }
      ],
      scenicSpots: [],
      groupRefs: {},
      form: {
        title: '',
        type: '通知',
        content: '',
        channels: ['tourist_home'],
        subtype: ''
      },
      feedbackCategory: 'all',
      feedbackSeverity: 'all',
      dateRange: [],
      // 聚合反馈数据（自动聚合相似问题）
      aggregatedFeedbacks: [
        {
          id: 1,
          level: 'urgent',
          title: '设施-厕所损坏-平遥古城东门',
          count: 56,
          lastMinutes: 3,
          representative: '张三 - 厕所坏了，排队很长',
          impact: 150,
          selected: false
        },
        {
          id: 2,
          level: 'warning',
          title: '服务-导游态度差',
          count: 12,
          lastMinutes: 10,
          representative: '李四 - 导游态度很冷漠',
          impact: 30,
          selected: false
        },
        {
          id: 3,
          level: 'normal',
          title: '环境-垃圾桶满溢-主街道',
          count: 8,
          lastMinutes: 25,
          representative: '王五 - 垃圾桶没人清理',
          impact: 80,
          selected: false
        },
        {
          id: 4,
          level: 'urgent',
          title: '安全-护栏松动-古城墙西段',
          count: 23,
          lastMinutes: 5,
          representative: '赵六 - 护栏摇晃很危险',
          impact: 200,
          selected: false
        }
      ],
      feedbackList: setRandomAvatars([ // 动物头像
        { id:1,  name:'李明',   avatar:'李', category:'设施问题', content:'景区内部分石板路破损严重，容易绊倒游客，建议尽快修缮。', time:'2026-02-25 09:12', sentiment:'负面' },
        { id:2,  name:'王芳',   avatar:'王', category:'服务投诉', content:'售票窗口工作人员态度较差，排队等候时间过长，希望增加人手。', time:'2026-02-25 10:34', sentiment:'负面' },
        { id:3,  name:'张伟',   avatar:'张', category:'环境卫生', content:'古城东区垃圾桶数量不足，部分区域有垃圾堆积现象。', time:'2026-02-25 11:05', sentiment:'负面' },
        { id:4,  name:'刘洋',   avatar:'刘', category:'安全隐患', content:'夜间景区部分路段照明不足，存在安全隐患，建议增设路灯。', time:'2026-02-25 13:22', sentiment:'负面' },
        { id:5,  name:'陈静',   avatar:'陈', category:'设施问题', content:'公共卫生间设施老旧，洗手台水龙头有漏水情况，需要维修。', time:'2026-02-25 14:08', sentiment:'负面' },
        { id:6,  name:'赵磊',   avatar:'赵', category:'其他',     content:'景区内餐饮价格偏高，建议引入更多平价餐饮选择。', time:'2026-02-25 14:55', sentiment:'中性' },
        { id:7,  name:'孙丽',   avatar:'孙', category:'服务投诉', content:'导览讲解员专业知识不足，对历史文化介绍不够深入。', time:'2026-02-25 15:30', sentiment:'负面' },
        { id:8,  name:'周强',   avatar:'周', category:'环境卫生', content:'景区内绿化维护较好，整体环境整洁，游览体验不错。', time:'2026-02-25 16:10', sentiment:'正面' },
        { id:9,  name:'吴霞',   avatar:'吴', category:'设施问题', content:'景区内停车场标识不清晰，找停车位花费了很长时间。', time:'2026-02-25 16:45', sentiment:'负面' },
        { id:10, name:'郑浩',   avatar:'郑', category:'安全隐患', content:'古城墙部分区域护栏松动，存在安全风险，请及时检修。', time:'2026-02-25 17:20', sentiment:'负面' },
        { id:11, name:'冯雪',   avatar:'冯', category:'其他',     content:'景区文创产品种类丰富，设计精美，非常有纪念价值。', time:'2026-02-26 08:30', sentiment:'正面' },
        { id:12, name:'蒋涛',   avatar:'蒋', category:'服务投诉', content:'景区APP预约系统经常出现故障，无法正常完成预约操作。', time:'2026-02-26 09:15', sentiment:'负面' },
        { id:13, name:'沈燕',   avatar:'沈', category:'环境卫生', content:'景区内部分水域有漂浮垃圾，影响景观效果，建议加强清洁。', time:'2026-02-26 10:00', sentiment:'负面' },
        { id:14, name:'韩鹏',   avatar:'韩', category:'安全隐患', content:'雨天景区石板路非常湿滑，建议铺设防滑垫或增加警示标识。', time:'2026-02-26 10:40', sentiment:'中性' },
        { id:15, name:'杨梅',   avatar:'杨', category:'设施问题', content:'景区内休息座椅数量不足，老年游客和儿童缺乏休息场所。', time:'2026-02-26 11:25', sentiment:'中性' },
        { id:16, name:'许博',   avatar:'许', category:'服务投诉', content:'景区讲解预约系统体验良好，工作人员服务热情周到，点赞！', time:'2026-02-26 12:10', sentiment:'正面' },
        { id:17, name:'何娜',   avatar:'何', category:'安全隐患', content:'景区内部分古建筑区域游客密度过大，存在踩踏风险。', time:'2026-02-26 13:05', sentiment:'负面' },
        { id:18, name:'罗军',   avatar:'罗', category:'环境卫生', content:'景区厕所清洁频率不够，高峰期卫生状况较差，需要改善。', time:'2026-02-26 13:50', sentiment:'负面' },
        { id:19, name:'宋佳',   avatar:'宋', category:'其他',     content:'景区夜游活动非常精彩，灯光效果震撼，强烈推荐！', time:'2026-02-26 14:30', sentiment:'正面' },
        { id:20, name:'唐辉',   avatar:'唐', category:'设施问题', content:'景区内无障碍设施不完善，轮椅通道部分路段坡度过大。', time:'2026-02-26 15:10', sentiment:'中性' }
      ], animalAvatars),
      // 商户反馈数据
      merchantDateRange: [],
      merchantFeedbackSeverity: 'all',
      merchantFeedbackList: setRandomAvatars([ // 商户使用人物头像
        { id:1,  name:'赵老板', avatar:'赵', category:'经营问题', content:'店里网络信号不好，扫码支付经常失败，影响生意。', time:'2026-02-25 09:30', sentiment:'负面' },
        { id:2,  name:'钱老板', avatar:'钱', category:'经营问题', content:'景区客流分布不均，周末人太少，希望多做促销活动。', time:'2026-02-25 10:15', sentiment:'中性' },
        { id:3,  name:'孙老板', avatar:'孙', category:'建议', content:'建议景区提供一个统一的线上推广平台，帮助我们宣传。', time:'2026-02-25 11:20', sentiment:'正面' },
        { id:4,  name:'李老板', avatar:'李', category:'经营问题', content:'店内供电不稳定，有时候突然断电，冰箱里的食品会坏掉。', time:'2026-02-25 14:00', sentiment:'负面' },
        { id:5,  name:'周老板', avatar:'周', category:'建议', content:'希望景区能减免一些旺季的租金费用，生意不好做。', time:'2026-02-25 15:30', sentiment:'中性' },
        { id:6,  name:'吴老板', avatar:'吴', category:'经营问题', content:'游客消费能力下降，营业额比去年下降了三成。', time:'2026-02-26 09:00', sentiment:'负面' },
        { id:7,  name:'郑老板', avatar:'郑', category:'建议', content:'建议景区组织商户培训，提升服务质量。', time:'2026-02-26 10:30', sentiment:'正面' },
        { id:8,  name:'王老板', avatar:'王', category:'经营问题', content:'店铺门前道路施工，导致客流明显减少。', time:'2026-02-26 11:45', sentiment:'负面' }
      ], peopleAvatars),
      // 工作人员反馈数据
      staffDateRange: [],
      staffFeedbackSeverity: 'all',
      staffFeedbackList: setRandomAvatars([ // 工作人员使用工人头像
        { id:1,  name:'保安A', avatar:'保', category:'安全隐患', content:'北门入口处监控摄像头损坏，存在盲区，建议尽快维修。', time:'2026-02-25 08:30', sentiment:'负面' },
        { id:2,  name:'保洁B', avatar:'保', category:'治安管理', content:'东厕所附近有游客乱扔垃圾，清洁频率需要增加。', time:'2026-02-25 09:15', sentiment:'负面' },
        { id:3,  name:'导游C', avatar:'导', category:'安全隐患', content:'雨天路面湿滑，建议在主要路段铺设防滑垫。', time:'2026-02-25 10:00', sentiment:'中性' },
        { id:4,  name:'维修D', avatar:'维', category:'安全隐患', content:'古城墙西段路灯不亮，夜班巡逻视线不好。', time:'2026-02-25 11:30', sentiment:'负面' },
        { id:5,  name:'保安E', avatar:'保', category:'治安管理', content:'周末客流高峰期，安保人员不足，需要增派人员。', time:'2026-02-25 14:20', sentiment:'中性' },
        { id:6,  name:'保洁F', avatar:'保', category:'治安管理', content:'景区内有可疑人员徘徊，建议加强巡逻。', time:'2026-02-26 09:00', sentiment:'负面' },
        { id:7,  name:'维修G', avatar:'维', category:'安全隐患', content:'游客中心空调设备老化，制冷效果不佳。', time:'2026-02-26 10:15', sentiment:'中性' },
        { id:8,  name:'导游H', avatar:'导', category:'其他', content:'建议增加讲解器数量，高峰期不够用。', time:'2026-02-26 11:30', sentiment:'中性' }
      ], workerAvatars),
      // 损伤检测数据
      damageDateRange: [],
      damageType: 'all',
      damageRecords: setRandomAvatars([
        { id:1, avatar:'北', location:'北城墙东段', type:'混凝土裂缝', severity:'高风险', description:'裂缝宽度达3cm，需立即处理', time:'2026-02-26 08:15', confidence:'92%' },
        { id:2, avatar:'西', location:'西城门楼', type:'砖裂缝', severity:'中风险', description:'砖缝有明显裂缝，建议近期修补', time:'2026-02-26 09:30', confidence:'88%' },
        { id:3, avatar:'东', location:'东大街商铺', type:'剥落', severity:'中风险', description:'墙面砂浆层剥落，面积约0.5㎡', time:'2026-02-26 10:00', confidence:'95%' },
        { id:4, avatar:'南', location:'南门城墙', type:'木裂缝', severity:'低风险', description:'木质构件轻微裂缝，不影响结构', time:'2026-02-26 10:45', confidence:'85%' },
        { id:5, avatar:'中', location:'中心广场', type:'发霉', severity:'低风险', description:'墙角有霉斑，需除潮处理', time:'2026-02-26 11:20', confidence:'90%' },
        { id:6, avatar:'北', location:'北城墙西段', type:'裸露钢筋', severity:'高风险', description:'钢筋外露锈蚀，严重威胁结构安全', time:'2026-02-26 13:00', confidence:'97%' },
        { id:7, avatar:'古', location:'古县衙大门', type:'混凝土裂缝', severity:'中风险', description:'门框上方裂缝，需定期观察', time:'2026-02-26 14:30', confidence:'91%' },
        { id:8, avatar:'民', location:'民居示范区', type:'砖裂缝', severity:'低风险', description:'墙面细裂缝，不影响整体', time:'2026-02-26 15:15', confidence:'86%' }
      ], cityAvatars),
      // 工单创建与分派
      ticketStep: 0,
      ticketSource: null,
      ticketSubmitted: false,
      ticketSubmitting: false,
      ticketForm: {
        title: '',
        type: '设施维修',
        urgency: '中',
        description: '',
        deadline: '',
        area: '',
        assignee: '',
        notes: ''
      },
      managementAreas: [
        { name: '东门管理区', staff: [
          { name: '张建国', role: '区域主管' },
          { name: '李明华', role: '维修工程师' },
          { name: '王秀英', role: '保洁主管' }
        ]},
        { name: '西门管理区', staff: [
          { name: '陈志远', role: '区域主管' },
          { name: '刘晓燕', role: '安全员' },
          { name: '赵国强', role: '维修工程师' }
        ]},
        { name: '南门管理区', staff: [
          { name: '孙建军', role: '区域主管' },
          { name: '周丽华', role: '保洁主管' },
          { name: '吴大伟', role: '安全员' }
        ]},
        { name: '北门管理区', staff: [
          { name: '郑海波', role: '区域主管' },
          { name: '冯晓梅', role: '维修工程师' },
          { name: '蒋志强', role: '安全员' }
        ]},
        { name: '古城墙管理区', staff: [
          { name: '沈建平', role: '区域主管' },
          { name: '韩美丽', role: '文物保护员' },
          { name: '杨国华', role: '维修工程师' }
        ]},
        { name: '主街道管理区', staff: [
          { name: '许志明', role: '区域主管' },
          { name: '何秀兰', role: '保洁主管' },
          { name: '罗建国', role: '安全员' }
        ]}
      ],
      trackView: 'list',
      selectedTicket: null,
      // for edit panel state
      examDescription: '',
      examFiles: [],
      repairDescription: '',
      repairFiles: [],
      trackTickets: [
        {
          id: 'WO-2026-001', title: '设施-厕所损坏-平遥古城东门', type: '设施维修', urgency: '紧急',
          area: '东门管理区', assignee: '李明华', description: '东门厕所设施损坏，排队游客较多，需立即维修',
          deadline: '2026-02-28', createdAt: '2026-02-25 09:30', status: '待接收',
          receivedAt: '',
          completedAt: '',
          finalResult: '',
          steps: [],
          exam: null,
          repair: null
        },
        {
          id: 'WO-2026-002', title: '安全-护栏松动-古城墙西段', type: '安全整改', urgency: '紧急',
          area: '古城墙管理区', assignee: '杨国华', description: '古城墙西段护栏松动，存在安全隐患，需立即加固',
          deadline: '2026-02-27', createdAt: '2026-02-25 10:15', status: '已完成',
          completedAt: '2026-02-25 14:35',
          finalResult: '护栏加固完成，验收通过',
          exam: { description: '现场检查护栏情况，确认松动位置并记录', images: [] },
          repair: { description: '加固完成并涂防锈漆', images: [] },
          steps: [
            { label: '工单创建', time: '2026-02-25 10:15', done: true, operator: '系统管理员', note: '基于损伤检测报告创建' },
            { label: '工单分派', time: '2026-02-25 10:20', done: true, operator: '沈建平', note: '已分派至古城墙管理区杨国华' },
            { label: '人员响应', time: '2026-02-25 10:35', done: true, operator: '杨国华', note: '已接单，携带工具前往' },
            { label: '现场处理', time: '2026-02-25 13:00', done: true, operator: '杨国华', note: '护栏加固完成' },
            { label: '完成验收', time: '2026-02-25 14:30', done: true, operator: '沈建平', note: '验收通过，安全隐患消除' },
            { label: '工单关闭', time: '2026-02-25 14:35', done: true, operator: '系统管理员', note: '工单正常关闭' }
          ]
        },
        {
          id: 'WO-2026-003', title: '环境-垃圾桶满溢-主街道', type: '环境整治', urgency: '中',
          area: '主街道管理区', assignee: '何秀兰', description: '主街道垃圾桶满溢，影响景区环境，需及时清理',
          deadline: '2026-02-26', createdAt: '2026-02-25 11:30', status: '待接收',
          steps: [
            { label: '工单创建', time: '2026-02-25 11:30', done: true, operator: '系统管理员', note: '基于游客反馈聚合创建' },
            { label: '工单分派', time: '', done: false, operator: '', note: '' },
            { label: '人员响应', time: '', done: false, operator: '', note: '' },
            { label: '现场处理', time: '', done: false, operator: '', note: '' },
            { label: '完成验收', time: '', done: false, operator: '', note: '' },
            { label: '工单关闭', time: '', done: false, operator: '', note: '' }
          ]
        }
      ],
      // statistics data
      problemTop10: [],
      regionStats: [],
      efficiencyStats: { ontime:0, overdue:0, avgTime:0, overdueCount:0 },
      staffWorkload: [],
      satisfactionTrend: { dates: [], before: [], after: [] },
      satisfactionWords: { before: [], after: [] },
      damageTop10: [
        { location: '北城墙东段', type: '混凝土裂缝', count: 23, ratio: 100, color: '#ff6b6b' },
        { location: '北城墙西段', type: '裸露钢筋',   count: 18, ratio: 78,  color: '#ff6b6b' },
        { location: '西城门楼',   type: '砖裂缝',     count: 15, ratio: 65,  color: '#ffa94d' },
        { location: '古县衙大门', type: '混凝土裂缝', count: 12, ratio: 52,  color: '#ffa94d' },
        { location: '东大街商铺', type: '剥落',       count: 10, ratio: 43,  color: '#74c0fc' },
        { location: '南门城墙',   type: '木裂缝',     count: 8,  ratio: 35,  color: '#74c0fc' },
        { location: '中心广场',   type: '发霉',       count: 7,  ratio: 30,  color: '#63e6be' },
        { location: '民居示范区', type: '砖裂缝',     count: 6,  ratio: 26,  color: '#63e6be' },
        { location: '东城门楼',   type: '剥落',       count: 5,  ratio: 22,  color: '#a9e34b' },
        { location: '主街道两侧', type: '发霉',       count: 4,  ratio: 17,  color: '#a9e34b' }
      ]
    }
  },
    computed: {
      channelGroups() {
      return [
        {
          key: 'tourist',
          label: '游客端',
          color: 'ch-blue',
          children: [
            { key: 'tourist_home', label: '首页Banner' },
            { key: 'tourist_notify', label: '消息通知（订阅用户）' }
          ]
        },
        {
          key: 'scenic',
          label: '景区各管理区',
          color: 'ch-green',
          children: this.scenicSpots.map(name => ({ key: `scenic_${name}`, label: name }))
        },
        {
          key: 'social',
          label: '社交平台',
          color: 'ch-orange',
          children: [
            { key: 'social_wechat', label: '微信公众号' },
            { key: 'social_douyin', label: '抖音官方账号' }
          ]
        }
      ]
    },
    selectedScenicNames() {
      return this.form.channels
        .filter(k => k.startsWith('scenic_'))
        .map(k => k.replace('scenic_', ''))
    },
    selectedSocialNames() {
      const map = { social_wechat: '微信公众号', social_douyin: '抖音官方账号' }
      return this.form.channels.filter(k => k.startsWith('social_')).map(k => map[k] || k)
    },
    allTypes() {
      return [...new Set(this.announcements.map(a => a.type))]
    },
    filteredAnnouncements() {
      if (!this.filterType) return this.announcements
      return this.announcements.filter(a => a.type === this.filterType)
    },
    // current workflow step index for selected ticket
    currentStep() {
      const map = { '待接收': 1, '待修复': 2, '待反馈': 3, '待验收': 4, '已完成': 5 }
      if (this.selectedTicket) return map[this.selectedTicket.status] || 1
      return 1
    },
    stepNames() {
      return ['待接收', '待修复', '待反馈', '待验收', '已完成']
    },
    typeStats() {
      if (!this.filterType) return null
      const filtered = this.filteredAnnouncements
      if (!filtered.length) return null
      const total = filtered.length
      const ratio = Math.round((total / this.announcements.length) * 100)
      const latest = filtered.reduce((a, b) => a.created_at > b.created_at ? a : b)
      const chCount = {}
      filtered.forEach(a => {
        if (a.channels) a.channels.forEach(ch => { chCount[ch] = (chCount[ch] || 0) + 1 })
      })
      const topKey = Object.keys(chCount).sort((a, b) => chCount[b] - chCount[a])[0]
      return {
        total, ratio,
        latestTitle: latest.title,
        latestTime: this.formatTime(latest.created_at),
        topChannel: topKey ? this.channelLabel(topKey) : '—'
      }
    },
    // chart options for stats
    regionBarOption() {
      const categories = this.regionStats.map(r=>r.area)
      const values = this.regionStats.map(r=>r.cnt)
      const palette = ['#5470C6','#91CC75','#FAC858','#EE6666','#73C0DE','#3BA272']
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { top: 12, bottom: 40, left: 50, right: 16 },
        xAxis: { type: 'category', data: categories, axisLabel: { color: '#555', fontSize: 11, rotate: 20 }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLabel: { color: '#555', fontSize: 11 }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
        series: [{
          type: 'bar', barWidth: 22, barCategoryGap: '35%',
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: palette[i % palette.length] }, { offset: 1, color: palette[i % palette.length] + '88' }]
              },
              borderRadius: [4, 4, 0, 0]
            }
          })),
          label: { show: true, position: 'top', color: '#555', fontSize: 11 }
        }]
      }
    },
    efficiencyDoughnutOption() {
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, textStyle: { color: '#555', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
        series: [{
          name: '处理效率', type: 'pie', radius: ['48%', '70%'], center: ['50%', '44%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
          data: [
            { value: this.efficiencyStats.ontime,      name: '按时完成', itemStyle: { color: { type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#52c41a'},{offset:1,color:'#95de64'}] } } },
            { value: this.efficiencyStats.overdueCount, name: '超时工单', itemStyle: { color: { type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#ff4d4f'},{offset:1,color:'#ff7875'}] } } }
          ]
        }]
      }
    },
    satisfactionOption() {
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['处理前满意度','处理后满意度'], bottom: 0, textStyle: { color: '#555', fontSize: 11 } },
        grid: { top: 16, bottom: 40, left: 44, right: 16 },
        xAxis: { type: 'category', data: this.satisfactionTrend.dates, axisLabel: { color: '#888', fontSize: 10 }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLabel: { color: '#888', fontSize: 10, formatter: '{value}%' }, splitLine: { lineStyle: { color: '#f5f5f5' } }, min: 50, max: 100 },
        series: [
          {
            name: '处理前满意度', type: 'line', smooth: true, symbol: 'none',
            data: this.satisfactionTrend.before,
            lineStyle: { color: '#ff7875', width: 2 },
            areaStyle: { color: { type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(255,120,117,0.3)'},{offset:1,color:'rgba(255,120,117,0)'}] } }
          },
          {
            name: '处理后满意度', type: 'line', smooth: true, symbol: 'none',
            data: this.satisfactionTrend.after,
            lineStyle: { color: '#52c41a', width: 2 },
            areaStyle: { color: { type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(82,196,26,0.3)'},{offset:1,color:'rgba(82,196,26,0)'}] } }
          }
        ]
      }
    },
    wordCloudOptionBefore() {
      return {
        series: [{
          type: 'wordCloud',
          gridSize: 2,
          sizeRange: [12, 50],
          rotationRange: [-90, 90],
          shape: 'circle',
          width: '100%',
          height: '100%',
          textStyle: {
            normal: {
              color: function() {
                const colors = ['#5470C6','#91CC75','#FAC858','#EE6666','#73C0DE','#3BA272','#FC8452','#9A60B4','#E87C25','#BDA29A','#2EC7C9','#FF9F7F','#FFDB5C','#B0A4E3','#6BCE9E','#F78CD8','#5F7C8A','#8DC3A3','#E7BCF3','#4D9078'];
                return colors[Math.floor(Math.random()*colors.length)];
              }
            }
          },
          data: this.satisfactionWords.before
        }]
      }
    },
    wordCloudOptionAfter() {
      return {
        series: [{
          type: 'wordCloud',
          gridSize: 2,
          sizeRange: [12, 50],
          rotationRange: [-90, 90],
          shape: 'circle',
          width: '100%',
          height: '100%',
          textStyle: {
            normal: {
              color: function() {
                const colors = ['#5470C6','#91CC75','#FAC858','#EE6666','#73C0DE','#3BA272','#FC8452','#9A60B4','#E87C25','#BDA29A','#2EC7C9','#FF9F7F','#FFDB5C','#B0A4E3','#6BCE9E','#F78CD8','#5F7C8A','#8DC3A3','#E7BCF3','#4D9078'];
                return colors[Math.floor(Math.random()*colors.length)];
              }
            }
          },
          data: this.satisfactionWords.after
        }]
      }
    },

    feedbackCategories() {
      return [
        { key: 'all',      label: '全部反馈' },
        { key: '设施问题', label: '设施问题' },
        { key: '服务投诉', label: '服务投诉' },
        { key: '环境卫生', label: '环境卫生' },
        { key: '安全隐患', label: '安全隐患' },
        { key: '其他',     label: '其他' }
      ]
    },
    filteredFeedback() {
      if (this.feedbackCategory === 'all') return this.feedbackList
      return this.feedbackList.filter(f => f.category === this.feedbackCategory)
    },
    buildingDamageFeedback() {
      return this.applyFilters(
        this.feedbackList.filter(f => ['设施问题','安全隐患','环境卫生'].includes(f.category))
      )
    },
    suggestionFeedback() {
      return this.applyFilters(
        this.feedbackList.filter(f => ['服务投诉','其他'].includes(f.category))
      )
    },
    // 商户反馈计算属性
    merchantBusinessFeedback() {
      return this.merchantFeedbackList.filter(f => f.category === '经营问题')
    },
    merchantSuggestionFeedback() {
      return this.merchantFeedbackList.filter(f => f.category === '建议')
    },
    // 工作人员反馈计算属性
    staffSafetyFeedback() {
      return this.staffFeedbackList.filter(f => f.category === '安全隐患')
    },
    staffSecurityFeedback() {
      return this.staffFeedbackList.filter(f => f.category === '治安管理')
    },
    currentAreaStaff() {
      if (!this.ticketForm.area) return []
      const area = this.managementAreas.find(a => a.name === this.ticketForm.area)
      return area ? area.staff : []
    },
    ticketStepValid() {
      if (this.ticketStep === 0) return !!this.ticketForm.title.trim()
      if (this.ticketStep === 1) return !!(this.ticketForm.type && this.ticketForm.urgency && this.ticketForm.description.trim() && this.ticketForm.deadline)
      if (this.ticketStep === 2) return !!(this.ticketForm.area && this.ticketForm.assignee)
      return true
    }
  },
  watch: {
    'form.channels'() {
      this.$nextTick(() => this.updateGroupIndeterminate())
    },
    activeMenu(val) {
      if (val === '2-1') {
        this.$nextTick(() => this.initFeedbackCharts())
      } else if (val === '2-2') {
        this.$nextTick(() => this.initMerchantCharts())
      } else if (val === '2-3') {
        this.$nextTick(() => this.initStaffCharts())
      } else if (val === '2-4') {
        this.$nextTick(() => this.initDamageCharts())
      } else if (val === '3-3') {
        this.computeStats()
        this.$nextTick(() => this.initDamageRepairCharts())
      }
    },
    selectedTicket(val) {
      if (val) {
        this.examDescription = '';
        this.examFiles = [];
        this.repairDescription = '';
        this.repairFiles = [];
      }
    },
    trackTickets: {
      handler() {
        if (this.activeMenu === '3-3') this.computeStats()
      },
      deep: true
    }
  },
  mounted() {
    this.fetchAnnouncements()
    this.fetchScenicSpots()
    if (this.activeMenu === '3-3') this.computeStats()
  },
  methods: {
    openDialog() {
      this.editingId = null
      this.form = { title: '', type: '通知', content: '', channels: ['tourist_home'], subtype: '' }
      this.submitMsg = null
      this.dialogVisible = true
      this.$nextTick(() => this.updateGroupIndeterminate())
    },
    openEditDialog(item) {
      this.editingId = item.id
      const typeParts = (item.type || '').split('·')
      this.form = {
        title: item.title,
        type: typeParts[0] || '通知',
        subtype: typeParts[1] || '',
        content: item.content,
        channels: item.channels ? [...item.channels] : []
      }
      this.submitMsg = null
      this.dialogVisible = true
      this.$nextTick(() => this.updateGroupIndeterminate())
    },
    // 创建工单并跳转到工单页面
    goCreateTicket(item) {
      this.ticketStep = 0
      this.ticketSubmitted = false
      this.ticketSubmitting = false
      this.ticketSource = {
        feedbackId: item.id,
        title: item.title,
        count: item.count,
        representative: item.representative,
        impact: item.impact,
        level: item.level,
        lastMinutes: item.lastMinutes
      }
      this.ticketForm = {
        title: item.title,
        type: '设施维修',
        urgency: item.level === 'urgent' ? '紧急' : item.level === 'warning' ? '高' : '中',
        description: '',
        deadline: '',
        area: '',
        assignee: '',
        notes: ''
      }
      this.activeMenu = '3-1'
    },
    urgencyTagType(u) {
      const map = { '紧急': 'danger', '高': 'warning', '中': '', '低': 'success' }
      return map[u] || ''
    },
    statusTagType(s) {
      const map = { '待处理': 'info', '处理中': 'warning', '已完成': 'success', '已关闭': '' }
      return map[s] || 'info'
    },
    // workflow actions for tracking
    confirmReceive() {
      if (this.selectedTicket) {
        this.selectedTicket.status = '待修复'
        this.selectedTicket.receivedAt = this.formatTime(new Date())
      }
    },
    viewProgress() {
      // stub, could show a modal or simply alert
      this.$message.info('当前无进一步进度');
    },
    confirmExamResult() {
      if (!this.examDescription) {
        this.$message.warning('请填写检查描述');
        return;
      }
      this.selectedTicket.status = '待验收';
      // store exam data on ticket
      this.selectedTicket.exam = {
        description: this.examDescription,
        images: this.examFiles.slice()
      };
      this.examDescription = '';
      this.examFiles = [];
    },
    returnForRepair() {
      this.selectedTicket.status = '待修复';
      this.$message.warning('已退回，请重新处理');
    },
    acceptRepair() {
      this.selectedTicket.status = '已完成';
      this.selectedTicket.completedAt = this.formatTime(new Date());
      // store repair info
      this.selectedTicket.repair = {
        description: this.repairDescription,
        images: this.repairFiles.slice()
      };
      this.selectedTicket.finalResult = this.repairDescription;
      // clear repair inputs
      this.repairDescription = '';
      this.repairFiles = [];
    },
    handlePreview(file) {
      window.open(URL.createObjectURL(file.raw || file));
    },
    handleRemoveExam(file, fileList) {
      this.examFiles = fileList;
    },
    handleRemoveRepair(file, fileList) {
      this.repairFiles = fileList;
    },
    changeStep(idx) {
      if (!this.selectedTicket) return;
      const names = this.stepNames;
      if (idx < 1 || idx > names.length) return;
      this.selectedTicket.status = names[idx - 1];
    },
    exportReport() {
      const lines = [];
      // problems
      lines.push('高频问题TOP10');
      lines.push('排名,类型,数量,占比,趋势');
      this.problemTop10.forEach(r=> lines.push(`${r.rank},${r.type},${r.count},${r.ratio},${r.trend}`));
      lines.push('');
      // area
      lines.push('各区域工单统计');
      lines.push('区域,数量');
      this.regionStats.forEach(r=> lines.push(`${r.area},${r.cnt}`));
      lines.push('');
      // efficiency
      lines.push('效率');
      lines.push(`按时,${this.efficiencyStats.ontime}`);
      lines.push(`超时,${this.efficiencyStats.overdueCount}`);
      lines.push(`平均处理时间,${this.efficiencyStats.avgTime}`);
      lines.push('');
      // staff
      lines.push('人员工作量');
      lines.push('排名,姓名,处理数,完成数,超时数,完成率');
      this.staffWorkload.forEach(r=> lines.push(`${r.rank},${r.name},${r.processed},${r.completed},${r.overdue},${r.rate}`));
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'statistics.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    async submitTicket() {
      this.ticketSubmitting = true
      let created = null
      try {
        // attempt to submit to backend; if backend returns created item use it
        const resp = await axios.post('/api/tickets', {
          title: this.ticketForm.title,
          type: this.ticketForm.type,
          urgency: this.ticketForm.urgency,
          description: this.ticketForm.description,
          deadline: this.ticketForm.deadline,
          area: this.ticketForm.area,
          assignee: this.ticketForm.assignee,
          notes: this.ticketForm.notes,
          sourceId: this.ticketSource ? this.ticketSource.feedbackId : null
        })
        created = resp && resp.data ? resp.data : null
      } catch (e) {
        // if backend is not available, still create a local ticket record so it can be tracked
        console.warn('提交工单到后端失败，改为本地创建用于演示', e)
      } finally {
        this.ticketSubmitting = false
        this.ticketSubmitted = true
      }

      // construct ticket object (prefer backend-created data when available)
      const now = new Date()
      const genId = `WO-${now.getFullYear()}-${String(this.trackTickets.length + 1).padStart(3, '0')}`
      const newTicket = {
        id: (created && created.id) || genId,
        title: (created && created.title) || this.ticketForm.title,
        type: (created && created.type) || this.ticketForm.type,
        urgency: (created && created.urgency) || this.ticketForm.urgency,
        area: (created && created.area) || this.ticketForm.area,
        assignee: (created && created.assignee) || this.ticketForm.assignee,
        description: (created && created.description) || this.ticketForm.description,
        deadline: (created && created.deadline) || this.ticketForm.deadline,
        createdAt: (created && created.createdAt) || this.formatTime(now),
        status: (created && created.status) || '待接收',
        receivedAt: '',
        completedAt: '',
        finalResult: '',
        exam: null,
        repair: null,
        steps: []
      }

      // add to track list and open tracking view
      this.trackTickets.unshift(newTicket)
      this.selectedTicket = newTicket
      this.activeMenu = '3-2'
      // open tracking pipeline view so user can immediately follow up
      this.trackView = 'track'
    },
    resetTicket() {
      this.ticketStep = 0
      this.ticketSource = null
      this.ticketSubmitted = false
      this.ticketSubmitting = false
      this.ticketForm = {
        title: '',
        type: '设施维修',
        urgency: '中',
        description: '',
        deadline: '',
        area: '',
        assignee: '',
        notes: ''
      }
    },
    setGroupRef(el, key) {
      if (el) this.groupRefs[key] = el
    },
    updateGroupIndeterminate() {
      this.channelGroups.forEach(group => {
        const el = this.groupRefs[group.key]
        if (el) el.indeterminate = this.groupIndeterminate(group)
      })
    },
    groupAllChecked(group) {
      return group.children.length > 0 && group.children.every(c => this.form.channels.includes(c.key))
    },
    groupIndeterminate(group) {
      const checked = group.children.filter(c => this.form.channels.includes(c.key)).length
      return checked > 0 && checked < group.children.length
    },
    toggleGroup(group, val) {
      const keys = group.children.map(c => c.key)
      if (val) {
        keys.forEach(k => { if (!this.form.channels.includes(k)) this.form.channels.push(k) })
      } else {
        this.form.channels = this.form.channels.filter(k => !keys.includes(k))
      }
    },
    async fetchScenicSpots() {
      try {
        const res = await axios.get('/api/attraction-ranking')
        this.scenicSpots = res.data.ranking || []
      } catch (e) {
        console.error('获取景区列表失败', e)
      }
    },
    async fetchAnnouncements() {
      this.loading = true
      try {
        const res = await axios.get('/api/announcements')
        this.announcements = res.data.announcements || res.data
      } catch (e) {
        console.error('获取公告失败', e)
      } finally {
        this.loading = false
      }
    },
    async submitAnnouncement() {
      if (!this.form.title || !this.form.content || this.form.channels.length === 0) return
      this.submitting = true
      this.submitMsg = null
      const payload = {
        title: this.form.title,
        content: this.form.content,
        type: this.form.type + (this.form.subtype ? `·${this.form.subtype}` : ''),
        channels: this.form.channels
      }
      try {
        if (this.editingId) {
          await axios.put(`/api/announcements/${this.editingId}`, payload)
          this.submitMsg = { type: 'success', text: '公告修改成功！' }
        } else {
          await axios.post('/api/announcements', payload)
          this.submitMsg = { type: 'success', text: '公告发布成功！' }
        }
        await this.fetchAnnouncements()
        setTimeout(() => { this.dialogVisible = false; this.submitMsg = null }, 1200)
      } catch (e) {
        this.submitMsg = { type: 'error', text: this.editingId ? '修改失败，请重试' : '发布失败，请重试' }
      } finally {
        this.submitting = false
      }
    },
    async deleteAnnouncement(id) {
      try {
        await axios.delete(`/api/announcements/${id}`)
        await this.fetchAnnouncements()
      } catch (e) {
        console.error('删除失败', e)
      }
    },
    formatTime(ts) {
      const d = new Date(ts)
      return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
    },
    computeStats() {
      // aggregate problem types
      const typeCount = {}
      const areaCount = {}
      const staff = {}
      let totalTime = 0, countTime = 0, overdueCount = 0
      this.trackTickets.forEach(t => {
        typeCount[t.type] = (typeCount[t.type] || 0) + 1
        areaCount[t.area] = (areaCount[t.area] || 0) + 1
        staff[t.assignee] = staff[t.assignee] || { processed:0, completed:0, overdue:0 }
        staff[t.assignee].processed++
        if (t.status === '已完成') {
          staff[t.assignee].completed++
          if (t.completedAt && t.deadline && new Date(t.completedAt) > new Date(t.deadline)) {
            staff[t.assignee].overdue++
            overdueCount++
          }
          if (t.completedAt && t.createdAt) {
            const diff = (new Date(t.completedAt) - new Date(t.createdAt)) / (1000*60*60)
            totalTime += diff
            countTime++
          }
        }
      })
      // problemTop10
      const entries = Object.entries(typeCount).sort((a,b)=>b[1]-a[1])
      const total = this.trackTickets.length || 1
      this.problemTop10 = entries.map(([type,cnt],i)=>({
        rank:i+1,
        type,
        count:cnt,
        ratio: `${Math.round(cnt/total*100)}%`,
        trend: i<2 ? '上升' : '稳定'
      })).slice(0,10)
      // region stats
      this.regionStats = Object.entries(areaCount).map(([area,cnt])=>({area,cnt}))
      // efficiency
      this.efficiencyStats.ontime = total - overdueCount
      this.efficiencyStats.overdueCount = overdueCount
      this.efficiencyStats.avgTime = countTime ? (totalTime/countTime).toFixed(1) : 0
      // staff workload
      const staffArr = Object.entries(staff).map(([name,vals])=>({
        name,
        processed:vals.processed,
        completed:vals.completed,
        overdue:vals.overdue,
        rate: vals.processed? `${Math.round(vals.completed/vals.processed*100)}%`: '0%'
      }))
      staffArr.sort((a,b)=>b.processed - a.processed)
      this.staffWorkload = staffArr.map((it,i)=>({rank:i+1,...it}))
      // satisfaction trend sample (dummy)
      const days = 30
      const today = new Date()
      this.satisfactionTrend.dates = Array.from({length:days},(_,i)=>{
        const d = new Date(today)
        d.setDate(d.getDate()-days+i)
        return `${d.getMonth()+1}/${d.getDate()}`
      })
      this.satisfactionTrend.before = this.satisfactionTrend.dates.map((_,i)=>Math.round(60+Math.random()*20))
      this.satisfactionTrend.after = this.satisfactionTrend.dates.map((_,i)=>Math.round(70+Math.random()*20))
      // word cloud dummy
      this.satisfactionWords.before = [
        {name:'厕所坏',value:38},{name:'排队长',value:28},{name:'标识不清',value:22},{name:'卫生差',value:18},
        {name:'人手少',value:16},{name:'灯光暗',value:14},{name:'设施旧',value:12},{name:'指示牌少',value:10},
        {name:'垃圾多',value:9},{name:'食物贵',value:8},{name:'交通堵',value:7},{name:'噪音大',value:6}
      ]
      this.satisfactionWords.after = [
        {name:'方便',value:40},{name:'整洁',value:32},{name:'服务好',value:28},{name:'满意',value:24},
        {name:'快速',value:20},{name:'环境优',value:18},{name:'人员多',value:16},{name:'体验佳',value:14},
        {name:'秩序佳',value:12},{name:'设施新',value:10},{name:'价格合理',value:8},{name:'推荐',value:6}
      ]
    },
    initDamageRepairCharts() {
      const ec = this.$echarts
      if (!ec) return

      // 图1: 损伤类型分布 — 玫瑰饼图
      if (this.$refs.chartDmgPie) {
        const pie = ec.init(this.$refs.chartDmgPie)
        pie.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item', formatter: '{b}: {c} 处 ({d}%)' },
          legend: { bottom: 4, textStyle: { color: '#555', fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
          series: [{
            type: 'pie', radius: ['36%', '68%'], center: ['50%', '44%'],
            roseType: 'area',
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
            data: [
              { value: 35, name: '混凝土裂缝', itemStyle: { color: '#ff6b6b' } },
              { value: 28, name: '砖裂缝',     itemStyle: { color: '#ffa94d' } },
              { value: 18, name: '裸露钢筋',   itemStyle: { color: '#ff4d4f' } },
              { value: 14, name: '剥落',       itemStyle: { color: '#74c0fc' } },
              { value: 10, name: '木裂缝',     itemStyle: { color: '#63e6be' } },
              { value: 8,  name: '发霉',       itemStyle: { color: '#a9e34b' } }
            ]
          }]
        })
      }

      // 图2: 各区域损伤热力图
      const areas  = ['东门区', '西门区', '南门区', '北门区', '古城墙区', '主街道区']
      const types  = ['混凝土裂缝', '砖裂缝', '裸露钢筋', '剥落', '木裂缝', '发霉']
      const heatData = [
        [0,0,8],[0,1,5],[0,2,2],[0,3,3],[0,4,1],[0,5,4],
        [1,0,6],[1,1,9],[1,2,1],[1,3,5],[1,4,3],[1,5,2],
        [2,0,4],[2,1,3],[2,2,0],[2,3,2],[2,4,6],[2,5,3],
        [3,0,12],[3,1,7],[3,2,8],[3,3,4],[3,4,2],[3,5,1],
        [4,0,9],[4,1,11],[4,2,6],[4,3,3],[4,4,5],[4,5,2],
        [5,0,5],[5,1,4],[5,2,1],[5,3,6],[5,4,2],[5,5,7]
      ].map(d => [d[1], d[0], d[2]])

      if (this.$refs.chartDmgHeat) {
        const heat = ec.init(this.$refs.chartDmgHeat)
        heat.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            position: 'top',
            formatter: p => `${areas[p.data[1]]} · ${types[p.data[0]]}<br/>损伤数：<b>${p.data[2]}</b>`
          },
          grid: { top: 10, bottom: 60, left: 70, right: 20 },
          xAxis: { type: 'category', data: types, axisLabel: { color: '#555', fontSize: 10, rotate: 20 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#ddd' } } },
          yAxis: { type: 'category', data: areas, axisLabel: { color: '#555', fontSize: 11 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#ddd' } } },
          visualMap: {
            min: 0, max: 12, calculable: true, orient: 'horizontal',
            left: 'center', bottom: 0, itemWidth: 14, itemHeight: 80,
            textStyle: { color: '#555', fontSize: 10 },
            inRange: { color: ['#fff5f5', '#ffb3b3', '#ff4d4f'] }
          },
          series: [{
            type: 'heatmap', data: heatData,
            label: { show: true, color: '#333', fontSize: 11 },
            emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)' } }
          }]
        })
      }

      // 图4: 损伤原因分布 — 横版柱状图
      if (this.$refs.chartDmgCause) {
        const bar = ec.init(this.$refs.chartDmgCause)
        const causes = ['自然风化', '地基沉降', '雨水侵蚀', '人为破坏', '材料老化', '施工缺陷', '地震影响', '植物根系']
        const vals   = [42, 35, 28, 22, 38, 15, 10, 18]
        bar.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c} 处' },
          grid: { top: 8, bottom: 16, left: 80, right: 24 },
          xAxis: { type: 'value', axisLabel: { color: '#555', fontSize: 10 }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
          yAxis: { type: 'category', data: causes, axisLabel: { color: '#444', fontSize: 11 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#ddd' } } },
          series: [{
            type: 'bar', barWidth: 14, barCategoryGap: '30%',
            data: vals.map((v, i) => ({
              value: v,
              itemStyle: {
                color: {
                  type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                  colorStops: [
                    { offset: 0, color: ['#ff6b6b','#ffa94d','#74c0fc','#63e6be','#ff6b6b','#a9e34b','#74c0fc','#ffa94d'][i] },
                    { offset: 1, color: ['#ff4d4f','#fa8c16','#1890ff','#52c41a','#ff4d4f','#7cb305','#1890ff','#fa8c16'][i] }
                  ]
                },
                borderRadius: [0, 4, 4, 0]
              }
            })),
            label: { show: true, position: 'right', color: '#555', fontSize: 10, formatter: '{c}处' }
          }]
        })
      }
    },
    channelLabel(key) {
      const map = { tourist_home: '首页Banner', tourist_notify: '消息通知', social_wechat: '微信公众号', social_douyin: '抖音官方账号' }
      if (map[key]) return map[key]
      if (key.startsWith('scenic_')) return key.replace('scenic_', '')
      return key
    },
    channelColor(key) {
      if (key.startsWith('tourist_')) return 'ch-blue'
      if (key.startsWith('scenic_')) return 'ch-green'
      if (key.startsWith('social_')) return 'ch-orange'
      return ''
    },
    applyFilters(list) {
      let arr = list.slice()
      if (this.feedbackSeverity === 'urgent') {
        arr = arr.filter(f => ['设施问题','安全隐患'].includes(f.category))
      } else if (this.feedbackSeverity === 'normal') {
        arr = arr.filter(f => ['服务投诉','环境卫生'].includes(f.category))
      } else if (this.feedbackSeverity === 'suggestion') {
        arr = arr.filter(f => f.category === '其他')
      }
      if (this.dateRange && this.dateRange.length === 2) {
        const [start, end] = this.dateRange
        arr = arr.filter(f => {
          const d = new Date(f.time)
          return d >= start && d <= end
        })
      }
      return arr
    },
    feedbackCatCount(key) {
      if (key === 'all') return this.feedbackList.length
      return this.feedbackList.filter(f => f.category === key).length
    },
    catTagType(cat) {
      const map = { '设施问题': 'warning', '服务投诉': 'danger', '环境卫生': 'success', '安全隐患': 'danger', '其他': 'info' }
      return map[cat] || 'info'
    },
    sentimentType(s) {
      return s === '正面' ? 'success' : s === '负面' ? 'danger' : 'info'
    },
    // 商户反馈分类标签类型
    merchantCatTagType(cat) {
      const map = { '经营问题': 'warning', '建议': 'success' }
      return map[cat] || 'info'
    },
    // 损伤类型标签
    damageTagType(type) {
      const map = { '混凝土裂缝': 'warning', '砖裂缝': 'danger', '剥落': 'warning', '木裂缝': 'success', '发霉': 'info', '裸露钢筋': 'danger' }
      return map[type] || 'info'
    },
    initFeedbackCharts() {
      const echarts = this.$echarts
      const baseText = { color: '#555', fontSize: 10 }
      const splitLine = { lineStyle: { color: 'rgba(0,0,0,0.07)' } }

      // 问题TOP5 横向柱状图
      if (this.$refs.chartTop5) {
        const c1 = echarts.init(this.$refs.chartTop5)
        c1.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { top: 4, bottom: 16, left: 64, right: 36 },
          xAxis: { type: 'value', axisLabel: baseText, splitLine },
          yAxis: { type: 'category', data: ['标识不清', '排队拥挤', '服务态度', '卫生差', '设施损坏'],
            axisLabel: { ...baseText }, axisTick: { show: false } },
          series: [{ type: 'bar', barWidth: 10,
            data: [18, 24, 31, 38, 52],
            itemStyle: { borderRadius: [0,4,4,0], color: { type:'linear', x:0,y:0,x2:1,y2:0,
              colorStops:[{offset:0,color:'#2a5bac'},{offset:1,color:'#7db2ff'}] } },
            label: { show: true, position: 'right', fontSize: 10, color: '#555' }
          }]
        })
      }

      // 数据概览 渐变柱状图
      if (this.$refs.chartOverview) {
        const c2 = echarts.init(this.$refs.chartOverview)
        c2.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category', data: ['02-20','02-21','02-22','02-23','02-24','02-25','02-26'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'bar', barWidth: 14, barCategoryGap: '30%',
            data: [12,19,15,28,22,35,20],
            itemStyle: { borderRadius: [3,3,0,0], color: { type:'linear', x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'#3b7ad9'},{offset:1,color:'#7db2ff88'}] } }
          }]
        })
      }

      // 损伤检测 折线+面积
      if (this.$refs.chartDamage) {
        const c3 = echarts.init(this.$refs.chartDamage)
        c3.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category',
            data: ['3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
            data: [3,5,4,8,12,9,7,6,10,8,5,7],
            lineStyle: { color: '#fa8c16', width: 2 },
            itemStyle: { color: '#fa8c16' },
            areaStyle: { color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'rgba(250,140,22,0.35)'},{offset:1,color:'rgba(250,140,22,0)'}] } }
          }]
        })
      }

      // 情感分析 环形饼图
      if (this.$refs.chartSentiment) {
        const c4 = echarts.init(this.$refs.chartSentiment)
        const pos = this.feedbackList.filter(f=>f.sentiment==='正面').length
        const neg = this.feedbackList.filter(f=>f.sentiment==='负面').length
        const neu = this.feedbackList.filter(f=>f.sentiment==='中性').length
        c4.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { bottom: 0, textStyle: baseText, itemWidth: 8, itemHeight: 8 },
          series: [{ type: 'pie', radius: ['38%', '62%'], center: ['50%', '42%'],
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
            data: [
              { name:'正面', value:pos, itemStyle:{ color:'#52c41a' } },
              { name:'中性', value:neu, itemStyle:{ color:'#7db2ff' } },
              { name:'负面', value:neg, itemStyle:{ color:'#ff7875' } }
            ]
          }]
        })
      }
    },
    // 商户反馈图表初始化
    initMerchantCharts() {
      const echarts = this.$echarts
      const baseText = { color: '#555', fontSize: 10 }
      const splitLine = { lineStyle: { color: 'rgba(0,0,0,0.07)' } }

      if (this.$refs.chartMerchantOverview) {
        const c1 = echarts.init(this.$refs.chartMerchantOverview)
        c1.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category', data: ['02-20','02-21','02-22','02-23','02-24','02-25','02-26'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'bar', barWidth: 14, barCategoryGap: '30%',
            data: [8,12,10,15,11,18,14],
            itemStyle: { borderRadius: [3,3,0,0], color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'#52c41a'},{offset:1,color:'#95de6488'}] } }
          }]
        })
      }

      if (this.$refs.chartMerchantTop5) {
        const c2 = echarts.init(this.$refs.chartMerchantTop5)
        c2.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { top: 4, bottom: 16, left: 60, right: 36 },
          xAxis: { type: 'value', axisLabel: baseText, splitLine },
          yAxis: { type: 'category', data: ['网络问题','客流不足','租金压力','供电不稳','营销需求'],
            axisLabel: { ...baseText }, axisTick: { show: false } },
          series: [{ type: 'bar', barWidth: 10,
            data: [15,22,18,12,25],
            itemStyle: { borderRadius: [0,4,4,0], color: { type:'linear',x:0,y:0,x2:1,y2:0,
              colorStops:[{offset:0,color:'#52c41a'},{offset:1,color:'#73d13d'}] } },
            label: { show: true, position: 'right', fontSize: 10, color: '#555' }
          }]
        })
      }

      if (this.$refs.chartMerchantDamage) {
        const c3 = echarts.init(this.$refs.chartMerchantDamage)
        c3.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category',
            data: ['3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
            data: [2,3,2,5,7,4,3,4,6,5,3,4],
            lineStyle: { color: '#52c41a', width: 2 }, itemStyle: { color: '#52c41a' },
            areaStyle: { color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'rgba(82,196,26,0.35)'},{offset:1,color:'rgba(82,196,26,0)'}] } }
          }]
        })
      }
    },
    // 工作人员反馈图表初始化
    initStaffCharts() {
      const echarts = this.$echarts
      const baseText = { color: '#555', fontSize: 10 }
      const splitLine = { lineStyle: { color: 'rgba(0,0,0,0.07)' } }

      if (this.$refs.chartStaffOverview) {
        const c1 = echarts.init(this.$refs.chartStaffOverview)
        c1.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category', data: ['02-20','02-21','02-22','02-23','02-24','02-25','02-26'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'bar', barWidth: 14, barCategoryGap: '30%',
            data: [5,8,6,10,7,12,9],
            itemStyle: { borderRadius: [3,3,0,0], color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'#fa8c16'},{offset:1,color:'#ffc06988'}] } }
          }]
        })
      }

      if (this.$refs.chartStaffTop5) {
        const c2 = echarts.init(this.$refs.chartStaffTop5)
        c2.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { top: 4, bottom: 16, left: 60, right: 36 },
          xAxis: { type: 'value', axisLabel: baseText, splitLine },
          yAxis: { type: 'category', data: ['设备故障','人手不足','游客纠纷','环境问题','安全风险'],
            axisLabel: { ...baseText }, axisTick: { show: false } },
          series: [{ type: 'bar', barWidth: 10,
            data: [20,15,10,8,12],
            itemStyle: { borderRadius: [0,4,4,0], color: { type:'linear',x:0,y:0,x2:1,y2:0,
              colorStops:[{offset:0,color:'#fa8c16'},{offset:1,color:'#ffc069'}] } },
            label: { show: true, position: 'right', fontSize: 10, color: '#555' }
          }]
        })
      }

      if (this.$refs.chartStaffDamage) {
        const c3 = echarts.init(this.$refs.chartStaffDamage)
        c3.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category',
            data: ['3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
            data: [1,2,1,3,4,2,2,3,4,3,2,3],
            lineStyle: { color: '#fa8c16', width: 2 }, itemStyle: { color: '#fa8c16' },
            areaStyle: { color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'rgba(250,140,22,0.35)'},{offset:1,color:'rgba(250,140,22,0)'}] } }
          }]
        })
      }
    },
    // 损伤检测图表初始化
    initDamageCharts() {
      const echarts = this.$echarts
      const baseText = { color: '#555', fontSize: 10 }
      const splitLine = { lineStyle: { color: 'rgba(0,0,0,0.07)' } }

      if (this.$refs.chartDamageOverview) {
        const c1 = echarts.init(this.$refs.chartDamageOverview)
        c1.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category', data: ['02-20','02-21','02-22','02-23','02-24','02-25','02-26'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'bar', barWidth: 14, barCategoryGap: '30%',
            data: [3,5,4,7,5,8,6],
            itemStyle: { borderRadius: [3,3,0,0], color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'#f5222d'},{offset:1,color:'#ff787588'}] } }
          }]
        })
      }

      if (this.$refs.chartDamageTop5) {
        const c2 = echarts.init(this.$refs.chartDamageTop5)
        c2.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { top: 4, bottom: 16, left: 68, right: 36 },
          xAxis: { type: 'value', axisLabel: baseText, splitLine },
          yAxis: { type: 'category', data: ['混凝土裂缝','砖裂缝','剥落','裸露钢筋','木裂缝'],
            axisLabel: { ...baseText }, axisTick: { show: false } },
          series: [{ type: 'bar', barWidth: 10,
            data: [35,25,18,15,12],
            itemStyle: { borderRadius: [0,4,4,0], color: { type:'linear',x:0,y:0,x2:1,y2:0,
              colorStops:[{offset:0,color:'#f5222d'},{offset:1,color:'#ff7875'}] } },
            label: { show: true, position: 'right', fontSize: 10, color: '#555' }
          }]
        })
      }

      if (this.$refs.chartDamageTrend) {
        const c3 = echarts.init(this.$refs.chartDamageTrend)
        c3.setOption({
          tooltip: { trigger: 'axis' },
          grid: { top: 8, bottom: 20, left: 28, right: 8 },
          xAxis: { type: 'category',
            data: ['3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月'],
            axisLabel: { ...baseText, fontSize: 9 }, axisTick: { show: false } },
          yAxis: { type: 'value', axisLabel: baseText, splitLine },
          series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 4,
            data: [3,5,4,8,12,9,7,6,10,8,5,7],
            lineStyle: { color: '#f5222d', width: 2 }, itemStyle: { color: '#f5222d' },
            areaStyle: { color: { type:'linear',x:0,y:0,x2:0,y2:1,
              colorStops:[{offset:0,color:'rgba(245,34,45,0.35)'},{offset:1,color:'rgba(245,34,45,0)'}] } }
          }]
        })
      }
    }
  }
}
</script>

<style scoped>
/* 题目和昵称使用楷体加粗，其它保留系统字体 */
.area-title,
.panel-title,
.notice-title,
.fb-name,
.source-title,
.step-panel-title,
.track-breadcrumb .bc-item,
.ticket-step-panel .step-label,
.semibold-heading {
  font-family: 'KaiTi', '楷体', serif !important;
  font-weight: 700 !important;
}
.comm-page { display: flex; height: calc(100vh - 80px); background: #0a1d3a; color: #c8d8f0; }

/* 侧边栏 */
.sidebar { width: 260px; min-width: 260px; background: #0d2347; border-right: 1px solid rgba(42,91,172,0.3); display: flex; flex-direction: column; }
.sidebar-title { padding: 18px 16px 12px; font-size: 16px; font-weight: 600; color: #7db2ff; letter-spacing: 1px; border-bottom: 1px solid rgba(42,91,172,0.3); }
.side-menu { background: transparent !important; border-right: none !important; flex: 1; }
:deep(.el-menu) { background: transparent !important; border-right: none !important; }
:deep(.el-menu-item) { color: #8cafd8 !important; background: transparent !important; height: 44px; line-height: 44px; font-size: 15px; }
:deep(.el-menu-item:hover), :deep(.el-menu-item.is-active) { background: rgba(42,91,172,0.25) !important; color: #7db2ff !important; }
:deep(.el-sub-menu__title) { color: #a8c7ff !important; background: transparent !important; height: 48px; line-height: 48px; }
:deep(.el-sub-menu__title:hover) { background: rgba(255,255,255,0.05) !important; }
:deep(.el-sub-menu .el-menu) { background: rgba(0,0,0,0.15) !important; }
.menu-group-label { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.menu-logo { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.menu-logo img { width: 100%; height: 100%; object-fit: contain; }
.menu-logo-lg { width: 31px; height: 31px; }
.label-blue { color: #7db2ff; }
.label-green { color: #7db2ff; }
.label-orange { color: #7db2ff; }

/* 内容区 */
.content-area { flex: 1; overflow-y: auto; padding: 20px; background: #fff; color: #333; }
.area-header {
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}
.area-title { margin: 0 0 4px; font-size: 26px; color: #7db2ff; }
.area-sub { font-size: 18px; color: #555; }

/* 面板 */
.panel { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
.list-panel { width: 100%; }
.panel-title { font-size: 18px; font-weight: 600; color: #a8c7ff; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

/* 新建按钮 */
.new-btn {
  margin-left: auto;
  padding: 5px 14px;
  background: linear-gradient(90deg, #2a5bac, #3b7ad9);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: opacity 0.2s;
}
.new-btn:hover { opacity: 0.85; }

/* 统计卡片 */
.stats-row { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.stat-card { background: #f0f0f0; border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; min-width: 80px; }
.stat-card.wide { flex: 1; }
.stat-val { font-size: 22px; font-weight: 700; color: #7db2ff; }
.stat-val-sm { font-size: 14px; font-weight: 600; color: #7db2ff; }
.stat-label { font-size: 11px; color: #555; margin-top: 2px; }
.stat-recent { font-size: 13px; color: #333; margin-top: 4px; }
.stat-time { font-size: 11px; color: #555; }

/* 筛选 */
.count-badge { background: rgba(42,91,172,0.3); color: #7db2ff; border-radius: 10px; padding: 1px 8px; font-size: 12px; }
.filter-select { background: #fff; border: 1px solid #ccc; border-radius: 4px; color: #333; padding: 3px 8px; font-size: 12px; outline: none; }

/* 公告列表 */
.tip-text { color: #777; font-size: 13px; padding: 20px 0; text-align: center; }
.notice-list { display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; }
.notice-item { background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 12px; }
.notice-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.type-tag { background: rgba(42,91,172,0.25); color: #7db2ff; border-radius: 4px; padding: 1px 7px; font-size: 11px; white-space: nowrap; }
.notice-title { flex: 1; font-size: 16px; color: #333; font-weight: 500; }
.del-btn { background: none; border: 1px solid rgba(255,77,79,0.4); color: #ff7875; border-radius: 4px; padding: 2px 8px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.del-btn:hover { background: rgba(255,77,79,0.15); }
.edit-btn { margin-right: 6px; }
.notice-content { font-size: 13px; color: #555; line-height: 1.5; margin-bottom: 6px; }
.channel-tags { margin-bottom: 6px; }
.notice-meta { display: flex; justify-content: space-between; font-size: 11px; color: #777; }

/* 渠道标签 */
.ch-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-right: 4px; }
.ch-blue   { background: rgba(59,122,217,0.2);  color: #7db2ff; border: 1px solid rgba(59,122,217,0.4); }
.ch-green  { background: rgba(82,196,26,0.15);  color: #73d13d; border: 1px solid rgba(82,196,26,0.35); }
.ch-orange { background: rgba(250,140,22,0.15); color: #ffa940; border: 1px solid rgba(250,140,22,0.35); }

/* 占位面板 */
.placeholder-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #4a6a8a; }
.ph-icon { width: 60px; height: 60px; border: 2px dashed rgba(42,91,172,0.4); border-radius: 50%; margin-bottom: 16px; }
.ph-title { font-size: 16px; color: #555; margin-bottom: 8px; }
.ph-desc { font-size: 13px; }

/* 弹窗覆盖 */
:deep(.announce-dialog .el-dialog) { background: #0d2347; border: 1px solid rgba(42,91,172,0.4); border-radius: 10px; }
:deep(.announce-dialog .el-dialog__header) { border-bottom: 1px solid rgba(42,91,172,0.3); padding: 16px 20px; }
:deep(.announce-dialog .el-dialog__title) { color: #a8c7ff; font-size: 16px; }
:deep(.announce-dialog .el-dialog__headerbtn .el-dialog__close) { color: #555; }
:deep(.announce-dialog .el-dialog__body) { padding: 20px; }
:deep(.announce-dialog .el-dialog__footer) { border-top: 1px solid rgba(42,91,172,0.3); padding: 12px 20px; }

/* 弹窗内布局 */
.dialog-body { display: flex; gap: 20px; }
.form-side { flex: 1; min-width: 0; }
.preview-side { width: 240px; min-width: 240px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.preview-label { font-size: 13px; color: #555; align-self: flex-start; }

/* 表单 */
.form-body { display: flex; flex-direction: column; gap: 12px; }
.form-item { display: flex; flex-direction: column; gap: 4px; }
.form-item label { font-size: 12px; color: #555; }
.input { background: #fff; border: 1px solid #ccc; border-radius: 4px; color: #333; padding: 7px 10px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: #3b7ad9; }
.textarea { resize: vertical; min-height: 80px; }
.char-count { font-size: 11px; color: #4a6a8a; text-align: right; }
.warn-tip { font-size: 11px; color: #ff7875; }
.submit-msg { font-size: 13px; padding: 6px 0; }
.submit-msg.success { color: #52c41a; }
.submit-msg.error { color: #ff7875; }

/* 层级渠道选择 */
.channel-groups { display: flex; flex-direction: column; gap: 10px; }
.ch-group { background: rgba(255,255,255,0.03); border: 1px solid rgba(42,91,172,0.2); border-radius: 6px; padding: 8px 10px; }
.ch-group-header { display: flex; align-items: center; gap: 6px; cursor: pointer; margin-bottom: 6px; }
.ch-group-header input[type=checkbox] { accent-color: #3b7ad9; width: 14px; height: 14px; cursor: pointer; }
.ch-children { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 20px; }
.ch-child { display: flex; align-items: center; gap: 4px; cursor: pointer; }
.ch-child input[type=checkbox] { accent-color: #3b7ad9; width: 13px; height: 13px; cursor: pointer; }
.ch-child-label { font-size: 12px; color: #555; }

/* 弹窗底部按钮 */
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }
.cancel-btn { padding: 8px 18px; background: #fff; border: 1px solid #ccc; color: #333; border-radius: 4px; cursor: pointer; font-size: 13px; }
.cancel-btn:hover { background: rgba(255,255,255,0.1); }
.submit-btn { padding: 8px 18px; background: linear-gradient(90deg, #2a5bac, #3b7ad9); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: opacity 0.2s; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 手机预览框 */
.phone-frame {
  width: 220px;
  min-height: 360px;
  background: #0a1628;
  border: 2px solid rgba(42,91,172,0.5);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 0 20px rgba(42,91,172,0.2);
}
.phone-status {
  background: linear-gradient(90deg, #7a3b00, #c26a00, #e8a020);
  color: #fff3d6;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  padding: 10px 0 8px;
  border-bottom: 1px solid rgba(200,120,0,0.4);
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.preview-banner {
  background: linear-gradient(135deg, #1a3a6e, #0d2347);
  border-bottom: 1px solid rgba(42,91,172,0.3);
  padding: 12px;
}
.preview-banner-type { font-size: 10px; color: #ffa940; background: rgba(250,140,22,0.15); border-radius: 3px; padding: 1px 6px; display: inline-block; margin-bottom: 4px; }
.preview-banner-title { font-size: 13px; color: #333; font-weight: 600; margin-bottom: 4px; word-break: break-all; }
.preview-banner-content { font-size: 11px; color: #555; line-height: 1.4; word-break: break-all; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.preview-banner-empty { padding: 16px 12px; text-align: center; font-size: 11px; color: rgba(106,138,170,0.5); border-bottom: 1px dashed rgba(42,91,172,0.2); }
.preview-notify { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(42,91,172,0.2); background: rgba(59,122,217,0.08); }
.preview-notify-icon { font-size: 16px; flex-shrink: 0; }
.preview-notify-body { flex: 1; min-width: 0; }
.preview-notify-title { font-size: 12px; color: #333; font-weight: 600; margin-bottom: 2px; }
.preview-notify-text { font-size: 11px; color: #555; word-break: break-all; }
.preview-scenic { padding: 8px 12px; border-bottom: 1px solid rgba(42,91,172,0.2); }
.preview-scenic-label { font-size: 10px; color: #555; margin-bottom: 4px; }
.preview-scenic-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.preview-scenic-tag { font-size: 10px; background: rgba(82,196,26,0.12); color: #73d13d; border: 1px solid rgba(82,196,26,0.3); border-radius: 3px; padding: 1px 5px; }
.preview-social { padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.preview-social-label { font-size: 10px; color: #555; width: 100%; margin-bottom: 2px; }
.preview-social-tag { font-size: 10px; background: rgba(250,140,22,0.12); color: #ffa940; border: 1px solid rgba(250,140,22,0.3); border-radius: 3px; padding: 1px 5px; }
.preview-hint { font-size: 11px; color: #4a6a8a; text-align: center; }

/* 背景图切换器 */
.bg-picker { display: flex; align-items: center; gap: 8px; align-self: stretch; margin-bottom: 2px; }
.bg-picker-label { font-size: 11px; color: #888; flex-shrink: 0; }
.bg-picker-list { display: flex; gap: 6px; }
.bg-thumb {
  width: 40px; height: 26px;
  border-radius: 5px;
  border: 2px solid #ddd;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, transform 0.15s;
}
.bg-thumb:hover { transform: scale(1.08); border-color: #7db2ff; }
.bg-thumb-active { border-color: #2a5bac; box-shadow: 0 0 0 2px rgba(42,91,172,0.35); }
.bg-thumb-check {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  color: #fff;
  background: rgba(42,91,172,0.45);
  border-radius: 3px;
}

/* 背景图模式下 phone-frame 内容适配 */
.preview-banner-glass {
  background: rgba(10, 22, 40, 0.55) !important;
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(255,255,255,0.15) !important;
}
.preview-banner-glass .preview-banner-title { color: #fff !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.preview-banner-glass .preview-banner-content { color: rgba(255,255,255,0.85) !important; }

/* 游客反馈模块 */
/* make sure the feedback pane always spans the full width and uses box-sizing to avoid unexpected shifts */
.fb-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 160px);
  width: 100%;
  box-sizing: border-box;    /* prevent padding from pushing content sideways */
  overflow-x: hidden;        /* no horizontal shift */
}
/* controls area above the list */
.fb-controls { display: flex; align-items: center; margin-bottom: 12px; }
/* severity segmented buttons */
.severity-group .el-radio-button { border: 1px solid #ccc; margin-right: 4px; }
.severity-group .el-radio-button:not(.is-active) { background: #f5f5f5; color: #666; }
.seg-all.is-active { background: #1890ff; color: #fff; }
.seg-urgent.is-active { background: #f5222d; color: #fff; }
.seg-normal.is-active { background: #faad14; color: #fff; }
.seg-suggestion.is-active { background: #52c41a; color: #fff; }

/* main section layout */
.fb-main {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: stretch;
}
.fb-section { flex: 1; display: flex; flex-direction: column; }
.fb-section-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #7db2ff; }

.fb-cats { width: 150px; min-width: 150px; background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 8px 0; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.fb-cat-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; cursor: pointer; border-radius: 4px; margin: 0 6px; transition: background 0.15s; }
.fb-cat-item:hover { background: rgba(42,91,172,0.15); }
.fb-cat-item.active { background: rgba(42,91,172,0.3); }
.fb-cat-item.active .fb-cat-label { color: #7db2ff; }
.fb-cat-label { font-size: 16px; color: #333; }
.fb-cat-count { background: rgba(42,91,172,0.35); color: #7db2ff; border-radius: 10px; padding: 2px 10px; font-size: 14px; min-width: 24px; text-align: center; }

.fb-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;              /* reset any stray margins */
  padding: 0;             /* ensure cards align at left edge */
  box-sizing: border-box; /* full-width calculation */
}
.fb-section .fb-list { flex: 1; }
.fb-card { display: flex; gap: 10px; background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 12px; transition: border-color 0.15s; }
.fb-card:hover { border-color: rgba(42,91,172,0.45); }
.fb-avatar { width: 44px; height: 44px; min-width: 44px; border-radius: 50%; background: linear-gradient(135deg, #2a5bac, #3b7ad9); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; font-weight: 600; overflow: hidden; }
.fb-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
.fb-avatar.merchant { background: linear-gradient(135deg, #52c41a, #73d13d); }
.fb-avatar.staff { background: linear-gradient(135deg, #fa8c16, #ffc069); }
.fb-avatar.damage { background: linear-gradient(135deg, #f5222d, #ff7875); }
.fb-body { flex: 1; min-width: 0; }
.fb-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.fb-name { font-size: 20px; color: #333; font-weight: 600; } /* enlarged for better readability */
.fb-tag { font-size: 13px !important; padding: 0 8px !important; height: 22px !important; line-height: 22px !important; }
.fb-content { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 6px; }
.fb-time { font-size: 14px; color: #777; }

.fb-charts {
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 100%;
}
.fb-chart-block {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  height: 180px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.fb-chart-title {
  font-size: 12px;
  color: #7db2ff;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.fb-chart-canvas { flex: 1; min-height: 0; }

/* 聚合反馈列表样式 */
.aggregated-feedback-section {
  border: 1px solid #e5e5e5;
  padding: 16px 24px;
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 14px;
  font-size: 18px;
  color: #333;
}
.aggregate-card {
  border: 1px solid #e5e5e5;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 6px;
  transition: all 0.3s;
}
.aggregate-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.aggregate-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}
.dot.urgent { background: #ff4d4f; }
.dot.warning { background: #faad14; }
.dot.normal { background: #52c41a; }
.title-line {
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.title-text {
  font-weight: 600;
  color: #333;
}
.title-meta {
  color: #999;
  font-size: 14px;
}
.aggregate-body {
  margin-top: 10px;
  color: #555;
  font-size: 15px;
}
.aggregate-body div {
  margin-bottom: 6px;
}
.aggregate-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ===== 工单创建与分派 ===== */
.ticket-steps-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 24px 40px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.ticket-body {
  background: #fff;
  border-radius: 8px;
  padding: 28px 40px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  min-height: 320px;
  width: 100%; /* ensure body spans full container */
  box-sizing: border-box;
}

/* ===== 工单统计模块通用 ===== */
.sm-section {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}
.sm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
}
.sm-section-blue .sm-header  { background: linear-gradient(135deg, #1d3557 0%, #2a5bac 60%, #3b7ad9 100%); }
.sm-section-teal .sm-header  { background: linear-gradient(135deg, #134e4a 0%, #0d9488 60%, #14b8a6 100%); }
.sm-header-left { display: flex; align-items: center; gap: 14px; }
.sm-icon { font-size: 30px; line-height: 1; }
.sm-icon-img { width: 100px; height: 100px; object-fit: contain; flex-shrink: 0; }
.sm-title { font-size: 20px; font-weight: 700; color: #e8f4ff; letter-spacing: 0.5px; }
.sm-sub   { font-size: 15px; color: rgba(255,255,255,0.65); margin-top: 4px; }

/* KPI 行 */
.sm-kpi-row { display: flex; gap: 24px; }
.sm-kpi { text-align: center; }
.sm-kpi-val { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
.sm-kpi-green  { color: #6ee7b7; }
.sm-kpi-orange { color: #fcd34d; }
.sm-kpi-red    { color: #fca5a5; }
.sm-kpi-label  { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 6px; }

/* 网格 */
.sm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 16px;
  background: #f4f7fb;
}
.sm-section-teal .sm-grid { background: #f0fdf9; }
.sm-grid-full { grid-template-columns: 1fr 1fr; }

/* 卡片 */
.sm-card {
  border-radius: 10px !important;
  border: 1px solid #e6eaf2 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
}
.sm-section-teal .sm-card { border-color: #ccfbf1 !important; }
.sm-card-header {
  display: flex; align-items: center; gap: 10px;
  font-size: 17px; font-weight: 600; color: #1a1a2e;
}
.sm-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sm-dot-purple { background: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
.sm-dot-blue   { background: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.2); }
.sm-dot-cyan   { background: #0891b2; box-shadow: 0 0 0 3px rgba(8,145,178,0.2); }
.sm-dot-orange { background: #ea580c; box-shadow: 0 0 0 3px rgba(234,88,12,0.2); }
.sm-dot-teal   { background: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.2); }
.sm-dot-pink   { background: #db2777; box-shadow: 0 0 0 3px rgba(219,39,119,0.2); }

/* 排名徽章 */
.sm-rank {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  font-size: 14px; font-weight: 700;
  background: #e8e8e8; color: #666;
}
.sm-rank-hot { background: linear-gradient(135deg, #ff4d4f, #ff7a45); color: #fff; }

/* 表格 */
.sm-table :deep(.el-table__header-wrapper th) { background: #f0f5ff !important; color: #2a5bac; font-weight: 600; }
.sm-section-teal .sm-table :deep(.el-table__header-wrapper th) { background: #f0fdf9 !important; color: #0d9488; }
.sm-table :deep(.el-table__row:hover td) { background: #f5f8ff !important; }

/* 处理效率统计行 */
.eff-stats { display: flex; justify-content: space-around; padding: 14px 0 6px; border-top: 1px solid #f0f0f0; margin-top: 10px; }
.eff-stat-item { text-align: center; }
.eff-stat-val   { font-size: 26px; font-weight: 800; line-height: 1; }
.eff-stat-label { font-size: 14px; color: #888; margin-top: 6px; }

/* 词云对比 */
.wc-wrap { display: flex; gap: 0; align-items: stretch; }
.wc-col  { flex: 1; display: flex; flex-direction: column; align-items: center; }
.wc-divider { width: 1px; background: #e8e8e8; margin: 0 8px; }
.wc-label { font-size: 15px; font-weight: 600; padding: 6px 18px; border-radius: 20px; margin-bottom: 8px; }
.wc-label-red   { background: rgba(255,77,79,0.1);  color: #ff4d4f; border: 1px solid rgba(255,77,79,0.3); }
.wc-label-green { background: rgba(82,196,26,0.1);  color: #52c41a; border: 1px solid rgba(82,196,26,0.3); }

.ticket-step-panel {
  /* allow panel to expand with screen and fill available space */
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px; /* some horizontal breathing room on large screens */
  box-sizing: border-box;
}
.step-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.step-form-item {
  margin-bottom: 24px;
}
.step-form-item.half {
  flex: 1;
}
.step-form-row {
  display: flex;
  gap: 28px;
  margin-bottom: 0;
}
.step-label {
  display: block;
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
  font-weight: 600;
}
.required {
  color: #f5222d;
  margin-left: 2px;
}
/* 来源反馈卡片 */
.source-feedback-card {
  background: #f8faff;
  border: 1px solid #d6e4ff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 24px;
}
.source-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.source-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a2e;
  flex: 1;
}
.source-meta {
  display: flex;
  gap: 24px;
  font-size: 15px;
  color: #666;
  margin-bottom: 10px;
}
.source-meta b {
  color: #1a1a2e;
}
.source-rep {
  font-size: 15px;
  color: #888;
  font-style: italic;
}
.no-source-tip {
  margin-bottom: 24px;
}
/* 紧急程度 */
.urgency-group {
  display: flex;
}
/* 分派人员卡片 */
.assignee-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.assignee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.assignee-info {
  flex: 1;
}
.assignee-name {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a2e;
}
.assignee-area {
  font-size: 15px;
  color: #888;
  margin-top: 4px;
}
/* 确认卡片 */
.confirm-card {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
}
.confirm-row {
  display: flex;
  align-items: flex-start;
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f5;
  gap: 20px;
}
.confirm-row:last-child {
  border-bottom: none;
}
.confirm-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 16px;
  color: #888;
  padding-top: 4px;
}
.confirm-value {
  font-size: 16px;
  color: #1a1a2e;
  flex: 1;
}
.confirm-value.desc {
  line-height: 1.6;
  color: #555;
}
/* 成功结果 */
.submit-success {
  padding: 20px 0;
}
/* 底部导航 */
.ticket-nav {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px 40px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
/* 工单流程追踪 */
.track-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 17px; }
.bc-item { color: #333; }
.bc-cur { font-weight: 600; color: #7db2ff; }
.bc-link { color: #888; cursor: pointer; transition: color 0.2s; }
.bc-link:hover { color: #7db2ff; }
.bc-sep { color: #aaa; font-size: 20px; line-height: 1; }
.track-list { display: flex; flex-direction: column; gap: 12px; }
.track-item { border: 1px solid #eee; border-radius: 8px; padding: 16px 20px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
.track-item:hover { border-color: #7db2ff; box-shadow: 0 2px 8px rgba(42,91,172,0.1); }
.track-item-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.track-item-title { flex: 1; font-size: 17px; color: #333; font-weight: 600; }
.track-item-meta { display: flex; gap: 20px; font-size: 15px; color: #888; }
/* 时间轴 */
.track-timeline { padding: 8px 0 0; }

.track-step-content {
  background: #fff;
  border-radius: 10px;
  padding: 28px 48px;
  margin-top: 20px;
  min-height: 240px;
}
.track-step-content .step-panel {
  max-width: 600px;
  margin: 0 auto;
}
.track-step-content .step-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 16px;
}
.track-step-content .step-text {
  margin-bottom: 16px;
  font-size: 15px;
}
.track-step-content .step-btns { display: flex; gap: 14px; }
.track-step-content .step-section { margin-bottom: 16px; }
.track-step-content .image-preview { display: flex; flex-wrap: wrap; margin-top: 8px; }
.track-step-content .image-preview .el-image { cursor: pointer; }


.tl-item { display: flex; gap: 14px; }
.tl-dot-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 18px; }
.tl-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; }
.tl-done .tl-dot { background: #52c41a; box-shadow: 0 0 0 3px rgba(82,196,26,0.2); }
.tl-pending .tl-dot { background: #fff; border: 2px solid #d9d9d9; }
.tl-line { flex: 1; width: 2px; background: #e8e8e8; min-height: 28px; margin: 6px 0; }
.tl-done .tl-line { background: #52c41a; }
.tl-content { flex: 1; padding-bottom: 24px; }
.tl-item:last-child .tl-content { padding-bottom: 0; }
.tl-label { font-size: 17px; font-weight: 600; }
.tl-done .tl-label { color: #1a1a2e; }
.tl-pending .tl-label { color: #bbb; }
.tl-meta { font-size: 15px; color: #888; margin-top: 5px; }
.tl-note { font-size: 12px; color: #555; margin-top: 4px; background: #f9f9f9; border-radius: 4px; padding: 4px 8px; }
.tl-pending-text { font-size: 12px; color: #bbb; margin-top: 3px; }

/* ===== 古建损伤修复统计分析 ===== */
.dr-section {
  margin-top: 28px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}
.dr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.dr-header-left { display: flex; align-items: center; gap: 14px; }
.dr-header-icon { font-size: 28px; line-height: 1; }
.dr-header-title { font-size: 17px; font-weight: 700; color: #e8f4ff; letter-spacing: 1px; }
.dr-header-sub { font-size: 12px; color: #7db2ff; margin-top: 3px; }
.dr-header-badges { display: flex; gap: 8px; }
.dr-badge {
  padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.dr-badge-red    { background: rgba(255,77,79,0.2);  color: #ff7875; border: 1px solid rgba(255,77,79,0.4); }
.dr-badge-orange { background: rgba(250,140,22,0.2); color: #ffa940; border: 1px solid rgba(250,140,22,0.4); }
.dr-badge-green  { background: rgba(82,196,26,0.2);  color: #73d13d; border: 1px solid rgba(82,196,26,0.4); }

.dr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: #f4f7fb;
  padding: 20px;
  gap: 16px;
}
.dr-card {
  border-radius: 10px !important;
  border: 1px solid #e6eaf2 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
  overflow: hidden;
}
.dr-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.dr-card-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.dot-blue   { background: #1890ff; box-shadow: 0 0 0 3px rgba(24,144,255,0.2); }
.dot-orange { background: #fa8c16; box-shadow: 0 0 0 3px rgba(250,140,22,0.2); }
.dot-red    { background: #ff4d4f; box-shadow: 0 0 0 3px rgba(255,77,79,0.2); }
.dot-green  { background: #52c41a; box-shadow: 0 0 0 3px rgba(82,196,26,0.2); }

.dr-chart-box { height: 260px; width: 100%; }

/* TOP10 列表 */
.dr-top10 { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
.dr-top10-row {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px; border-radius: 6px; transition: background 0.2s;
}
.dr-top10-row:hover { background: #f0f5ff; }
.dr-rank {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: #e8e8e8; color: #666;
}
.dr-rank-hot { background: linear-gradient(135deg, #ff4d4f, #ff7a45); color: #fff; }
.dr-top10-info { display: flex; flex-direction: column; width: 110px; flex-shrink: 0; }
.dr-top10-loc  { font-size: 13px; color: #1a1a2e; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dr-top10-type { font-size: 11px; color: #888; margin-top: 1px; }
.dr-top10-bar-wrap { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.dr-top10-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.dr-top10-cnt { width: 28px; text-align: right; font-size: 13px; font-weight: 600; color: #555; flex-shrink: 0; }
</style>

