import request from '@/utils/request'

// クエリメニューリスト
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}

// クエリメニュー詳細
export function getMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get'
  })
}

// クエリメニューツリー構造をプルダウンします
export function treeselect() {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  })
}

// 役割によるとIDクエリメニューツリー構造をプルダウンします
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}

// 新しいメニュー
export function addMenu(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data: data
  })
}

// メニューを変更します
export function updateMenu(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data: data
  })
}

// メニューを削除します
export function delMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete'
  })
}