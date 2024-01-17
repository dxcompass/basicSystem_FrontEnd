import request from '@/utils/request'

// クエリ辞書タイプリスト
export function listType(query) {
  return request({
    url: '/system/dict/type/list',
    method: 'get',
    params: query
  })
}

// クエリ辞書タイプ詳細
export function getType(dictId) {
  return request({
    url: '/system/dict/type/' + dictId,
    method: 'get'
  })
}

// 新しい辞書タイプ
export function addType(data) {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data: data
  })
}

// 辞書タイプを変更します
export function updateType(data) {
  return request({
    url: '/system/dict/type',
    method: 'put',
    data: data
  })
}

// 辞書タイプを削除します
export function delType(dictId) {
  return request({
    url: '/system/dict/type/' + dictId,
    method: 'delete'
  })
}

// 辞書キャッシュを更新します
export function refreshCache() {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  })
}

// 辞書選択ボックスリストを取得します
export function optionselect() {
  return request({
    url: '/system/dict/type/optionselect',
    method: 'get'
  })
}
