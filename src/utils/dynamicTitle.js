import store from '@/store'
import defaultSettings from '@/settings'
import useSettingsStore from '@/store/modules/settings'

/**
 * 動的変更タイトル
 */
export function useDynamicTitle() {
  const settingsStore = useSettingsStore();
  if (settingsStore.dynamicTitle) {
    document.title = settingsStore.title + ' - ' + defaultSettings.title;
  } else {
    document.title = defaultSettings.title;
  }
}