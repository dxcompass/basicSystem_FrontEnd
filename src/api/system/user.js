import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// クエリユーザーリスト
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// ユーザーの詳細をクエリします
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  })
}

// 新しい利用者
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data
  })
}

// ユーザーを変更します
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data: data
  })
}

// ユーザーを削除します
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}

// ユーザーパスワードリセット
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data
  })
}

// ユーザーステータスの変更
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  })
}

// ユーザーの個人情報をクエリします
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

// ユーザーを変更します个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  })
}

// ユーザーパスワードリセット
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data
  })
}

// ユーザーアバターアップロード
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  })
}

// クエリ承認された役割
export function getAuthRole(userId) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  })
}

// 承認された役割を保存します
export function updateAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  })
}

// お問い合わせ部門は木の木の構造をドロップダウンします
export function deptTreeSelect() {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  })
}
