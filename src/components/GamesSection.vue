<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Game, GameStatus, Platform } from '../data/types'
import { games } from '../data/games'
import { vendors, vendorMap } from '../data/vendors'
import ComparePanel from './ComparePanel.vue'

const props = defineProps<{ presetVendor: string }>()
const emit = defineEmits<{ 'clear-preset': [] }>()

const keyword = ref('')
const vendorId = ref(props.presetVendor || 'all')
const status = ref<'all' | GameStatus>('all')
const audience = ref('all')
const platform = ref<'all' | Platform>('all')

const sortKey = ref<'name' | 'vendor' | 'genre' | 'release' | 'status' | 'audience'>('release')
const sortDir = ref<'asc' | 'desc'>('desc')

const expanded = ref<Set<string>>(new Set())
const compareIds = ref<string[]>([])
const showCompare = ref(false)

watch(
  () => props.presetVendor,
  (v) => {
    vendorId.value = v || 'all'
  },
)

const statuses: GameStatus[] = ['运营中', '即将上线', '在研', '停更', '停运']
const audiences = ['一般向', '男性向', '女性向']
const platforms = [...new Set(games.flatMap((g) => g.platforms))] as Platform[]

const vendorOptions = computed(() =>
  vendors
    .filter((v) => games.some((g) => g.vendorId === v.id))
    .map((v) => ({ id: v.id, name: v.name, n: games.filter((g) => g.vendorId === v.id).length })),
)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return games.filter((g) => {
    if (vendorId.value !== 'all' && g.vendorId !== vendorId.value) return false
    if (status.value !== 'all' && g.status !== status.value) return false
    if (audience.value !== 'all' && g.audience !== audience.value) return false
    if (platform.value !== 'all' && !g.platforms.includes(platform.value)) return false
    if (!k) return true
    return [g.name, g.genre, g.theme, g.highlight, vendorMap[g.vendorId]?.name ?? '']
      .join(' ')
      .toLowerCase()
      .includes(k)
  })
})

const sorted = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  const val = (g: Game): string => {
    switch (sortKey.value) {
      case 'vendor':
        return vendorMap[g.vendorId]?.name ?? ''
      case 'release':
        return g.release === '待定' ? '' : g.release
      default:
        return g[sortKey.value]
    }
  }
  return [...filtered.value].sort((a, b) => {
    // 「待定」没有可比较的时间值，无论升降序都置底
    if (sortKey.value === 'release') {
      const ad = a.release === '待定'
      const bd = b.release === '待定'
      if (ad !== bd) return ad ? 1 : -1
    }
    const r = val(a).localeCompare(val(b), 'zh-Hans-CN')
    return r !== 0 ? r * dir : a.name.localeCompare(b.name, 'zh-Hans-CN')
  })
})

const compareList = computed(() =>
  compareIds.value.map((id) => games.find((g) => g.id === id)).filter((g): g is Game => !!g),
)

const activeFilters = computed(
  () =>
    keyword.value.trim() !== '' ||
    vendorId.value !== 'all' ||
    status.value !== 'all' ||
    audience.value !== 'all' ||
    platform.value !== 'all',
)

function sortBy(k: typeof sortKey.value) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = k
    sortDir.value = k === 'release' ? 'desc' : 'asc'
  }
}

function toggleExpand(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function toggleCompare(id: string) {
  const i = compareIds.value.indexOf(id)
  if (i >= 0) compareIds.value.splice(i, 1)
  else if (compareIds.value.length < 4) compareIds.value.push(id)
}

function reset() {
  keyword.value = ''
  vendorId.value = 'all'
  status.value = 'all'
  audience.value = 'all'
  platform.value = 'all'
  emit('clear-preset')
}

function badgeClass(s: GameStatus) {
  return {
    运营中: 'badge-live',
    即将上线: 'badge-soon',
    在研: 'badge-dev',
    停更: 'badge-dead',
    停运: 'badge-dead',
  }[s]
}

const cols: { key: typeof sortKey.value; label: string; w?: string }[] = [
  { key: 'name', label: '游戏产品' },
  { key: 'vendor', label: '所属厂商' },
  { key: 'genre', label: '玩法品类' },
  { key: 'release', label: '上线时间' },
  { key: 'status', label: '状态' },
  { key: 'audience', label: '受众' },
]
</script>

<template>
  <div class="gs">
    <section class="section-head">
      <h2>产品对比表</h2>
      <p class="sub">
        {{ games.length }} 款产品，支持关键词搜索、厂商 / 状态 / 受众 / 平台筛选与列排序。
        点击行展开题材与商业化详情，勾选左侧复选框可并排对比最多 4 款产品。
      </p>
    </section>

    <div class="toolbar panel">
      <div class="tb-row">
        <label class="field search">
          <span class="icon">⌕</span>
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索游戏名、品类、题材或看点…"
          />
        </label>
        <label class="field sel">
          <select v-model="vendorId">
            <option value="all">全部厂商（{{ games.length }}）</option>
            <option v-for="v in vendorOptions" :key="v.id" :value="v.id">
              {{ v.name }}（{{ v.n }}）
            </option>
          </select>
        </label>
        <label class="field sel narrow">
          <select v-model="platform">
            <option value="all">全部平台</option>
            <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <button class="btn btn-sm" :disabled="!activeFilters" @click="reset">重置筛选</button>
      </div>

      <div class="tb-row chips">
        <div class="chip-group">
          <span class="chip-l">状态</span>
          <button class="chip" :class="{ on: status === 'all' }" @click="status = 'all'">全部</button>
          <button
            v-for="s in statuses"
            :key="s"
            class="chip"
            :class="{ on: status === s }"
            @click="status = s"
          >
            {{ s }}
          </button>
        </div>
        <div class="chip-group">
          <span class="chip-l">受众</span>
          <button class="chip" :class="{ on: audience === 'all' }" @click="audience = 'all'">
            全部
          </button>
          <button
            v-for="a in audiences"
            :key="a"
            class="chip"
            :class="{ on: audience === a }"
            @click="audience = a"
          >
            {{ a }}
          </button>
        </div>
        <span class="result-n">命中 <strong>{{ sorted.length }}</strong> 款</span>
      </div>
    </div>

    <div v-if="sorted.length === 0" class="empty panel">
      没有匹配的产品。试试清空关键词或放宽筛选条件。
      <button class="btn btn-sm" @click="reset">重置筛选</button>
    </div>

    <div v-else class="panel table-wrap scroll-x">
      <table class="gt">
        <thead>
          <tr>
            <th class="c-check">
              <span class="sr-only">对比</span>
            </th>
            <th
              v-for="c in cols"
              :key="c.key"
              class="sortable"
              :class="{ act: sortKey === c.key }"
              @click="sortBy(c.key)"
            >
              {{ c.label }}
              <span class="arrow">{{ sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅' }}</span>
            </th>
            <th class="c-plat">平台</th>
            <th class="c-exp"><span class="sr-only">展开</span></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="g in sorted" :key="g.id">
            <tr :class="{ open: expanded.has(g.id), picked: compareIds.includes(g.id) }">
              <td class="c-check">
                <input
                  type="checkbox"
                  :checked="compareIds.includes(g.id)"
                  :disabled="!compareIds.includes(g.id) && compareIds.length >= 4"
                  :aria-label="`将 ${g.name} 加入对比`"
                  @change="toggleCompare(g.id)"
                />
              </td>
              <td class="c-name">
                <button class="name-btn" @click="toggleExpand(g.id)">{{ g.name }}</button>
              </td>
              <td>
                <span class="v-dot" :style="{ background: vendorMap[g.vendorId]?.color }"></span>
                {{ vendorMap[g.vendorId]?.name }}
              </td>
              <td class="c-genre">{{ g.genre }}</td>
              <td class="c-release">{{ g.release }}</td>
              <td><span class="badge" :class="badgeClass(g.status)">{{ g.status }}</span></td>
              <td class="c-aud">{{ g.audience }}</td>
              <td class="c-plat">
                <span v-for="p in g.platforms" :key="p" class="tag">{{ p }}</span>
              </td>
              <td class="c-exp">
                <button
                  class="exp"
                  :aria-label="expanded.has(g.id) ? '收起详情' : '展开详情'"
                  @click="toggleExpand(g.id)"
                >
                  {{ expanded.has(g.id) ? '−' : '+' }}
                </button>
              </td>
            </tr>
            <tr v-if="expanded.has(g.id)" class="detail">
              <td :colspan="cols.length + 3">
                <div class="d-grid">
                  <div class="d-item">
                    <span class="d-k">题材世界观</span>
                    <span class="d-v">{{ g.theme }}</span>
                  </div>
                  <div class="d-item">
                    <span class="d-k">商业化模式</span>
                    <span class="d-v">{{ g.monetization }}</span>
                  </div>
                  <div class="d-item">
                    <span class="d-k">研发 / 发行</span>
                    <span class="d-v">{{ g.publisher ?? vendorMap[g.vendorId]?.name }}</span>
                  </div>
                  <div class="d-item wide">
                    <span class="d-k">核心看点</span>
                    <span class="d-v">{{ g.highlight }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="foot-note">
      注：上线时间为国服 / 全球公测月份，部分产品仅精确到年。「停更」指停止内容更新但仍可游玩，「停运」指服务器已关闭。
    </p>

    <div v-if="compareIds.length" class="cmp-bar">
      <div class="cmp-bar-in shell">
        <span class="cmp-txt">
          已选 <strong>{{ compareIds.length }}</strong> / 4 款：
          <span v-for="g in compareList" :key="g.id" class="cmp-pill">
            {{ g.name }}<button :aria-label="`移除 ${g.name}`" @click="toggleCompare(g.id)">✕</button>
          </span>
        </span>
        <span class="cmp-acts">
          <button class="btn btn-sm" @click="compareIds = []">清空</button>
          <button
            class="btn btn-sm btn-brand"
            :disabled="compareIds.length < 2"
            @click="showCompare = true"
          >
            并排对比 →
          </button>
        </span>
      </div>
    </div>

    <ComparePanel
      v-if="showCompare"
      :list="compareList"
      @close="showCompare = false"
      @remove="toggleCompare"
    />
  </div>
</template>

<style scoped>
.gs {
  padding-bottom: 60px;
}

.toolbar {
  padding: 16px 18px;
  margin-bottom: 18px;
  display: grid;
  gap: 13px;
}

.tb-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search {
  flex: 1 1 260px;
  min-width: 200px;
}

.sel {
  flex: 0 1 210px;
  min-width: 160px;
}

.sel.narrow {
  flex: 0 0 130px;
  min-width: 120px;
}

.chips {
  gap: 18px;
  padding-top: 13px;
  border-top: 1px solid var(--c-border-soft);
}

.chip-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.chip-l {
  font-size: 12px;
  color: var(--c-text-3);
  margin-right: 3px;
}

.chip {
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
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

.result-n {
  margin-left: auto;
  font-size: 12.5px;
  color: var(--c-text-3);
}

.result-n strong {
  color: var(--c-brand);
  font-family: var(--font-mono);
  font-size: 14px;
}

.empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--c-text-3);
  display: grid;
  gap: 14px;
  justify-items: center;
}

.table-wrap {
  padding: 0;
  overflow: hidden;
}

.gt {
  min-width: 940px;
  font-size: 13.2px;
}

.gt thead th {
  background: var(--c-bg-soft);
  border-bottom: 1px solid var(--c-border);
  padding: 12px 14px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-2);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

.gt th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.16s;
}

.gt th.sortable:hover {
  color: var(--c-brand);
}

.gt th.act {
  color: var(--c-brand);
}

.arrow {
  font-size: 9px;
  margin-left: 4px;
  opacity: 0.55;
}

.gt th.act .arrow {
  opacity: 1;
}

.gt tbody td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--c-border-soft);
  vertical-align: middle;
  color: var(--c-text-2);
}

.gt tbody tr:hover td {
  background: var(--c-bg-soft);
}

.gt tbody tr.picked td {
  background: var(--c-brand-dim);
}

.gt tbody tr.open td {
  border-bottom-color: transparent;
}

.c-check {
  width: 42px;
  text-align: center;
}

.c-check input {
  width: 15px;
  height: 15px;
  accent-color: var(--c-brand);
  cursor: pointer;
}

.c-check input:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.c-name {
  min-width: 168px;
}

.name-btn {
  padding: 0;
  font-size: 13.8px;
  font-weight: 600;
  color: var(--c-text-1);
  text-align: left;
  transition: color 0.16s;
}

.name-btn:hover {
  color: var(--c-brand);
}

.v-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.c-genre {
  min-width: 150px;
  font-size: 12.5px;
}

.c-release {
  font-family: var(--font-mono);
  font-size: 12.5px;
  white-space: nowrap;
}

.c-aud {
  white-space: nowrap;
  font-size: 12.5px;
}

.c-plat {
  min-width: 150px;
}

.c-plat .tag {
  margin: 1px 3px 1px 0;
}

.c-exp {
  width: 44px;
  text-align: center;
}

.exp {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-2);
  font-size: 14px;
  line-height: 1;
  display: grid;
  place-items: center;
}

.exp:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

.detail td {
  background: var(--c-bg-soft);
  padding: 0 14px 16px !important;
  border-bottom: 1px solid var(--c-border) !important;
}

.d-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 22px;
  padding: 14px 16px;
  background: var(--c-bg-elv);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
}

.d-item {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.d-item.wide {
  grid-column: 1 / -1;
}

.d-k {
  font-size: 11px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.d-v {
  font-size: 13px;
  color: var(--c-text-1);
  line-height: 1.75;
}

.d-item.wide .d-v {
  color: var(--c-text-2);
}

.foot-note {
  margin-top: 14px;
  font-size: 12px;
  color: var(--c-text-3);
  line-height: 1.75;
}

@keyframes bar-in {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.cmp-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  background: color-mix(in srgb, var(--c-bg-elv) 94%, transparent);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--c-brand);
  box-shadow: 0 -6px 24px rgba(31, 45, 61, 0.1);
  animation: bar-in 0.2s ease both;
}

.cmp-bar-in {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  padding-bottom: 12px;
  flex-wrap: wrap;
}

.cmp-txt {
  font-size: 13px;
  color: var(--c-text-2);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
}

.cmp-txt strong {
  color: var(--c-brand);
  font-family: var(--font-mono);
}

.cmp-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--c-brand-dim);
  color: var(--c-text-1);
  font-size: 12.5px;
}

.cmp-pill button {
  padding: 0;
  font-size: 10px;
  color: var(--c-text-3);
  line-height: 1;
}

.cmp-pill button:hover {
  color: var(--c-danger);
}

.cmp-acts {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .d-grid {
    grid-template-columns: 1fr;
  }

  .result-n {
    margin-left: 0;
    width: 100%;
  }

  .cmp-acts {
    margin-left: 0;
    width: 100%;
  }
}
</style>