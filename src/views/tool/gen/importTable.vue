<template>
  <!-- インポートテーブル -->
  <el-dialog title="インポートテーブル" v-model="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="テーブル名" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="テーブル名を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表の説明" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="表の説明を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
        <el-button icon="Refresh" @click="resetQuery">再読み込み</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="テーブル名" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="表の説明" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="作成時間"></el-table-column>
        <el-table-column prop="updateTime" label="更新時間"></el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">確認</el-button>
        <el-button @click="visible = false">キャンセル</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { listDbTable, importTable } from "@/api/tool/gen";

const total = ref(0);
const visible = ref(false);
const tables = ref([]);
const dbTableList = ref([]);
const { proxy } = getCurrentInstance();

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined
});

const emit = defineEmits(["ok"]);

/** クエリパラメーターリスト */
function show() {
  getList();
  visible.value = true;
}
/** クリックして選択します */
function clickRow(row) {
  proxy.$refs.table.toggleRowSelection(row);
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  tables.value = selection.map(item => item.tableName);
}
/** クエリテーブルデータ */
function getList() {
  listDbTable(queryParams).then(res => {
    dbTableList.value = res.rows;
    total.value = res.total;
  });
}
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** 再読み込みボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** インポートボタン操作 */
function handleImportTable() {
  const tableNames = tables.value.join(",");
  if (tableNames == "") {
    proxy.$modal.msgError("インポートするテーブルを選択してください");
    return;
  }
  importTable({ tables: tableNames }).then(res => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit("ok");
    }
  });
}

defineExpose({
  show,
});
</script>
