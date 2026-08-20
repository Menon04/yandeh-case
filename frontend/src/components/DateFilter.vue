<template>
  <div class="date-filter">
    <div class="date-filter__field">
      <label for="from" class="date-filter__label">De</label>
      <input
        id="from"
        v-model="from"
        type="date"
        class="input"
        @change="handleChange"
      />
    </div>
    <div class="date-filter__field">
      <label for="to" class="date-filter__label">Até</label>
      <input
        id="to"
        v-model="to"
        type="date"
        class="input"
        @change="handleChange"
      />
    </div>
    <button
      v-if="from || to"
      class="btn btn--ghost btn--sm"
      @click="clearFilter"
    >
      Limpar
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'filter-change': [{ from?: string; to?: string }]
}>()

const from = ref('')
const to = ref('')

function handleChange() {
  emit('filter-change', {
    from: from.value || undefined,
    to: to.value || undefined,
  })
}

function clearFilter() {
  from.value = ''
  to.value = ''
  emit('filter-change', {})
}
</script>

<style scoped>
.date-filter {
  display: flex;
  gap: var(--space-md);
  align-items: flex-end;
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.date-filter__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.date-filter__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-filter .input {
  width: 160px;
}

@media (max-width: 768px) {
  .date-filter {
    flex-wrap: wrap;
  }

  .date-filter__field {
    flex: 1;
    min-width: 140px;
  }

  .date-filter .input {
    width: 100%;
  }
}
</style>
