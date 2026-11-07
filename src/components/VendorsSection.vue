<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Tier, VendorKind } from '../data/types'
import { TIER_META } from '../data/types'
import { vendors } from '../data/vendors'
import { games } from '../data/games'

const emit = defineEmits<{ select: [vendorId: string] }>()

const keyword = ref('')
const tierFilter = ref<'all' | Tier>('all')
const kindFilter = ref<'all' | VendorKind>('all')

const kinds = [...new Set(vendors.map((v) => v.kind))] as VendorKind[]
const tiers: Tier[] = ['T0', 'T1', 'T2', 'T3']

const gameCount = computed(() => {
  const m = new Map<string, number>()
  for (const g of games) m.set(g.vendorId, (m.get(g.vendorId) ?? 0) + 1)
  return m
})

const liveCount = computed(() => {
  const m = new Map<string, number>()
  for (const g of games) {
    if (g.status === '运营中') m.set(g.vendorId, (m.get(g.vendorId) ?? 0) + 1)
  }
  return m
})

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return vendors.filter((v) => {
    if (tierFilter.value !== 'all' && v.tier !== tierFilter.value) return false
    if (kindFilter.value !== 'all' && v.kind !== kindFilter.value) return false
    if (!k) return true
    const hay = [v.name, v.alias, v.hq, v.positioning, v.capital].join(' ').toLowerCase()
    const ownGames = games.filter((g) => g.vendorId === v.id).map((g) => g.name)
    return hay.includes(k) || ownGames.some((n) => n.toLowerCase().includes(k))
  })
})

const grouped = computed(() =>
  tiers
    .map((t) => ({ tier: t, meta: TIER_META[t], list: filtered.value.filter((v) => v.tier === t) }))
    .filter((g) => g.list.length > 0),
)

function reset() {
  keyword.value = ''
  tierFilter.value = 'all'
  kindFilter.value = 'all'
}
</script>

<template>
  <div>
    <section class="section-head">
      <h2>厂商图谱</h2>
      <p class="sub">
        共 {{ vendors.length }} 家厂商，按二次元业务体量分为四个梯队。点击卡片底部按钮可直接跳转到该厂商的产品列表。
      </p>
    </section>

    <div class="toolbar">
      <label class="field search">
        <span class="icon">⌕</span>
        <input v-model="keyword" type="search" placeholder="搜索厂商、别名、城市或旗下游戏…" />
      </label>
      <label class="field sel">
        <select v-model="tierFilter">
          <option value="all">全部梯队</option>
          <option v-for="t in tiers" :key="t" :value="t">{{ TIER_META[t].label }}</option>
        </select>
      </label>
      <label class="field sel">
        <select v-model="kindFilter">
          <option value="all">全部类型</option>
          <option v-for="k in kinds" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>
      <button class="btn btn-sm" @click="reset">重置</button>
      <span class="count">{{ filtered.length }} / {{ vendors.length }} 家</span>
    </div>

    <div v-if="grouped.length === 0" class="empty panel">
      没有匹配的厂商，试试放宽筛选条件。
    </div>

    <div v-for="g in grouped" :key="g.tier" class="tier-group">
      <div class="tier-title">
        <span class="dot" :style="{ background: g.meta.color }"></span>
        <h3>{{ g.meta.label }}</h3>
        <span class="tier-sub">{{ g.meta.desc }}</span>
      </div>

      <div class="cards">
        <article v-for="v in g.list" :key="v.id" class="panel card">
          <div class="card-top">
            <span class="avatar" :style="{ background: v.color }">{{ v.name.slice(0, 1) }}</span>
            <div class="ident">
              <h4>{{ v.name }}</h4>
              <span class="alias">{{ v.alias }}</span>
            </div>
            <span class="badge badge-mute tier-badge">{{ v.tier }}</span>
          </div>

          <div class="meta-row">
            <span class="tag">{{ v.hq }}</span>
            <span class="tag">{{ v.kind }}</span>
            <span class="tag">{{ v.capital }}</span>
          </div>

          <p class="pos">{{ v.positioning }}</p>

          <div class="sr">
            <div class="sr-item">
              <span class="sr-k">优势</span>
              <p>{{ v.strength }}</p>
            </div>
            <div class="sr-item">
              <span class="sr-k risk">风险</span>
              <p>{{ v.risk }}</p>
            </div>
          </div>

          <div class="card-foot">
            <span class="nums">
              <template v-if="gameCount.get(v.id)">
                <strong>{{ gameCount.get(v.id) }}</strong> 款收录 ·
                <strong>{{ liveCount.get(v.id) ?? 0 }}</strong> 款运营中
              </template>
              <template v-else>海外发行商 · 无自研产品收录</template>
            </span>
            <button
              v-if="gameCount.get(v.id)"
              class="btn btn-sm btn-brand"
              @click="emit('select', v.id)"
            >
              查看产品 →
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.search {
  flex: 1 1 280px;
  min-width: 220px;
}

.sel {
  flex: 0 0 auto;
  min-width: 148px;
}

.count {
  margin-left: auto;
  font-size: 12.5px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
}

.empty {
  padding: 48px;
  text-align: center;
  color: var(--c-text-3);
}

.tier-group {
  margin-bottom: 34px;
}

.tier-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  align-self: center;
  flex-shrink: 0;
}

.tier-title h3 {
  font-size: 17px;
}

.tier-sub {
  font-size: 12.5px;
  color: var(--c-text-3);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
}

.card:hover {
  border-color: var(--c-brand);
  transform: translateY(-3px);
  box-shadow: var(--c-shadow-lg);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 19px;
  font-weight: 650;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

.ident {
  min-width: 0;
  flex: 1;
}

.ident h4 {
  font-size: 16.5px;
}

.alias {
  display: block;
  font-size: 11.5px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tier-badge {
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pos {
  font-size: 13.5px;
  color: var(--c-text-1);
  font-weight: 550;
  line-height: 1.6;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--c-border);
}

.sr {
  display: grid;
  gap: 10px;
  flex: 1;
}

.sr-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 9px;
  align-items: start;
}

.sr-k {
  font-size: 11px;
  font-weight: 650;
  color: var(--c-brand);
  background: var(--c-brand-dim);
  border-radius: 4px;
  text-align: center;
  padding: 1px 0;
  margin-top: 3px;
}

.sr-k.risk {
  color: var(--c-warning);
  background: rgba(217, 164, 65, 0.14);
}

.sr-item p {
  font-size: 12.8px;
  color: var(--c-text-2);
  line-height: 1.75;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 13px;
  border-top: 1px solid var(--c-border-soft);
}

.nums {
  font-size: 12px;
  color: var(--c-text-3);
}

.nums strong {
  color: var(--c-text-1);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .cards {
    grid-template-columns: 1fr;
  }

  .count {
    margin-left: 0;
    width: 100%;
  }
}
</style>