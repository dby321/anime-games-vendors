<script setup lang="ts">
import type { TabId } from '../data/types'

defineProps<{
  stats: { vendors: number; games: number; live: number; upcoming: number }
}>()

const emit = defineEmits<{ go: [tab: TabId] }>()
</script>

<template>
  <section class="hero">
    <div class="shell hero-inner">
      <span class="eyebrow">数据截至 2026 年 11 月 · 公开资料整理</span>
      <h1>
        国内<span class="grad">二次元游戏</span>厂商<br />
        与产品全景对比
      </h1>
      <p class="lead">
        从米哈游、鹰角、库洛、叠纸四大垂类头部，到腾讯、网易、B 站、完美世界的大厂业务线，
        再到深蓝互动、散爆、蛮啾等差异化中坚 —— 一份可筛选、可排序、可并排对比的赛道图谱。
      </p>

      <div class="stat-row">
        <div v-for="s in [
          { n: stats.vendors, l: '收录厂商', u: '家' },
          { n: stats.games, l: '收录产品', u: '款' },
          { n: stats.live, l: '运营中', u: '款' },
          { n: stats.upcoming, l: '即将上线 / 在研', u: '款' },
        ]" :key="s.l" class="stat">
          <div class="stat-n">{{ s.n }}<small>{{ s.u }}</small></div>
          <div class="stat-l">{{ s.l }}</div>
        </div>
      </div>

      <div class="cta">
        <button class="btn btn-brand" @click="emit('go', 'games')">进入产品对比表 →</button>
        <button class="btn" @click="emit('go', 'calendar')">查看跨年新品日历</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 56px 0 48px;
  margin-top: -32px;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--c-border);
  background:
    radial-gradient(900px 380px at 12% -10%, var(--c-brand-dim), transparent 65%),
    radial-gradient(700px 340px at 88% 0%, rgba(53, 73, 94, 0.09), transparent 60%),
    var(--c-bg-soft);
  overflow: hidden;
}

.hero-inner {
  position: relative;
}

.eyebrow {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-elv);
  color: var(--c-text-2);
  font-size: 12px;
  font-family: var(--font-mono);
  margin-bottom: 20px;
}

h1 {
  font-size: 44px;
  font-weight: 750;
  letter-spacing: -0.025em;
  line-height: 1.25;
  margin-bottom: 18px;
}

.grad {
  background: linear-gradient(120deg, var(--vt-c-green-light), var(--vt-c-green-dark));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lead {
  max-width: 760px;
  color: var(--c-text-2);
  font-size: 15.5px;
  line-height: 1.85;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 32px 0 26px;
  max-width: 780px;
}

.stat {
  background: var(--c-bg-elv);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 16px 18px;
  box-shadow: var(--c-shadow);
}

.stat-n {
  font-size: 30px;
  font-weight: 700;
  color: var(--c-brand);
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.stat-n small {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-3);
  margin-left: 4px;
}

.stat-l {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--c-text-2);
}

.cta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero {
    padding: 36px 0 32px;
  }

  h1 {
    font-size: 30px;
  }

  .lead {
    font-size: 14px;
  }

  .stat-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .stat-n {
    font-size: 24px;
  }
}
</style>