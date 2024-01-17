import request from '@/utils/request'

// クエリ辞書データリスト
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// クエリ辞書データの詳細
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 辞書の種類に従って辞書データ情報を確認してください
export function getDicts(dictType) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新しい辞書データ
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 辞書データを変更します
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 辞書データを削除します
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}
