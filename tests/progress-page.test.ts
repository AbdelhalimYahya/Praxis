import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import ProgressPage from '../pages/progress.vue'
import { useProgressStore } from '~/stores/progress.store'

const nuxtLinkStub = {
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

const confirmMock = vi.fn(() => true)
vi.stubGlobal('confirm', confirmMock)

describe('progress page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    confirmMock.mockClear()
    confirmMock.mockReturnValue(true)
    setActivePinia(createPinia())
  })

  it('aggregates progress live and resets it on confirmation', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useProgressStore()
    store.recordAttempt('js-v-01', 'verbal', 80, 'draft answer')
    const wrapper = mount(ProgressPage, {
      global: { plugins: [pinia], stubs: { NuxtLink: nuxtLinkStub } },
    })

    expect(wrapper.text()).toContain('Your progress')
    expect(wrapper.text()).toContain('What is a closure in JavaScript?')
    expect(wrapper.text()).toContain('80%')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(confirmMock).toHaveBeenCalled()
    expect(store.storage).toEqual({})
    expect(wrapper.text()).toContain('No questions attempted yet')
    wrapper.unmount()
  })
})
