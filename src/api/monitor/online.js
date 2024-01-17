import request from '@/utils/request'

// クエリオンラインユーザーリスト
export function list(query) {
  return request({
    url: '/monitor/online/list',
    method: 'get',
    params: query
  })
}

// 強力な退職ユーザー
export function forceLogout(tokenId) {
  return request({
    url: '/monitor/online/' + tokenId,
    method: 'delete'
  })
}
