<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">
          {{ product ? 'Editar Produto' : 'Novo Produto' }}
        </h2>
        <button class="modal__close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal__body">
        <div class="form-field">
          <label class="form-field__label" for="name">Nome</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="input"
            required
          />
        </div>

        <div class="form-field">
          <label class="form-field__label" for="description">Descrição</label>
          <textarea
            id="description"
            v-model="form.description"
            class="input"
            rows="3"
          ></textarea>
        </div>

        <div class="form-field">
          <label class="form-field__label">Faixas de Preço</label>
          <div class="price-tiers">
            <div
              v-for="(tier, index) in form.priceTiers"
              :key="index"
              class="price-tier-row"
            >
              <div class="price-tier-row__inputs">
                <div class="form-field form-field--small">
                  <label class="form-field__label">Qtd Mínima</label>
                  <input
                    v-model.number="tier.minQty"
                    type="number"
                    min="1"
                    class="input"
                    required
                  />
                </div>
                <div class="form-field form-field--small">
                  <label class="form-field__label">Qtd Máxima</label>
                  <input
                    v-model.number="tier.maxQty"
                    type="number"
                    min="1"
                    class="input"
                    placeholder="∞"
                  />
                </div>
                <div class="form-field form-field--small">
                  <label class="form-field__label">Preço (R$)</label>
                  <input
                    v-model.number="tier.price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="input"
                    required
                  />
                </div>
              </div>
              <button
                v-if="form.priceTiers.length > 1"
                type="button"
                class="btn btn--ghost btn--sm"
                @click="removeTier(index)"
              >
                Remover
              </button>
            </div>
            <button
              type="button"
              class="btn btn--secondary btn--sm"
              @click="addTier"
            >
              + Adicionar Faixa
            </button>
          </div>
        </div>

        <div class="modal__footer">
          <button type="button" class="btn btn--ghost" @click="$emit('close')">
            Cancelar
          </button>
          <button type="submit" class="btn btn--primary">
            {{ product ? 'Salvar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '@/types'

const props = defineProps<{
  product: Product | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: { name: string; description: string; priceTiers: any[] }]
}>()

const form = ref({
  name: '',
  description: '',
  priceTiers: [{ minQty: 1, maxQty: null as number | null, price: 0 }],
})

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      form.value = {
        name: newProduct.name,
        description: newProduct.description || '',
        priceTiers: newProduct.priceTiers.map((tier) => ({
          minQty: tier.minQty,
          maxQty: tier.maxQty,
          price: tier.price,
        })),
      }
    } else {
      form.value = {
        name: '',
        description: '',
        priceTiers: [{ minQty: 1, maxQty: null, price: 0 }],
      }
    }
  },
  { immediate: true }
)

function addTier() {
  const lastTier = form.value.priceTiers[form.value.priceTiers.length - 1]
  form.value.priceTiers.push({
    minQty: (lastTier.maxQty || lastTier.minQty) + 1,
    maxQty: null,
    price: 0,
  })
}

function removeTier(index: number) {
  form.value.priceTiers.splice(index, 1)
}

function handleSubmit() {
  emit('save', {
    name: form.value.name,
    description: form.value.description,
    priceTiers: form.value.priceTiers.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty,
      price: tier.price,
    })),
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-subtle);
}

.modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal__close {
  font-size: 1.5rem;
  color: var(--text-tertiary);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__close:hover {
  color: var(--text-primary);
}

.modal__body {
  padding: var(--space-lg);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-subtle);
}

.form-field {
  margin-bottom: var(--space-lg);
}

.form-field--small {
  flex: 1;
}

.form-field__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.price-tiers {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.price-tier-row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
}

.price-tier-row__inputs {
  display: flex;
  gap: var(--space-md);
  flex: 1;
}

textarea.input {
  resize: vertical;
  font-family: inherit;
}
</style>
