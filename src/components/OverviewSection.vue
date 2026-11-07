<script setup lang="ts">
import { computed } from 'vue'
import type { TabId, Tier } from '../data/types'
import { TIER_META } from '../data/types'
import { vendors } from '../data/vendors'
import { games } from '../data/games'
import { publisherRanks } from '../data/market'

const emit = defineEmits<{ go: [tab: TabId] }>()

const tiers: Tier[] = ['T0', 'T1', 'T2', 'T3']

const tierStats = computed(() =>
  tiers.map((t) => {
    const vs = vendors.filter((v) => v.tier === t)
    const ids = new Set(vs.map((v) => v.id))
    return {
      tier: t,
      meta: TIER_META[t],
      vendors: vs,
      gameCount: games.filter((g) => ids.has(g.vendorId)).length,
    }
  }),
)

const maxTierGames = computed(() => Math.max(...tierStats.value.map((t) => t.gameCount)))

function bucketOf(genre: string): string {
  if (/开放世界|大世界/.test(genre)) return '开放世界'
  if (/换装|恋爱|乙女|偶像|复仇/.test(genre)) return '恋爱换装'
  if (/射击|动作|格斗|机甲/.test(genre)) return '动作射击'
  if (/策略|卡牌|塔防|战棋|回合|Rogueli|自走棋/.test(genre)) return '策略卡牌'
  return '养成 / 模拟 / 其他'
}

const bucketColors: Record<string, string> = {
  开放世界: '#42b883',
  策略卡牌: '#35495e',
  动作射击: '#42d392',
  恋爱换装: '#e8a0bf',
  '养成 / 模拟 / 其他': '#d9a441',
}

const genreStats = computed(() => {
  const m = new Map<string, number>()
  for (const g of games) {
    const b = bucketOf(g.genre)
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  const total = games.length
  return [...m.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      color: bucketColors[name],
    }))
    .sort((a, b) => b.count - a.count)
})

const audienceStats = computed(() => {
  const order = ['一般向', '男性向', '女性向'] as const
  const colors = { 一般向: '#42b883', 男性向: '#4a90d9', 女性向: '#e8a0bf' }
  return order.map((a) => ({
    name: a,
    count: games.filter((g) => g.audience === a).length,
    pct: Math.round((games.filter((g) => g.audience === a).length / games.length) * 100),
    color: colors[a],
  }))
})

const insights = [
  {
    title: '寡头集中，上海是核心集聚区',
    body: '米哈游、鹰角、库洛占据赛道大部分份额，叠纸在女性向建立绝对心智。头部厂商普遍研运一体、全产业链布局，中小厂持续出清。',
    tab: 'vendors' as TabId,
    cta: '看厂商图谱',
  },
  {
    title: '四条品类主线各有龙头',
    body: '开放世界看米哈游与库洛，策略塔防看鹰角，女性向看叠纸，动作射击看西山居与创梦天地。品类心智比公司品牌更能决定用户选择。',
    tab: 'games' as TabId,
    cta: '看产品对比',
  },
  {
    title: '大厂打法与垂类厂商截然不同',
    body: '腾讯靠投资（控股库洛、持股散爆）+ 代理 + 阅文 IP 储备；网易靠自研工业化与长线运营；B 站靠社区浓度做代理发行，自研能力薄弱。',
    tab: 'vendors' as TabId,
    cta: '看厂商定位',
  },
  {
    title: '跨年混战开启洗牌窗口',
    body: '2026-11-26 至 2027-01-15，蓝色星原、星布谷地、白银之城、异人之下、无限大五款旗舰在七周内密集定档，是近年最激烈的新品对撞。',
    tab: 'calendar' as TabId,
    cta: '看新品日历',
  },
]
</script>

<template>
  <div class="ov">
    <section class="section-head">
      <h2>赛道总览</h2>
      <p class="sub">
        收录 {{ vendors.length }} 家厂商、{{ games.length }} 款产品。梯队划分依据二次元业务体量与品类心智，
        为编辑判断而非官方排名。
      </p>
    </section>

    <div class="grid-2">
      <div class="panel block">
        <h3 class="block-t">厂商梯队分布</h3>
        <div class="tier-list">
          <div v-for="t in tierStats" :key="t.tier" class="tier-row">
            <div class="tier-head">
              <span class="tier-dot" :style="{ background: t.meta.color }"></span>
              <strong>{{ t.meta.label }}</strong>
              <span class="tier-n">{{ t.vendors.length }} 家 · {{ t.gameCount }} 款</span>
            </div>
            <div class="tier-bar">
              <span
                :style="{
                  width: (t.gameCount / maxTierGames) * 100 + '%',
                  background: t.meta.color,
                }"
              ></span>
            </div>
            <p class="tier-desc">{{ t.meta.desc }}</p>
            <div class="tier-names">
              <span v-for="v in t.vendors" :key="v.id" class="tag">{{ v.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-stack">
        <div class="panel block">
          <h3 class="block-t">玩法品类结构</h3>
          <div class="hbar-list">
            <div v-for="g in genreStats" :key="g.name" class="hbar-row">
              <span class="hbar-l">{{ g.name }}</span>
              <span class="hbar-track">
                <span
                  class="hbar-fill"
                  :style="{ width: g.pct + '%', background: g.color }"
                ></span>
              </span>
              <span class="hbar-v">{{ g.count }} 款 · {{ g.pct }}%</span>
            </div>
          </div>
        </div>

        <div class="panel block">
          <h3 class="block-t">目标受众结构</h3>
          <div class="aud-row">
            <div v-for="a in audienceStats" :key="a.name" class="aud">
              <div class="aud-ring" :style="`--p:${a.pct};--c:${a.color}`">
                <span>{{ a.pct }}%</span>
              </div>
              <div class="aud-l">{{ a.name }}</div>
              <div class="aud-n">{{ a.count }} 款</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="section-head gap">
      <h2>格局要点</h2>
    </section>
    <div class="insight-grid">
      <article v-for="i in insights" :key="i.title" class="panel insight">
        <h3>{{ i.title }}</h3>
        <p>{{ i.body }}</p>
        <button class="btn btn-sm" @click="emit('go', i.tab)">{{ i.cta }} →</button>
      </article>
    </div>

    <section class="section-head gap">
      <h2>全球发行商位次</h2>
      <p class="sub">
        Sensor Tower 2026 年 9 月中国手游发行商全球 App Store + Google Play 收入 Top30 中，
        二次元相关厂商的位次。该榜为全品类口径，非二次元专项排名。
      </p>
    </section>
    <div class="panel rank-panel">
      <div v-for="r in publisherRanks" :key="r.name" class="rank-row">
        <span class="rank-no" :class="{ top: r.top }">{{ r.rank }}</span>
        <strong class="rank-name">{{ r.name }}</strong>
        <span class="rank-note">{{ r.note }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ov {
  display: flex;
  flex-direction: column;
}

.grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.col-stack {
  display: grid;
  gap: 18px;
}

.block {
  padding: 22px;
}

.block-t {
  font-size: 15px;
  margin-bottom: 18px;
  color: var(--c-text-1);
}

.gap {
  margin-top: 44px;
}

.tier-list {
  display: grid;
  gap: 20px;
}

.tier-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
}

.tier-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tier-n {
  margin-left: auto;
  color: var(--c-text-3);
  font-size: 12px;
  font-family: var(--font-mono);
}

.tier-bar {
  height: 7px;
  border-radius: 4px;
  background: var(--c-bg-mute);
  margin: 9px 0 8px;
  overflow: hidden;
}

.tier-bar span {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.tier-desc {
  font-size: 12.5px;
  color: var(--c-text-2);
  line-height: 1.65;
}

.tier-names {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.hbar-list {
  display: grid;
  gap: 13px;
}

.hbar-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) 84px;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.hbar-l {
  color: var(--c-text-2);
}

.hbar-track {
  height: 9px;
  background: var(--c-bg-mute);
  border-radius: 5px;
  overflow: hidden;
}

.hbar-fill {
  display: block;
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.hbar-v {
  text-align: right;
  color: var(--c-text-3);
  font-family: var(--font-mono);
  font-size: 11.5px;
}

.aud-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.aud {
  text-align: center;
}

.aud-ring {
  --p: 0;
  --c: #42b883;
  width: 78px;
  height: 78px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--c) calc(var(--p) * 1%), var(--c-bg-mute) 0);
  position: relative;
}

.aud-ring::before {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  background: var(--c-bg-elv);
}

.aud-ring span {
  position: relative;
  font-size: 15px;
  font-weight: 650;
  color: var(--c-text-1);
  font-variant-numeric: tabular-nums;
}

.aud-l {
  font-size: 13px;
  font-weight: 550;
}

.aud-n {
  font-size: 11.5px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.insight {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  transition: border-color 0.18s, transform 0.18s;
}

.insight:hover {
  border-color: var(--c-brand);
  transform: translateY(-2px);
}

.insight h3 {
  font-size: 15.5px;
}

.insight p {
  font-size: 13.5px;
  color: var(--c-text-2);
  line-height: 1.8;
  flex: 1;
}

.rank-panel {
  padding: 8px 22px;
}

.rank-row {
  display: grid;
  grid-template-columns: 52px 130px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid var(--c-border-soft);
  font-size: 13.5px;
}

.rank-row:last-child {
  border-bottom: none;
}

.rank-no {
  font-family: var(--font-mono);
  font-weight: 650;
  color: var(--c-text-3);
  font-size: 14px;
}

.rank-no.top {
  color: var(--c-brand);
}

.rank-note {
  color: var(--c-text-2);
  font-size: 12.5px;
}

@media (max-width: 900px) {
  .grid-2,
  .insight-grid {
    grid-template-columns: 1fr;
  }

  .hbar-row {
    grid-template-columns: 92px minmax(0, 1fr) 76px;
  }

  .rank-row {
    grid-template-columns: 44px 100px minmax(0, 1fr);
    gap: 8px;
  }
}
</style>