<template>
  <div class="price-tier-table">
    <div class="price-tier-table__header">
      <span class="price-tier-table__label">Qtd</span>
      <span class="price-tier-table__label">Preço unit.</span>
    </div>
    <div class="price-tier-table__rows">
      <div
        v-for="tier in sortedTiers"
        :key="tier.id"
        class="price-tier-table__row"
      >
        <span class="price-tier-table__range tabular-nums">
          {{ formatRange(tier.minQty, tier.maxQty) }}
        </span>
        <span class="price-tier-table__price tabular-nums">
          {{ formatPrice(tier.price) }}
        </span>
      </div>
    </div>
    <div class="price-tier-table__graph">
      <div
        v-for="(tier, index) in sortedTiers"
        :key="tier.id"
        class="price-tier-table__bar"
        :style="{
          height: `${getBarHeight(tier.price)}%`,
          background: getBarColor(index),
        }"
        :title="`${formatRange(tier.minQty, tier.maxQty)}: ${formatPrice(tier.price)}`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PriceTier } from '@/types'

const props = defineProps<{
  tiers: PriceTier[]
}>()

const sortedTiers = computed(() =>
  [...props.tiers].sort((a, b) => a.minQty - b.minQty)
)

function formatRange(min: number, max: number | null): string {
  if (max === null) {
    return `${min}+`
  }
  return `${min}–${max}`
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getBarHeight(price: number): number {
  const prices = sortedTiers.value.map((t) => t.price)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const range = maxPrice - minPrice || 1
  
  const normalized = (price - minPrice) / range
  return 30 + normalized * 70
}

function getBarColor(index: number): string {
  const colors = ['#9FF558', '#B8F558', '#D0F558', '#E0F558']
  return colors[index % colors.length]
}
</script>

<style scoped>
.price-tier-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.price-tier-table__header {
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-xs);
}

.price-tier-table__label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-tier-table__rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-tier-table__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
}

.price-tier-table__range {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.price-tier-table__price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.price-tier-table__graph {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 40px;
  padding: var(--space-sm) var(--space-xs) 0;
  border-top: 1px solid var(--border-subtle);
  margin-top: var(--space-xs);
}

.price-tier-table__bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
  min-height: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .price-tier-table__bar {
    transition: none;
  }
}
</style>
