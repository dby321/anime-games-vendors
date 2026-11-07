<script setup lang="ts">
import type { TabId } from '../data/types'

const tab = defineModel<TabId>('tab', { required: true })
const dark = defineModel<boolean>('dark', { required: true })

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: '总览' },
  { id: 'vendors', label: '厂商图谱' },
  { id: 'games', label: '产品对比' },
  { id: 'market', label: '市场表现' },
  { id: 'calendar', label: '新品日历' },
]
</script>

<template>
  <header class="hdr">
    <div class="shell hdr-inner">
      <button class="brand" @click="tab = 'overview'">
        <svg class="logo" viewBox="0 0 261.76 226.69" aria-hidden="true">
          <path
            d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
            fill="#41b883"
          />
          <path
            d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"
            fill="#35495e"
          />
        </svg>
        <span class="brand-txt">
          <strong>二次元游戏厂商图谱</strong>
          <em>China Anime Games · 2026</em>
        </span>
      </button>

      <nav class="nav scroll-x">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="nav-item"
          :class="{ on: tab === t.id }"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>

      <button
        class="theme-btn"
        :title="dark ? '切换到浅色模式' : '切换到深色模式'"
        :aria-label="dark ? '切换到浅色模式' : '切换到深色模式'"
        @click="dark = !dark"
      >
        <span v-if="dark">☀</span>
        <span v-else>☾</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-border);
}

.hdr-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  flex-shrink: 0;
}

.logo {
  width: 26px;
  height: 23px;
}

.brand-txt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
}

.brand-txt strong {
  font-size: 15px;
  font-weight: 650;
  color: var(--c-text-1);
}

.brand-txt em {
  font-style: normal;
  font-size: 10.5px;
  color: var(--c-text-3);
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  gap: 2px;
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--c-text-2);
  white-space: nowrap;
  transition: all 0.18s;
}

.nav-item:hover {
  color: var(--c-brand);
  background: var(--c-brand-dim);
}

.nav-item.on {
  color: #fff;
  background: var(--c-brand);
}

html.dark .nav-item.on {
  color: #12301f;
}

.theme-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-2);
  font-size: 15px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: all 0.18s;
}

.theme-btn:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

@media (max-width: 900px) {
  .brand-txt em {
    display: none;
  }

  .hdr-inner {
    gap: 12px;
  }

  .nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  .hdr {
    height: auto;
  }

  .hdr-inner {
    flex-wrap: wrap;
    padding-top: 10px;
    padding-bottom: 10px;
    gap: 8px;
  }

  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
  }

  .theme-btn {
    margin-left: auto;
  }
}
</style>