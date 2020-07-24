<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表区域 -->
      <el-table :data="rightsList"
                border
                stripe>
        <el-table-column type='index'
                         label="#"></el-table-column>
        <el-table-column label='权限名称'
                         prop='authName'></el-table-column>
        <el-table-column label='路径'
                         prop='path'></el-table-column>
        <el-table-column label='权限等级'
                         prop='level'>
          <!-- 作用域插槽,scope.row能获取到表格中该行的数据 -->
          <template slot-scope="scope">
            <!-- 判断子组件的数据，插入不同的内容 -->
            <el-tag v-if="scope.row.level==0">一级</el-tag>
            <el-tag v-else-if="scope.row.level==1"
                    type="success">二级</el-tag>
            <el-tag v-else
                    type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表数据
      rightsList: []
    }
  },
  methods: {
    // 获取权限列表
    async getRightsList () {
      var { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return false
      // 将权限列表数据添加到 data中
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  },
  created () {
    // 获取权限列表
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 10px;
}
</style>>
