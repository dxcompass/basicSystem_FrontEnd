import request from '@/utils/request'

// クエリアナウンスリスト
export function listNotice(query) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: query
  })
}

// クエリアナウンスの詳細
export function getNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'get'
  })
}

// 新しい発表
export function addNotice(data) {
  return request({
    url: '/system/notice',
    method: 'post',
    data: data
  })
}

// 修正の発表
export function updateNotice(data) {
  return request({
    url: '/system/notice',
    method: 'put',
    data: data
  })
}

// 発表を削除します
export function delNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'delete'
  })
}