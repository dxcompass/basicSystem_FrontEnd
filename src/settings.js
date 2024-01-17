export default {
  /**
   * Webタイトル
   */
  title: import.meta.env.VITE_APP_TITLE,
  /**
   * サイドバーテー​​マ 暗いテーマtheme-dark，明るい色のテーマtheme-light
   */
  sideTheme: 'theme-dark',
  /**
   * システムレイアウト構成かどうか
   */
  showSettings: true,

  /**
   * トップナビゲーションを表示するかどうか
   */
  topNav: false,

  /**
   * 表示するかどうか tagsView
   */
  tagsView: true,

  /**
   * 頭を固定するかどうか
   */
  fixedHeader: false,

  /**
   * 表示するかどうかlogo
   */
  sidebarLogo: true,

  /**
   * 表示するかどうか动态标题
   */
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
