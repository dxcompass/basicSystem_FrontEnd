import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

let loadingInstance;

export default {
  // 通知
  msg(content) {
    ElMessage.info(content)
  },
  // 間違った情報
  msgError(content) {
    ElMessage.error(content)
  },
  // 成功したニュース
  msgSuccess(content) {
    ElMessage.success(content)
  },
  // 警告メッセージ
  msgWarning(content) {
    ElMessage.warning(content)
  },
  // ポップアップ
  alert(content) {
    ElMessageBox.alert(content, "システムのヒント")
  },
  // エラーメッセージ
  alertError(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'error' })
  },
  // 成功したリマインダー
  alertSuccess(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'success' })
  },
  // 警告
  alertWarning(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'warning' })
  },
  // 通知プロンプト
  notify(content) {
    ElNotification.info(content)
  },
  // エラー通知
  notifyError(content) {
    ElNotification.error(content);
  },
  // 成功した通知
  notifySuccess(content) {
    ElNotification.success(content)
  },
  // 警告通知
  notifyWarning(content) {
    ElNotification.warning(content)
  },
  // ウィンドウを確認します
  confirm(content) {
    return ElMessageBox.confirm(content, "システムのヒント", {
      confirmButtonText: 'もちろん',
      cancelButtonText: 'キャンセル',
      type: "warning",
    })
  },
  // 送信コンテンツ
  prompt(content) {
    return ElMessageBox.prompt(content, "システムのヒント", {
      confirmButtonText: 'もちろん',
      cancelButtonText: 'キャンセル',
      type: "warning",
    })
  },
  // マスクレイヤーを開きます
  loading(content) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: "rgba(0, 0, 0, 0.7)",
    })
  },
  // マスクレイヤーをオフにします
  closeLoading() {
    loadingInstance.close();
  }
}
