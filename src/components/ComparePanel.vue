<script setup lang="ts">
import type { Game } from '../data/types'
import { vendorMap } from '../data/vendors'

defineProps<{ list: Game[] }>()
const emit = defineEmits<{ close: []; remove: [id: string] }>()

const rows: { key: keyof Game | 'vendor'; label: string }[] = [
  { key: 'vendor', label: '厂商' },
  { key: 'genre', label: '玩法品类' },
  { key: 'theme', label: '题材世界观' },
  { key: 'release', label: '上线时间' },
  { key: 'status', label: '运营状态' },
  { key: 'audience', label: '目标受众' },
  { key: 'platforms', label: '支持平台' },
  { key: 'monetization', label: '商业化模式' },
  { key: 'publisher', label: '研发 / 发行' },
  { key: 'highlight', label: '核心看点' },
]

function cell(g: Game, key: keyof Game | 'vendor'): string {
  if (key === 'vendor') return vendorMap[g.vendorId]?.name ?? g.vendorId
  if (key === 'platforms') return g.platforms.join(' / ')
  if (key === 'publisher') return g.publisher ?? vendorMap[g.vendorId]?.name ?? '—'
  const v = g[key]
  return typeof v === 'string' ? v : '—'
}
</script>

<template>
  <div class="mask" @click.self="emit('close')">
    <div class="modal panel" role="dialog" aria-modal="true" aria-label="产品并排对比">
      <div class="m-head">
        <div>
          <h3>并排对比</h3>
          <p class="m-sub">已选 {{ list.length }} 款产品 · 最多 4 款</p>
        </div>
        <button class="x" aria-label="关闭对比" @click="emit('close')">✕</button>
      </div>

      <div class="m-body scroll-x">
        <table class="cmp">
          <thead>
            <tr>
              <th class="attr-col">对比维度</th>
              <th v-for="g in list" :key="g.id">
                <div class="cmp-h">
                  <strong>{{ g.name }}</strong>
                  <button class="rm" :aria-label="`移除 ${g.name}`" @click="emit('remove', g.id)">
                    移除
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.key">
              <th class="attr-col">{{ r.label }}</th>
              <td v-for="g in list" :key="g.id" :class="{ long: r.key === 'highlight' }">
                {{ cell(g, r.key) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="m-foot">
        <button class="btn btn-brand" @click="emit('close')">完成对比</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 23, 32, 0.55);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal {
  width: min(1100px, 100%);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--c-shadow-lg);
  overflow: hidden;
}

.m-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--c-border);
}

.m-head h3 {
  font-size: 18px;
}

.m-sub {
  font-size: 12.5px;
  color: var(--c-text-3);
  margin-top: 3px;
}

.x {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c-bg-mute);
  color: var(--c-text-2);
  font-size: 13px;
  flex-shrink: 0;
}

.x:hover {
  background: var(--c-brand-dim);
  color: var(--c-brand);
}

.m-body {
  overflow: auto;
  flex: 1;
  padding: 0 24px;
}

.cmp {
  min-width: 620px;
  font-size: 13px;
}

.cmp th,
.cmp td {
  border-bottom: 1px solid var(--c-border-soft);
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
  line-height: 1.7;
}

.cmp thead th {
  position: sticky;
  top: 0;
  background: var(--c-bg-elv);
  border-bottom: 2px solid var(--c-brand);
  z-index: 1;
}

.attr-col {
  width: 108px;
  min-width: 108px;
  color: var(--c-text-3);
  font-weight: 550;
  font-size: 12px;
  background: var(--c-bg-soft);
  position: sticky;
  left: 0;
}

.cmp thead .attr-col {
  background: var(--c-bg-soft);
  z-index: 2;
}

.cmp tbody tr:hover td {
  background: var(--c-bg-soft);
}

.cmp td.long {
  color: var(--c-text-2);
  font-size: 12.5px;
}

.cmp-h {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
}

.cmp-h strong {
  font-size: 14px;
  color: var(--c-text-1);
}

.rm {
  font-size: 11.5px;
  color: var(--c-text-3);
  padding: 0;
}

.rm:hover {
  color: var(--c-danger);
}

.m-foot {
  padding: 16px 24px;
  border-top: 1px solid var(--c-border);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .mask {
    padding: 12px;
  }

  .m-body {
    padding: 0 12px;
  }
}
</style>