<script setup lang="ts">
import { computed, ref } from 'vue'
import { marketMeta, marketRows } from '../data/market'
import { vendorMap } from '../data/vendors'

const mode = ref<'single' | 'vendor'>('single')
const metric = ref<'revenue' | 'change'>('revenue')

const maxRevenue = computed(() => Math.max(...marketRows.map((r) => r.revenue)))

const single = computed(() => {
  const rows = [...marketRows]
  if (metric.value === 'change') rows.sort((a, b) => b.change - a.change)
  return rows
})

const vendorAgg = computed(() => {
  const m = new Map<string, { vendorId: string; total: number; titles: string[] }>()
  for (const r of marketRows) {
    const cur = m.get(r.vendorId) ?? { vendorId: r.vendorId, total: 0, titles: [] }
    cur.total += r.revenue
    cur.titles.push(r.game)
    m.set(r.vendorId, cur)
  }
  return [...m.values()].sort((a, b) => b.total - a.total)
})

const maxVendor = computed(() => Math.max(...vendorAgg.value.map((v) => v.total)))

const totalRevenue = computed(() => marketRows.reduce((s, r) => s + r.revenue, 0))

function fmt(n: number): string {
  return n >= 10000 ? (n / 10000).toFixed(2) + ' 亿' : n.toLocaleString('zh-CN') + ' 万'
}

function changeClass(c: number) {
  return c > 0 ? 'up' : c < 0 ? 'down' : 'flat'
}

function changeText(c: number) {
  return (c > 0 ? '+' : '') + c.toFixed(1) + '%'
}
</script>

<template>
  <div>
    <section class="section-head">
      <h2>市场表现</h2>
      <p class="sub">
        {{ marketMeta.period }} · {{ marketMeta.scope }}二次元手游流水估算，单位{{ marketMeta.unit }}。
        来源：{{ marketMeta.source }}。
      </p>
    </section>

    <div class="callout warn caveat">
      <strong>读数前必看：</strong>{{ marketMeta.caveat }}
    </div>

    <div class="kpis">
      <div class="panel kpi">
        <span class="kpi-l">榜单合计流水</span>
        <strong class="kpi-v">{{ fmt(totalRevenue) }}</strong>
        <span class="kpi-n">Top {{ marketRows.length }} 之和 · 仅 iOS</span>
      </div>
      <div class="panel kpi">
        <span class="kpi-l">环比涨幅最高</span>
        <strong class="kpi-v up">+156.0%</strong>
        <span class="kpi-n">时空中的绘旅人 · 网易</span>
      </div>
      <div class="panel kpi">
        <span class="kpi-l">环比跌幅最深</span>
        <strong class="kpi-v down">−68.6%</strong>
        <span class="kpi-n">光与夜之恋 · 腾讯</span>
      </div>
      <div class="panel kpi">
        <span class="kpi-l">新品进榜</span>
        <strong class="kpi-v">终末地</strong>
        <span class="kpi-n">第 8 名 · 环比 +45.5%</span>
      </div>
    </div>

    <div class="switch-row">
      <div class="seg">
        <button :class="{ on: mode === 'single' }" @click="mode = 'single'">单品榜</button>
        <button :class="{ on: mode === 'vendor' }" @click="mode = 'vendor'">厂商合计</button>
      </div>
      <div v-if="mode === 'single'" class="seg">
        <button :class="{ on: metric === 'revenue' }" @click="metric = 'revenue'">按流水</button>
        <button :class="{ on: metric === 'change' }" @click="metric = 'change'">按环比</button>
      </div>
    </div>

    <div v-if="mode === 'single'" class="panel chart">
      <div v-for="r in single" :key="r.game" class="bar-row">
        <span class="b-rank" :class="{ top: r.rank <= 3 }">{{ r.rank }}</span>
        <span class="b-name">
          {{ r.game }}
          <em class="b-vendor">{{ vendorMap[r.vendorId]?.name }}</em>
        </span>
        <span class="b-track">
          <span
            class="b-fill"
            :style="{
              width: (metric === 'revenue' ? (r.revenue / maxRevenue) * 100 : Math.min(Math.abs(r.change) / 160, 1) * 100) + '%',
              background: metric === 'revenue' ? vendorMap[r.vendorId]?.color : r.change > 0 ? '#42b883' : '#e05c5c',
            }"
          ></span>
        </span>
        <span class="b-val">{{ metric === 'revenue' ? fmt(r.revenue) : changeText(r.change) }}</span>
        <span v-if="metric === 'revenue'" class="b-chg" :class="changeClass(r.change)">
          {{ changeText(r.change) }}
        </span>
      </div>
    </div>

    <div v-else class="panel chart">
      <div v-for="(v, i) in vendorAgg" :key="v.vendorId" class="bar-row">
        <span class="b-rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
        <span class="b-name">
          {{ vendorMap[v.vendorId]?.name }}
          <em class="b-vendor">{{ v.titles.join('、') }}</em>
        </span>
        <span class="b-track">
          <span
            class="b-fill"
            :style="{
              width: (v.total / maxVendor) * 100 + '%',
              background: vendorMap[v.vendorId]?.color,
            }"
          ></span>
        </span>
        <span class="b-val">{{ fmt(v.total) }}</span>
        <span class="b-chg flat">{{ v.titles.length }} 款</span>
      </div>
      <p class="chart-note">
        厂商合计仅累加本榜单内产品，未收录该厂商全部作品，不代表厂商总营收。
      </p>
    </div>

    <section class="section-head gap">
      <h2>结构性观察</h2>
    </section>
    <div class="obs-grid">
      <article class="panel obs">
        <h3>头部稳、腰部波动大</h3>
        <p>
          火影忍者、原神、阴阳师构成稳定第一阵营；腰部产品受版本与活动周期影响剧烈，
          绝区零单月环比 −63.1%、光与夜之恋 −68.6%，而时空中的绘旅人 +156%、碧蓝航线 +103.3%。
        </p>
      </article>
      <article class="panel obs">
        <h3>老产品的版本爆发力</h3>
        <p>
          阴阳师（2016）、碧蓝航线（2017）、崩坏 3（2016）运营近十年仍能在活动节点冲回高位，
          说明二次元赛道的长线运营与 IP 情感沉淀比首发爆发更决定生命周期。
        </p>
      </article>
      <article class="panel obs">
        <h3>新品与续作驱动增量</h3>
        <p>
          明日方舟：终末地环比 +45.5% 进入前八，是 2026 年最成功的 IP 续作；
          以闪亮之名 +39.7%、如鸢 +75.4% 显示女性向仍是增长最确定的细分。
        </p>
      </article>
      <article class="panel obs">
        <h3>口径差异必须警惕</h3>
        <p>
          同期 Sensor Tower 全球口径下原神 2026 上半年流水约 127 亿元、星穹铁道约 53.6 亿元，
          与国内 iOS 单月榜完全不是一个量级。跨榜比较排名会得出错误结论。
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.caveat {
  margin-bottom: 22px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.kpi {
  padding: 16px 18px;
  display: grid;
  gap: 4px;
}

.kpi-l {
  font-size: 12px;
  color: var(--c-text-3);
}

.kpi-v {
  font-size: 23px;
  font-weight: 700;
  color: var(--c-text-1);
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

.kpi-v.up {
  color: #2f9e6e;
}

.kpi-v.down {
  color: #c94f4f;
}

html.dark .kpi-v.up {
  color: #6ee7a8;
}

html.dark .kpi-v.down {
  color: #f09a9a;
}

.kpi-n {
  font-size: 11.5px;
  color: var(--c-text-3);
}

.switch-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.seg {
  display: inline-flex;
  padding: 3px;
  gap: 3px;
  background: var(--c-bg-mute);
  border-radius: 999px;
}

.seg button {
  padding: 5px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 550;
  color: var(--c-text-2);
  transition: all 0.16s;
}

.seg button.on {
  background: var(--c-bg-elv);
  color: var(--c-brand);
  box-shadow: var(--c-shadow);
}

.chart {
  padding: 10px 22px 18px;
}

.bar-row {
  display: grid;
  grid-template-columns: 30px 210px minmax(0, 1fr) 82px 74px;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--c-border-soft);
}

.bar-row:last-of-type {
  border-bottom: none;
}

.b-rank {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--c-text-3);
  text-align: center;
}

.b-rank.top {
  color: #fff;
  background: var(--c-brand);
  border-radius: 6px;
  padding: 1px 0;
  font-weight: 650;
}

html.dark .b-rank.top {
  color: #12301f;
}

.b-name {
  font-size: 13.2px;
  font-weight: 550;
  color: var(--c-text-1);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.b-vendor {
  display: block;
  font-style: normal;
  font-size: 11px;
  color: var(--c-text-3);
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-track {
  height: 12px;
  background: var(--c-bg-mute);
  border-radius: 6px;
  overflow: hidden;
}

.b-fill {
  display: block;
  height: 100%;
  border-radius: 6px;
  transition: width 0.45s ease;
  min-width: 3px;
}

.b-val {
  text-align: right;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--c-text-1);
  font-variant-numeric: tabular-nums;
}

.b-chg {
  text-align: right;
  font-family: var(--font-mono);
  font-size: 11.5px;
}

.b-chg.up {
  color: #2f9e6e;
}

.b-chg.down {
  color: #c94f4f;
}

.b-chg.flat {
  color: var(--c-text-3);
}

html.dark .b-chg.up {
  color: #6ee7a8;
}

html.dark .b-chg.down {
  color: #f09a9a;
}

.chart-note {
  margin-top: 14px;
  font-size: 12px;
  color: var(--c-text-3);
}

.gap {
  margin-top: 44px;
}

.obs-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.obs {
  padding: 20px 22px;
}

.obs h3 {
  font-size: 15px;
  margin-bottom: 9px;
}

.obs p {
  font-size: 13.2px;
  color: var(--c-text-2);
  line-height: 1.85;
}

@media (max-width: 900px) {
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bar-row {
    grid-template-columns: 26px minmax(0, 1fr) 74px;
    gap: 8px;
  }

  .b-track {
    grid-column: 1 / -1;
    order: 5;
    height: 8px;
  }

  .b-chg {
    display: none;
  }

  .obs-grid {
    grid-template-columns: 1fr;
  }
}
</style>