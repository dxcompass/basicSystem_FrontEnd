import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: ルーティング構成アイテム
 *
 * hidden: true                     // 悩ませる true ルートがルートのサイドバーに表示されなくなったら のように401，login等しいページ，或者のように一些编辑页面/edit/1
 * alwaysShow: true                 // 以下のルーティングがあるとき children ステートメントのルーティングはより大きくなります1時間，自動的にネストされたパターンになります--のように组件页面
 *                                  // 只有一時間，サイドバーのルーティングルーティングとしてそのサブロージングが表示されます--のように引导页面
 *                                  // ルートの底を無視したい場合 children 宣言の数は、ルートルーティングを示しています
 *                                  // 設定できます alwaysShow: true，これにより、以前に定義されたルールが無視されます，常にルートルーティングを表示します
 * redirect: noRedirect             // 悩ませる noRedirect それがそうである場合、パンのふけナビゲーションでルートをクリックしてはいけません
 * name:'router-name'               // ルーティングの名前を設定します，必ず記入してください<keep-alive>常にさまざまな問題があります
 * query: '{"id": 1, "name": "ry"}' // ルートのデフォルト送信パラメーターにアクセスします
 * roles: ['admin', 'common']       // ルーティングの役割にアクセスします
 * permissions: ['a:a:a', 'b:b:b']  // ルーティングメニュー許可にアクセスしてください
 * meta : {
    noCache: true                   // のように果设置为true，いいえ。 <keep-alive> キャッシュ(デフォルト false)
    title: 'title'                  // サイドバーとパンのふけに表示される名前を設定します
    icon: 'svg-name'                // このルーティングのアイコンを設定します，対応するパスsrc/assets/icons/svg
    breadcrumb: false               // のように果设置为false，そこにはありませんbreadcrumbパン粉に表示されます
    activeMenu: '/system/user'      // ルートが設定されると、属性が設定されます，対応するサイドバーで高く表示されます。
  }
 */

// ルーティング
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/homepage',
    component: () => import('@/views/homepage'),
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: 'ダッシュボード', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: 'パーソナルセンター', icon: 'user' }
      }
    ]
  }
]

// 動的ルート，ロードするユーザー権限に基づく動的
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '役割の割り当て', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: 'ユーザーを割り当てます', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '辞書データ', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: 'スケジュールされたログ', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '生成構成を変更します', activeMenu: '/tool/gen' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
