<template>
  <div class="tt-editor" ref="editorRef" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { timeTableGrammar, timeTableHighlight } from './grammar'

const props = defineProps<{ modelValue: string}>()
const emit = defineEmits<{
  'update:model-value': [modelValue: string]
}>()

const editorRef = ref<HTMLDivElement>()
let editorRaw: EditorView | undefined = undefined

onMounted(() => {
  if (editorRef.value) {
    editorRaw = new EditorView({
      doc: props.modelValue,
      parent: editorRef.value,
      extensions: [basicSetup, EditorView.lineWrapping, EditorView.updateListener.of((viewUpdate) => {
        if (viewUpdate.docChanged) {
          emit('update:model-value', viewUpdate.state.doc.toString())
        }
      }), oneDark, timeTableGrammar, timeTableHighlight]
    })
  }
})

watch(() => props.modelValue, (value) => {
  if (editorRaw) {
    if (value !== editorRaw.state.doc.toString()) {
      editorRaw.dispatch({
        changes: {
          from: 0,
          to: editorRaw.state.doc.length,
          insert: value
        }
      })
    }
  }
}, { immediate: true })
</script>
