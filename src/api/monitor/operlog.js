import request from '@/utils/request'

// クエリ操作ログリスト
export function list(query) {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  })
}

// 操作ログを削除します
export function delOperlog(operId) {
  return request({
    url: '/monitor/operlog/' + operId,
    method: 'delete'
  })
}

// 操作ログをクリアします
export function cleanOperlog() {
  return request({
    url: '/monitor/operlog/clean',
    method: 'delete'
  })
}
