<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import HeroSection from './components/HeroSection.vue'
import OverviewSection from './components/OverviewSection.vue'
import VendorsSection from './components/VendorsSection.vue'
import GamesSection from './components/GamesSection.vue'
import MarketSection from './components/MarketSection.vue'
import CalendarSection from './components/CalendarSection.vue'
import { vendors } from './data/vendors'
import { games } from './data/games'
import type { TabId } from './data/types'

const activeTab = ref<TabId>('overview')
const dark = ref(false)
const vendorFilter = ref('')

const stats = computed(() => ({
  vendors: vendors.length,
  games: games.length,
  live: games.filter((g) => g.status === '运营中').length,
  upcoming: games.filter((g) => g.status === '即将上线' || g.status === '在研').length,
}))

function openVendorGames(id: string) {
  vendorFilter.value = id
  activeTab.value = 'games'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetVendorFilter() {
  vendorFilter.value = ''
}

watch(activeTab, (tab) => {
  if (tab !== 'games') vendorFilter.value = ''
})

watch(
  dark,
  (v) => {
    document.documentElement.classList.toggle('dark', v)
    localStorage.setItem('ag-theme', v ? 'dark' : 'light')
  },
  { immediate: true },
)

onMounted(() => {
  const saved = localStorage.getItem('ag-theme')
  if (saved) dark.value = saved === 'dark'
  else dark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
})
</script>

<template>
  <AppHeader v-model:tab="activeTab" v-model:dark="dark" />

  <main class="page-main">
    <HeroSection v-if="activeTab === 'overview'" :stats="stats" @go="activeTab = $event" />

    <div class="shell">
      <OverviewSection v-if="activeTab === 'overview'" @go="activeTab = $event" />
      <VendorsSection v-else-if="activeTab === 'vendors'" @select="openVendorGames" />
      <GamesSection
        v-else-if="activeTab === 'games'"
        :preset-vendor="vendorFilter"
        @clear-preset="resetVendorFilter"
      />
      <MarketSection v-else-if="activeTab === 'market'" />
      <CalendarSection v-else />
    </div>
  </main>

  <AppFooter />
</template>

<style scoped>
.page-main {
  padding-top: 32px;
}
</style>