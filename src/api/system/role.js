import request from '@/utils/request'

// コーナーリストをクエリします
export function listRole(query) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query
  })
}

// クエリロールの詳細
export function getRole(roleId) {
  return request({
    url: '/system/role/' + roleId,
    method: 'get'
  })
}

// 新しい役割
export function addRole(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data: data
  })
}

// 役割を変更します
export function updateRole(data) {
  return request({
    url: '/system/role',
    method: 'put',
    data: data
  })
}

// ロールデータの権限
export function dataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data
  })
}

// 文字ステータスの変更
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 役割を削除します
export function delRole(roleId) {
  return request({
    url: '/system/role/' + roleId,
    method: 'delete'
  })
}

// ユーザーの役割がユーザーリストを承認しました
export function allocatedUserList(query) {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  })
}

// キャラクターの不正なユーザーリストの役割を照会する
export function unallocatedUserList(query) {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  })
}

// ユーザーの承認された役割をキャンセルします
export function authUserCancel(data) {
  return request({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data: data
  })
}

// 批量ユーザーの承認された役割をキャンセルします
export function authUserCancelAll(data) {
  return request({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data
  })
}

// 許可されたユーザー選択
export function authUserSelectAll(data) {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  })
}

// 役割によるとIDクエリ部門のツリー構造
export function deptTreeSelect(roleId) {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  })
}
