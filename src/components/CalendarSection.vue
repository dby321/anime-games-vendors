<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReleaseEvent } from '../data/types'
import { releaseEvents } from '../data/market'
import { vendorMap } from '../data/vendors'

const TODAY = '2026-11-07'

const kindFilter = ref<'all' | ReleaseEvent['kind']>('all')
const kinds: ReleaseEvent['kind'][] = ['已上线', '测试', '定档', '待定']

// 仅精确到月的事件排在该月所有具体日期之后，避免与已定档产品穿插错序
function sortKey(e: ReleaseEvent) {
  return /^\d{4}-\d{2}$/.test(e.date) ? e.date + '-99' : e.date
}

const sorted = computed(() =>
  [...releaseEvents].sort((a, b) => sortKey(a).localeCompare(sortKey(b))),
)

const filtered = computed(() =>
  kindFilter.value === 'all' ? sorted.value : sorted.value.filter((e) => e.kind === kindFilter.value),
)

const groups = computed(() => {
  const m = new Map<string, ReleaseEvent[]>()
  for (const e of filtered.value) {
    const key = e.date === '9999' ? '待定' : e.dateLabel
    const arr = m.get(key) ?? []
    arr.push(e)
    m.set(key, arr)
  }
  return [...m.entries()].map(([label, list]) => ({ label, list }))
})

const upcomingWindow = computed(() =>
  releaseEvents.filter((e) => e.date >= '2026-11-26' && e.date <= '2027-01-15' && e.kind === '定档'),
)

function isPast(e: ReleaseEvent) {
  return e.date !== '9999' && e.date < TODAY
}

function kindClass(k: ReleaseEvent['kind']) {
  return {
    已上线: 'badge-live',
    公测: 'badge-live',
    测试: 'badge-dev',
    定档: 'badge-soon',
    待定: 'badge-mute',
  }[k]
}
</script>

<template>
  <div>
    <section class="section-head">
      <h2>新品日历</h2>
      <p class="sub">
        2026 年已上线的重点产品，以及 2026 年 11 月至 2027 年的定档与在研项目。
        时间线按日期升序排列，「待定」项目统一置于末尾。
      </p>
    </section>

    <div class="callout window">
      <strong>跨年混战窗口：</strong>
      {{ upcomingWindow.length }} 款旗舰新品集中在 2026-11-26 至 2027-01-15 之间上线 ——
      <span v-for="(e, i) in upcomingWindow" :key="e.game + e.date">
        {{ e.game }}（{{ e.dateLabel }}）<template v-if="i < upcomingWindow.length - 1"> → </template>
      </span>
      。这是近年国产二游最密集的一次新品对撞，赛道洗牌概率显著上升。
    </div>

    <div class="filter-row">
      <button class="chip" :class="{ on: kindFilter === 'all' }" @click="kindFilter = 'all'">
        全部（{{ releaseEvents.length }}）
      </button>
      <button
        v-for="k in kinds"
        :key="k"
        class="chip"
        :class="{ on: kindFilter === k }"
        @click="kindFilter = k"
      >
        {{ k }}（{{ releaseEvents.filter((e) => e.kind === k).length }}）
      </button>
    </div>

    <div class="timeline">
      <div v-for="g in groups" :key="g.label" class="tl-group">
        <div class="tl-date">
          <span class="tl-dotline"></span>
          <strong>{{ g.label }}</strong>
        </div>
        <div class="tl-items">
          <article
            v-for="e in g.list"
            :key="e.game + e.date + e.kind"
            class="panel tl-item"
            :class="{ past: isPast(e) }"
          >
            <div class="tl-top">
              <span
                class="tl-vdot"
                :style="{ background: vendorMap[e.vendorId]?.color }"
              ></span>
              <h3>{{ e.game }}</h3>
              <span class="badge" :class="kindClass(e.kind)">{{ e.kind }}</span>
              <span v-if="isPast(e)" class="past-tag">已发生</span>
            </div>
            <div class="tl-meta">
              <span class="tag">{{ vendorMap[e.vendorId]?.name }}</span>
              <span class="tl-genre">{{ e.genre }}</span>
            </div>
            <p class="tl-note">{{ e.note }}</p>
          </article>
        </div>
      </div>
    </div>

    <div v-if="groups.length === 0" class="empty panel">该分类下暂无事件。</div>
  </div>
</template>

<style scoped>
.window {
  margin-bottom: 22px;
}

.filter-row {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.chip {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-2);
  transition: all 0.16s;
}

.chip:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

.chip.on {
  background: var(--c-brand);
  border-color: var(--c-brand);
  color: #fff;
}

html.dark .chip.on {
  color: #12301f;
}

.timeline {
  display: grid;
  gap: 26px;
  position: relative;
  padding-left: 6px;
}

.tl-group {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.tl-date {
  position: sticky;
  top: calc(var(--header-h) + 16px);
  display: flex;
  align-items: center;
  gap: 9px;
  padding-top: 14px;
}

.tl-date strong {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--c-text-1);
  font-weight: 600;
}

.tl-dotline {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-brand);
  box-shadow: 0 0 0 4px var(--c-brand-dim);
  flex-shrink: 0;
}

.tl-items {
  display: grid;
  gap: 12px;
  border-left: 2px solid var(--c-border);
  padding-left: 20px;
  padding-bottom: 4px;
}

.tl-item {
  padding: 16px 18px;
  transition: border-color 0.18s, transform 0.18s;
}

.tl-item:hover {
  border-color: var(--c-brand);
  transform: translateX(3px);
}

.tl-item.past {
  opacity: 0.72;
}

.tl-top {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.tl-vdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tl-top h3 {
  font-size: 15.5px;
}

.past-tag {
  font-size: 11px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
  margin-left: auto;
}

.tl-meta {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 9px 0 8px;
  flex-wrap: wrap;
}

.tl-genre {
  font-size: 12.5px;
  color: var(--c-text-2);
}

.tl-note {
  font-size: 13px;
  color: var(--c-text-2);
  line-height: 1.8;
}

.empty {
  padding: 40px;
  text-align: center;
  color: var(--c-text-3);
}

@media (max-width: 768px) {
  .tl-group {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .tl-date {
    position: static;
    padding-top: 0;
  }

  .tl-items {
    padding-left: 14px;
  }
}
</style>