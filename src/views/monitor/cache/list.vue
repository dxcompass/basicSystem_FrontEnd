<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Collection style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">キャッシュリスト</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheNames()"
            ></el-button>
          </template>
          <el-table
            v-loading="loading"
            :data="cacheNames"
            :height="tableHeight"
            highlight-current-row
            @row-click="getCacheKeys"
            style="width: 100%"
          >
            <el-table-column
              label="シリアルナンバー"
              width="60"
              type="index"
            ></el-table-column>

            <el-table-column
              label="キャッシュ名"
              align="center"
              prop="cacheName"
              :show-overflow-tooltip="true"
              :formatter="nameFormatter"
            ></el-table-column>

            <el-table-column
              label="述べる"
              align="center"
              prop="remark"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="動作します"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheName(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Key style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">キー名リスト</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheKeys()"
            ></el-button>
          </template>
          <el-table
            v-loading="subLoading"
            :data="cacheKeys"
            :height="tableHeight"
            highlight-current-row
            @row-click="handleCacheValue"
            style="width: 100%"
          >
            <el-table-column
              label="シリアルナンバー"
              width="60"
              type="index"
            ></el-table-column>
            <el-table-column
              label="キー名をキャッシュします"
              align="center"
              :show-overflow-tooltip="true"
              :formatter="keyFormatter"
            >
            </el-table-column>
            <el-table-column
              label="動作します"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheKey(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false" style="height: calc(100vh - 125px)">
          <template #header>
            <Document style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">キャッシュコンテンツ</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="handleClearCacheAll()"
              >すべてをクリーンアップします</el-button
            >
          </template>
          <el-form :model="cacheForm">
            <el-row :gutter="32">
              <el-col :offset="1" :span="22">
                <el-form-item label="キャッシュ名:" prop="cacheName">
                  <el-input v-model="cacheForm.cacheName" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="キー名をキャッシュします:" prop="cacheKey">
                  <el-input v-model="cacheForm.cacheKey" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="キャッシュコンテンツ:" prop="cacheValue">
                  <el-input
                    v-model="cacheForm.cacheValue"
                    type="textarea"
                    :rows="8"
                    :readOnly="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="CacheList">
import { listCacheName, listCacheKey, getCacheValue, clearCacheName, clearCacheKey, clearCacheAll } from "@/api/monitor/cache";

const { proxy } = getCurrentInstance();

const cacheNames = ref([]);
const cacheKeys = ref([]);
const cacheForm = ref({});
const loading = ref(true);
const subLoading = ref(false);
const nowCacheName = ref("");
const tableHeight = ref(window.innerHeight - 200);

/** 查询キャッシュ名列表 */
function getCacheNames() {
  loading.value = true;
  listCacheName().then(response => {
    cacheNames.value = response.data;
    loading.value = false;
  });
}

/** 刷新キャッシュ名列表 */
function refreshCacheNames() {
  getCacheNames();
  proxy.$modal.msgSuccess("刷新キャッシュリスト成功");
}

/** 指定された名前キャッシュをクリーンアップします */
function handleClearCacheName(row) {
  clearCacheName(row.cacheName).then(response => {
    proxy.$modal.msgSuccess("清理キャッシュ名[" + row.cacheName + "]成功");
    getCacheKeys();
  });
}

/** 查询缓存キー名リスト */
function getCacheKeys(row) {
  const cacheName = row !== undefined ? row.cacheName : nowCacheName.value;
  if (cacheName === "") {
    return;
  }
  subLoading.value = true;
  listCacheKey(cacheName).then(response => {
    cacheKeys.value = response.data;
    subLoading.value = false;
    nowCacheName.value = cacheName;
  });
}

/** 刷新缓存キー名リスト */
function refreshCacheKeys() {
  getCacheKeys();
  proxy.$modal.msgSuccess("刷新キー名リスト成功");
}

/** 指定されたキー名キャッシュをクリーニングします */
function handleClearCacheKey(cacheKey) {
  clearCacheKey(cacheKey).then(response => {
    proxy.$modal.msgSuccess("清理キー名をキャッシュします[" + cacheKey + "]成功");
    getCacheKeys();
  });
}

/** プレフィックスの削除をリストします */
function nameFormatter(row) {
  return row.cacheName.replace(":", "");
}

/** キー名プレフィックスの削除 */
function keyFormatter(cacheKey) {
  return cacheKey.replace(nowCacheName.value, "");
}

/** 查询キャッシュコンテンツ详细 */
function handleCacheValue(cacheKey) {
  getCacheValue(nowCacheName.value, cacheKey).then(response => {
    cacheForm.value = response.data;
  });
}

/** すべてをクリーンアップします缓存 */
function handleClearCacheAll() {
  clearCacheAll().then(response => {
    proxy.$modal.msgSuccess("すべてをクリーンアップします缓存成功");
  });
}

getCacheNames();
</script>
