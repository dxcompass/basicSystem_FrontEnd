import useTagsViewStore from '@/store/modules/tagsView'
import router from '@/router'

export default {
  // 電流を更新しますtabブックマーク
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute.value;
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query };
          }
        }
      });
    }
    return useTagsViewStore().delCachedView(obj).then(() => {
      const { path, query } = obj
      router.replace({
        path: '/redirect' + path,
        query: query
      })
    })
  },
  // 電流を閉じますtabブックマーク，開ける新ブックマーク
  closeOpenPage(obj) {
    useTagsViewStore().delView(router.currentRoute.value);
    if (obj !== undefined) {
      return router.push(obj);
    }
  },
  // 閉じる指定しますtabブックマーク
  closePage(obj) {
    if (obj === undefined) {
      return useTagsViewStore().delView(router.currentRoute.value).then(({ visitedViews }) => {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return router.push(latestView.fullPath)
        }
        return router.push('/');
      });
    }
    return useTagsViewStore().delView(obj);
  },
  // すべてを閉じますtabブックマーク
  closeAllPage() {
    return useTagsViewStore().delAllViews();
  },
  // 左側を閉じますtabブックマーク
  closeLeftPage(obj) {
    return useTagsViewStore().delLeftTags(obj || router.currentRoute.value);
  },
  // 右側をオフにしますtabブックマーク
  closeRightPage(obj) {
    return useTagsViewStore().delRightTags(obj || router.currentRoute.value);
  },
  // もう一方を閉じますtabブックマーク
  closeOtherPage(obj) {
    return useTagsViewStore().delOthersViews(obj || router.currentRoute.value);
  },
  // 開けるtabブックマーク
  openPage(url) {
    return router.push(url);
  },
  // 改訂tabブックマーク
  updatePage(obj) {
    return useTagsViewStore().updateVisitedView(obj);
  }
}
