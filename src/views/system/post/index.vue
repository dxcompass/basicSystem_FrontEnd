<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="ジョブコード" prop="postCode">
            <el-input
               v-model="queryParams.postCode"
               placeholder="ジョブコードを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ポジションタイトル" prop="postName">
            <el-input
               v-model="queryParams.postName"
               placeholder="ポジションタイトルを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="岗位ステータス" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">再読み込み</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:post:add']"
            >増加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:post:edit']"
            >改訂</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:post:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:post:export']"
            >出力</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ジョブ番号" align="center" prop="postId" />
         <el-table-column label="ジョブコード" align="center" prop="postCode" />
         <el-table-column label="ポジションタイトル" align="center" prop="postName" />
         <el-table-column label="ジョブソート" align="center" prop="postSort" />
         <el-table-column label="ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成時間" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="アクション" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:post:edit']">改訂</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:post:remove']">削除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- [投稿]ダイアログボックスを追加または放棄します -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="postRef" :model="form" :rules="rules" label-width="160px">
            <el-form-item label="ポジションタイトル" prop="postName">
               <el-input v-model="form.postName" placeholder="ポジションタイトルを入力してください" />
            </el-form-item>
            <el-form-item label="ジョブコード" prop="postCode">
               <el-input v-model="form.postCode" placeholder="コーディング名を入力してください" />
            </el-form-item>
            <el-form-item label="ジョブオーダー" prop="postSort">
               <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="岗位ステータス" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="備考" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="コンテンツを入力してください" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確認</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined
  },
  rules: {
    postName: [{ required: true, message: "ポジションタイトル不能为空", trigger: "blur" }],
    postCode: [{ required: true, message: "ジョブコード不能为空", trigger: "blur" }],
    postSort: [{ required: true, message: "ジョブオーダー不能为空", trigger: "blur" }],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** クエリ位置リスト */
function getList() {
  loading.value = true;
  listPost(queryParams.value).then(response => {
    postList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 選ぶ取り除くボタン */
function cancel() {
  open.value = false;
  reset();
}
/** 表单再読み込み */
function reset() {
  form.value = {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: "0",
    remark: undefined
  };
  proxy.resetForm("postRef");
}
/** 検索ボタンアクション */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 再読み込みボタンアクション */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.postId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 増加ボタンアクション */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "役職";
}
/** 改訂ボタンアクション */
function handleUpdate(row) {
  reset();
  const postId = row.postId || ids.value;
  getPost(postId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "投稿を修正します";
  });
}
/** [提案します]ボタン */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.postId != undefined) {
        updatePost(form.value).then(response => {
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        addPost(form.value).then(response => {
          proxy.$modal.msgSuccess("増加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 削除ボタンアクション */
function handleDelete(row) {
  const postIds = row.postId || ids.value;
  proxy.$modal.confirm('是否確かに认削除ジョブ番号为"' + postIds + '"データ項目？').then(function() {
    return delPost(postIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}
/** 出力ボタンアクション */
function handleExport() {
  proxy.download("system/post/export", {
    ...queryParams.value
  }, `post_${new Date().getTime()}.xlsx`);
}

getList();
</script>
