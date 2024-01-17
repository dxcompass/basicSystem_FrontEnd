import request from '@/utils/request'

// テーブルデータの生成クエリ
export function listTable(query) {
  return request({
    url: '/tool/gen/list',
    method: 'get',
    params: query
  })
}
// お問い合わせくださいdbデータベースリスト
export function listDbTable(query) {
  return request({
    url: '/tool/gen/db/list',
    method: 'get',
    params: query
  })
}

// お問い合わせください表详细信息
export function getGenTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'get'
  })
}

// 修改コード生成信息
export function updateGenTable(data) {
  return request({
    url: '/tool/gen',
    method: 'put',
    data: data
  })
}

// インポートテーブル
export function importTable(data) {
  return request({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data
  })
}

// 预览生成コード
export function previewTable(tableId) {
  return request({
    url: '/tool/gen/preview/' + tableId,
    method: 'get'
  })
}

// テーブルデータを削除します
export function delTable(tableId) {
  return request({
    url: '/tool/gen/' + tableId,
    method: 'delete'
  })
}

// 生成コード（カスタムパス）
export function genCode(tableName) {
  return request({
    url: '/tool/gen/genCode/' + tableName,
    method: 'get'
  })
}

// 同期データベース
export function synchDb(tableName) {
  return request({
    url: '/tool/gen/synchDb/' + tableName,
    method: 'get'
  })
}
