<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

onMounted(() => {
  nextTick(() => {
    // テーマスタイルを初期化します
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
