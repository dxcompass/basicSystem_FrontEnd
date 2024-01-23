<template>
   <div class="app-container">
      <el-row :gutter="20">
         <!--部門データ-->
         <el-col :span="4" :xs="24">
            <div class="head-container">
               <el-input
                  v-model="deptName"
                  placeholder="部門の名前を入力してください"
                  clearable
                  prefix-icon="Search"
                  style="margin-bottom: 20px"
               />
            </div>
            <div class="head-container">
               <el-tree
                  :data="deptOptions"
                  :props="{ label: 'label', children: 'children' }"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="deptTreeRef"
                  node-key="id"
                  highlight-current
                  default-expand-all
                  @node-click="handleNodeClick"
               />
            </div>
         </el-col>
         <!--ユーザーデータ-->
         <el-col :span="20" :xs="24">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
               <el-form-item label="ユーザー名" prop="userName">
                  <el-input
                     v-model="queryParams.userName"
                     placeholder="入ってくださいユーザー名"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="電話番号" prop="phonenumber">
                  <el-input
                     v-model="queryParams.phonenumber"
                     placeholder="入ってください電話番号"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="ステータス" prop="status">
                  <el-select
                     v-model="queryParams.status"
                     placeholder="用户ステータス"
                     clearable
                     style="width: 240px"
                  >
                     <el-option
                        v-for="dict in sys_normal_disable"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                     />
                  </el-select>
               </el-form-item>
               <el-form-item label="作成時間" style="width: 308px;">
                  <el-date-picker
                     v-model="dateRange"
                     value-format="YYYY-MM-DD"
                     type="daterange"
                     range-separator="-"
                     start-placeholder="開始日"
                     end-placeholder="終了日"
                  ></el-date-picker>
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
                     v-hasPermi="['system:user:add']"
                  >増加</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:user:edit']"
                  >改訂</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:user:remove']"
                  >削除</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="info"
                     plain
                     icon="Upload"
                     @click="handleImport"
                     v-hasPermi="['system:user:import']"
                  >輸入</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="warning"
                     plain
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['system:user:export']"
                  >出力</el-button>
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="ユーザーID" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
               <el-table-column label="ユーザー名" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
               <el-table-column label="ユーザーのニックネーム" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
               <el-table-column label="部門" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
               <el-table-column label="電話番号" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
               <el-table-column label="ステータス" align="center" key="status" v-if="columns[5].visible">
                  <template #default="scope">
                     <el-switch
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="作成時間" align="center" prop="createTime" v-if="columns[6].visible" width="160">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="アクション" align="center" width="150" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-tooltip content="改訂" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="削除" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="再読み込み密码" placement="top" v-if="scope.row.userId !== 1">
                         <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="役割の割り当て" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
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
         </el-col>
      </el-row>

      <!-- 添加または改訂用户配置对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="ユーザーのニックネーム" prop="nickName">
                     <el-input v-model="form.nickName" placeholder="入ってくださいユーザーのニックネーム" maxlength="30" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="归属部門" prop="deptId">
                     <el-tree-select
                        v-model="form.deptId"
                        :data="deptOptions"
                        :props="{ value: 'id', label: 'label', children: 'children' }"
                        value-key="id"
                        placeholder="選んでください归属部門"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="電話番号" prop="phonenumber">
                     <el-input v-model="form.phonenumber" placeholder="入ってください電話番号" maxlength="11" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="郵便" prop="email">
                     <el-input v-model="form.email" placeholder="入ってください郵便" maxlength="50" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item v-if="form.userId == undefined" label="ユーザー名" prop="userName">
                     <el-input v-model="form.userName" placeholder="入ってくださいユーザー名" maxlength="30" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item v-if="form.userId == undefined" label="ユーザーのパスワード" prop="password">
                     <el-input v-model="form.password" placeholder="入ってくださいユーザーのパスワード" type="password" maxlength="20" show-password />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="性別">
                     <el-select v-model="form.sex" placeholder="選んでください">
                        <el-option
                           v-for="dict in sys_user_sex"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="役職">
                     <el-select v-model="form.postIds" multiple placeholder="選んでください">
                        <el-option
                           v-for="item in postOptions"
                           :key="item.postId"
                           :label="item.postName"
                           :value="item.postId"
                           :disabled="item.status == 1"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="役割">
                     <el-select v-model="form.roleIds" multiple placeholder="選んでください">
                        <el-option
                           v-for="item in roleOptions"
                           :key="item.roleId"
                           :label="item.roleName"
                           :value="item.roleId"
                           :disabled="item.status == 1"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="備考">
                     <el-input v-model="form.remark" type="textarea" placeholder="コンテンツを入力してください"></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確かに 確かに</el-button>
               <el-button @click="cancel">選ぶ 選ぶり除く</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 用户輸入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">ここでファイルをドラッグします，または<em>クリックしてアップロードします</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的ユーザーデータ
                  </div>
                  <span>仅允许輸入xls、xlsxフォーマットファイル。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">テンプレートをダウンロードします</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">確かに 確かに</el-button>
               <el-button @click="upload.open = false">選ぶ 選ぶり除く</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
/*** 用户輸入参数 */
const upload = reactive({
  // ポップアップレイヤーを表示するかどうか（用户輸入）
  open: false,
  // ポップアップレイヤータイトル（用户輸入）
  title: "",
  // アップロードを無効にするかどうか
  isUploading: false,
  // 是否更新已经存在的ユーザーデータ
  updateSupport: 0,
  // リクエストヘッダーを設定します
  headers: { Authorization: "Bearer " + getToken() },
  // アップロードされたアドレス
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// Lycum Hidden情報
const columns = ref([
  { key: 0, label: `ユーザーID`, visible: true },
  { key: 1, label: `ユーザー名`, visible: true },
  { key: 2, label: `ユーザーのニックネーム`, visible: true },
  { key: 3, label: `部門`, visible: true },
  { key: 4, label: `電話番号`, visible: true },
  { key: 5, label: `ステータス`, visible: true },
  { key: 6, label: `作成時間`, visible: true }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [{ required: true, message: "ユーザー名 空であってはならない", trigger: "blur" }, { min: 2, max: 20, message: "長さは2から20の間でなければならない", trigger: "blur" }],
    nickName: [{ required: true, message: "ユーザーのニックネーム 空であってはならない", trigger: "blur" }],
    password: [{ required: true, message: "ユーザーのパスワード 空であってはならない", trigger: "blur" }, { min: 5, max: 20, message: "ユーザーのパスワード長さは5から20の間でなければならない", trigger: "blur" }],
    email: [{ type: "email", message: "入ってください正確かに的郵便地址", trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正確かに的電話番号入ってください", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 条件付きでノードをフィルターします  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 根据名称筛选部門树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});
/** 查询部門下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};
/** クエリユーザーリスト */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
};
/** ノードクリックイベント */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};
/** 検索ボタンアクション */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};
/** 再読み込みボタンアクション */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
/** 削除ボタンアクション */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal.confirm('是否確かに认削除ユーザーID为"' + userIds + '"データ項目？').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
};
/** 出力ボタンアクション */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`);
};
/** 用户ステータス改訂  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "開いてください" : "停止";
  proxy.$modal.confirm('確かに认要"' + text + '""' + row.userName + '"ユーザー？?').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};
/** 更多アクション */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};
/** 跳转役割分配 */
function handleAuthRole(row) {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
};
/** 再読み込み密码ボタンアクション */
function handleResetPwd(row) {
  proxy.$prompt('入ってください"' + row.userName + '"新しいパスワード', "ヒント", {
    confirmButtonText: "確かに確かに",
    cancelButtonText: "選ぶ選ぶり除く",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "ユーザーのパスワード长度必须介于 5 そして 20 間",
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("改訂成功，新しいパスワードはです：" + value);
    });
  }).catch(() => {});
};
/** 選択の数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** 輸入ボタンアクション */
function handleImport() {
  upload.title = "用户輸入";
  upload.open = true;
};
/** テンプレートをダウンロードしますアクション */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**ファイルアップロード処理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** ファイルアップロードに正常に処理します */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "輸入结果", { dangerouslyUseHTMLString: true });
  getList();
};
/** アップロードファイルを送信します */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
/** 再読み込みアクション表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  };
  proxy.resetForm("userRef");
};
/** 選ぶ選ぶり除くボタン */
function cancel() {
  open.value = false;
  reset();
};
/** 増加ボタンアクション */
function handleAdd() {
  reset();
  getUser().then(response => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    open.value = true;
    title.value = "ユーザーを追加する";
    form.value.password = initPassword.value;
  });
};
/** 改訂ボタンアクション */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data;
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.value.postIds = response.postIds;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = "改訂用户";
    form.password = "";
  });
};
/** [提出]ボタン */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("改訂成功");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("増加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

getDeptTree();
getList();
</script>
