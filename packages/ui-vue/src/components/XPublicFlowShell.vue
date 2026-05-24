<script setup lang="ts">
export type XPublicFlowStep = {
  label: string
  state?: 'done' | 'active' | 'pending' | 'error'
}

export type XPublicFlowContextItem = {
  label: string
  value: string
}

export type XPublicFlowSecurityItem = {
  label: string
  description?: string
}

export type XPublicFlowStatusVariant = 'info' | 'success' | 'warning' | 'danger' | 'muted'

withDefaults(
  defineProps<{
    brandName?: string
    eyebrow?: string
    title: string
    subtitle?: string
    statusLabel?: string
    statusVariant?: XPublicFlowStatusVariant
    steps?: XPublicFlowStep[]
    contextItems?: XPublicFlowContextItem[]
    securityItems?: XPublicFlowSecurityItem[]
  }>(),
  {
    brandName: 'Cogneris',
    eyebrow: '',
    subtitle: '',
    statusLabel: 'Protected link',
    statusVariant: 'info',
    steps: () => [],
    contextItems: () => [],
    securityItems: () => [],
  }
)
</script>

<template>
  <section class="x-public-flow">
    <div class="x-public-flow__ambient x-public-flow__ambient--one" aria-hidden="true"></div>
    <div class="x-public-flow__ambient x-public-flow__ambient--two" aria-hidden="true"></div>

    <header class="x-public-flow__header">
      <div class="x-public-flow__brand">
        <span class="x-public-flow__mark" aria-hidden="true"></span>
        <span>{{ brandName }}</span>
      </div>
      <span class="x-public-flow__status" :class="`x-public-flow__status--${statusVariant}`">
        {{ statusLabel }}
      </span>
    </header>

    <div class="x-public-flow__grid">
      <main class="x-public-flow__main" aria-labelledby="x-public-flow-title">
        <p v-if="eyebrow" class="x-public-flow__eyebrow">{{ eyebrow }}</p>
        <h1 id="x-public-flow-title" class="x-public-flow__title">{{ title }}</h1>
        <p v-if="subtitle" class="x-public-flow__subtitle">{{ subtitle }}</p>

        <div class="x-public-flow__content">
          <slot />
        </div>

        <div v-if="$slots.actions" class="x-public-flow__actions">
          <slot name="actions" />
        </div>

        <footer v-if="$slots.footer" class="x-public-flow__footer">
          <slot name="footer" />
        </footer>
      </main>

      <aside class="x-public-flow__rail" aria-label="Public flow details">
        <div v-if="steps.length" class="x-public-flow__rail-section">
          <p class="x-public-flow__rail-label">Progress</p>
          <ol class="x-public-flow__steps">
            <li
              v-for="step in steps"
              :key="step.label"
              class="x-public-flow__step"
              :class="`x-public-flow__step--${step.state || 'pending'}`"
            >
              <span class="x-public-flow__step-dot" aria-hidden="true"></span>
              <span>{{ step.label }}</span>
            </li>
          </ol>
        </div>

        <div v-if="securityItems.length" class="x-public-flow__rail-section">
          <p class="x-public-flow__rail-label">Security</p>
          <ul class="x-public-flow__security">
            <li
              v-for="item in securityItems"
              :key="item.label"
              class="x-public-flow__security-item"
            >
              <strong>{{ item.label }}</strong>
              <span v-if="item.description">{{ item.description }}</span>
            </li>
          </ul>
        </div>

        <div v-if="contextItems.length" class="x-public-flow__rail-section">
          <p class="x-public-flow__rail-label">Context</p>
          <dl class="x-public-flow__context">
            <div
              v-for="item in contextItems"
              :key="item.label"
              class="x-public-flow__context-item"
            >
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <slot name="aside" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.x-public-flow {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px;
  background-color: var(--surface-page, #fbfaff);
  background:
    radial-gradient(circle at 8% 12%, rgba(88, 28, 255, 0.16), transparent 30%),
    radial-gradient(circle at 92% 18%, rgba(0, 210, 255, 0.18), transparent 26%),
    linear-gradient(
      135deg,
      var(--surface-page, #fbfaff) 0%,
      var(--surface-muted, #f5f2ff) 58%,
      var(--surface-card, #ffffff) 100%
    );
  color: var(--text-primary, #0c0d18);
}

.x-public-flow__ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(16px);
  pointer-events: none;
  opacity: 0.65;
}

.x-public-flow__ambient--one {
  width: 220px;
  height: 220px;
  left: -80px;
  bottom: 16%;
  background: rgba(88, 28, 255, 0.18);
}

.x-public-flow__ambient--two {
  width: 180px;
  height: 180px;
  right: -60px;
  top: 18%;
  background: rgba(0, 210, 255, 0.22);
}

.x-public-flow__header,
.x-public-flow__grid {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.x-public-flow__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.x-public-flow__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.x-public-flow__mark {
  width: 30px;
  height: 30px;
  border-radius: 11px;
  background: var(
    --brand-gradient,
    linear-gradient(135deg, var(--color-primary, #581cff), var(--color-accent, #00d2ff))
  );
  box-shadow: 0 18px 35px -20px rgba(88, 28, 255, 0.9);
}

.x-public-flow__status {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border-subtle, #e8e3f5);
  border-radius: var(--radius-pill, 999px);
  background: var(--surface-card, #ffffff);
  color: var(--text-muted, #6b6783);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.x-public-flow__status--success {
  color: var(--color-success, #0e7c3a);
  background: var(--color-success-soft, rgba(14, 124, 58, 0.1));
}

.x-public-flow__status--warning {
  color: var(--color-warning, #c27803);
  background: var(--color-warning-soft, rgba(194, 120, 3, 0.1));
}

.x-public-flow__status--danger {
  color: var(--color-danger, #cd3d64);
  background: var(--color-danger-soft, rgba(205, 61, 100, 0.1));
}

.x-public-flow__status--info {
  color: var(--color-info, #2563eb);
  background: var(--color-info-soft, rgba(37, 99, 235, 0.1));
}

.x-public-flow__status--muted {
  color: var(--text-muted, #6b6783);
}

.x-public-flow__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 22px;
  align-items: start;
}

.x-public-flow__main,
.x-public-flow__rail {
  border: 1px solid var(--border-subtle, #e8e3f5);
  border-radius: var(--radius-lg, 24px);
  background: var(--surface-card, #ffffff);
  box-shadow: var(--shadow-card, 0 20px 60px -28px rgba(60, 22, 180, 0.18));
}

.x-public-flow__main {
  min-width: 0;
  padding: clamp(22px, 4vw, 38px);
}

.x-public-flow__eyebrow,
.x-public-flow__rail-label {
  margin: 0 0 10px;
  color: var(--color-primary, #581cff);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.x-public-flow__title {
  margin: 0;
  max-width: 760px;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 0.96;
  letter-spacing: -0.07em;
}

.x-public-flow__subtitle {
  margin: 16px 0 0;
  max-width: 680px;
  color: var(--text-muted, #6b6783);
  font-size: clamp(1rem, 2vw, 1.14rem);
  line-height: 1.65;
}

.x-public-flow__content {
  margin-top: 28px;
}

.x-public-flow__actions,
.x-public-flow__footer {
  margin-top: 24px;
}

.x-public-flow__footer {
  color: var(--text-muted, #6b6783);
  font-size: 0.9rem;
}

.x-public-flow__rail {
  position: sticky;
  top: 22px;
  padding: 20px;
}

.x-public-flow__rail-section + .x-public-flow__rail-section {
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid var(--border-subtle, #e8e3f5);
}

.x-public-flow__steps,
.x-public-flow__security {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.x-public-flow__step {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted, #6b6783);
  font-size: 14px;
  font-weight: 700;
}

.x-public-flow__step-dot {
  width: 12px;
  height: 12px;
  border: 2px solid var(--border-strong, #d8d2eb);
  border-radius: 50%;
  background: var(--surface-card, #ffffff);
}

.x-public-flow__step--done .x-public-flow__step-dot,
.x-public-flow__step--active .x-public-flow__step-dot {
  border-color: var(--color-primary, #581cff);
  background: var(--color-primary, #581cff);
}

.x-public-flow__step--active {
  color: var(--text-primary, #0c0d18);
}

.x-public-flow__step--error .x-public-flow__step-dot {
  border-color: var(--color-danger, #cd3d64);
  background: var(--color-danger, #cd3d64);
}

.x-public-flow__security-item {
  display: grid;
  gap: 3px;
  padding: 12px;
  border-radius: var(--radius-md, 16px);
  background: var(--surface-muted, #f5f2ff);
}

.x-public-flow__security-item strong {
  font-size: 13px;
}

.x-public-flow__security-item span {
  color: var(--text-muted, #6b6783);
  font-size: 12px;
  line-height: 1.45;
}

.x-public-flow__context {
  display: grid;
  gap: 10px;
  margin: 0;
}

.x-public-flow__context-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle, #e8e3f5);
}

.x-public-flow__context-item dt {
  color: var(--text-muted, #6b6783);
  font-size: 12px;
}

.x-public-flow__context-item dd {
  margin: 0;
  color: var(--text-primary, #0c0d18);
  font-size: 12px;
  font-weight: 800;
  text-align: right;
  overflow-wrap: anywhere;
}

@media (max-width: 860px) {
  .x-public-flow {
    padding: 18px;
  }

  .x-public-flow__header {
    margin-bottom: 18px;
  }

  .x-public-flow__grid {
    grid-template-columns: 1fr;
  }

  .x-public-flow__rail {
    position: static;
    order: -1;
  }
}
</style>
