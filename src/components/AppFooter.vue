<script setup lang="ts">
import { sources } from '../data/market'
</script>

<template>
  <footer class="ft">
    <div class="shell ft-inner">
      <div class="ft-top">
        <div class="ft-about">
          <h4>关于本站</h4>
          <p>
            基于公开资料整理的国内二次元游戏厂商与产品对比图谱，使用 Vue 3 + Vite + TypeScript 构建。
            厂商梯队为编辑判断，非官方排名；流水数据为第三方估算，仅供结构参考。
          </p>
        </div>
        <div class="ft-src">
          <h4>资料来源</h4>
          <ul>
            <li v-for="s in sources" :key="s.url">
              <a :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.title }}</a>
              <span class="meta">{{ s.publisher }} · {{ s.date }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="ft-bottom">
        <span>数据截至 2026-11-07 · 仅供学习与行业观察使用</span>
        <span class="powered">Built with Vue 3 · Vite · TypeScript</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  padding: 36px 0 28px;
}

.ft-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 40px;
}

h4 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-text-3);
  margin-bottom: 12px;
  font-family: var(--font-mono);
}

.ft-about p {
  font-size: 13px;
  color: var(--c-text-2);
  line-height: 1.8;
  max-width: 420px;
}

.ft-src ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.ft-src li {
  font-size: 12.5px;
  line-height: 1.6;
}

.ft-src a {
  color: var(--c-text-2);
}

.ft-src a:hover {
  color: var(--c-brand);
}

.meta {
  display: block;
  color: var(--c-text-3);
  font-size: 11px;
  font-family: var(--font-mono);
}

.ft-bottom {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--c-border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--c-text-3);
}

.powered {
  font-family: var(--font-mono);
  color: var(--c-brand);
}

@media (max-width: 768px) {
  .ft-top {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>