import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../components/coding/CodeEditor.vue'

vi.mock('@guolao/vue-monaco-editor', () => ({
  VueMonacoEditor: {
    name: 'VueMonacoEditor',
    props: ['value', 'language', 'theme', 'options', 'width', 'height'],
    emits: ['update:value'],
    template: '<div class="monaco-stub" />',
  },
}))

describe('CodeEditor', () => {
  it('passes code, language, and theme through to Monaco', () => {
    const wrapper = mount(CodeEditor, {
      props: { code: 'const answer = 1', language: 'javascript', dark: true, height: '500px' },
    })
    const editor = wrapper.getComponent({ name: 'VueMonacoEditor' })

    expect(editor.props('value')).toBe('const answer = 1')
    expect(editor.props('language')).toBe('javascript')
    expect(editor.props('theme')).toBe('vs-dark')
    expect(editor.props('height')).toBe('500px')
  })

  it('emits code updates from the editor', async () => {
    const wrapper = mount(CodeEditor, {
      props: { code: 'const answer = 1', language: 'javascript' },
    })

    await wrapper.getComponent({ name: 'VueMonacoEditor' }).vm.$emit('update:value', 'const answer = 2')
    expect(wrapper.emitted('update:code')).toEqual([['const answer = 2']])
  })
})
