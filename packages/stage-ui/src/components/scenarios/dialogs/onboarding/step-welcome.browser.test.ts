import en from '@proj-airi/i18n/locales/en'

import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { createI18n } from 'vue-i18n'

import StepWelcome from './step-welcome.vue'

/** Creates the production English localization surface used by the onboarding welcome step. */
function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en,
    },
  })
}

/** Renders the welcome step with real Pinia and i18n plugins. */
async function renderWelcomeStep() {
  const onNext = vi.fn()
  const screen = await render(StepWelcome, {
    props: {
      onNext,
    },
    global: {
      directives: {
        motion: {},
      },
      plugins: [createPinia(), createTestI18n()],
    },
  })

  return { onNext, screen }
}

describe('onboarding welcome step', () => {
  // ROOT CAUSE:
  //
  // The welcome step used to render a "Sign in" action beside the provider
  // setup action (https://github.com/moeru-ai/airi/pull/2052). Moeka has no
  // sign-in service, so provider setup must stay the only action.
  it('offers provider setup as the only action', async () => {
    const { screen } = await renderWelcomeStep()

    await expect.element(screen.getByRole('button', { name: 'Setup with your provider' })).toBeVisible()
    expect(document.body.textContent).not.toContain('Sign in')
  })

  it('continues to provider setup when the setup action is selected', async () => {
    const { onNext, screen } = await renderWelcomeStep()

    await screen.getByRole('button', { name: 'Setup with your provider' }).click()

    expect(onNext).toHaveBeenCalledOnce()
  })
})
