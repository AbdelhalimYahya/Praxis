import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import AppHeader from '../components/layout/AppHeader.vue'

mockNuxtImport('useRoute', () => () => ({ path: '/' }))
mockNuxtImport('useColorMode', () => () => ({ value: 'light', preference: 'light' }))

function mountHeader() {
  return mount(AppHeader, {
    global: {
      stubs: {
        NuxtLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('AppHeader', () => {
  it('renders primary navigation links', () => {
    const wrapper = mountHeader()

    expect(wrapper.find('a[href="/"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/progress"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/about"]').exists()).toBe(true)
  })

  it('collapses and expands mobile navigation', async () => {
    const wrapper = mountHeader()
    const toggle = wrapper.get('button[aria-label="Toggle navigation menu"]')

    expect(wrapper.findAll('nav')).toHaveLength(1)
    await toggle.trigger('click')
    expect(wrapper.findAll('nav')).toHaveLength(2)
  })
})
