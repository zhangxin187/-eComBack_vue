<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮，包裹在row+column有利于页面布局 -->
      <el-row>
        <el-col>
          <!-- 通过给角色指定权限，然后给用户指定角色 即可完成权限管理模块 -->
          <el-button type="primary"
                     @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList"
                stripe
                border>
        <el-table-column type="expand">
          <!-- 利用三层循环展示 三级权限的标签 -->
          <template slot-scope="scope">

            <el-row :class="['bd-bottom',i1==0? 'bd-top' :'']"
                    v-for='(item1,i1) in scope.row.children'
                    :key="item1.id">
              <!-- 一级权限标签区域 -->
              <el-col :span="5">
                <el-tag closable
                        @close='deleteRightsTag(scope.row,item1.id)'>{{item1.authName}}</el-tag>
              </el-col>
              <!-- 二、三级权限标签区域 -->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children"
                        :key="item2.id"
                        :class="i2==0? '':'bd-top'">

                  <!-- 二级权限标签区域，将该行再进行划分，还是24列 -->
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close='deleteRightsTag(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                  </el-col>
                  <!-- 三级权限标签区域 -->
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for='item3 in item2.children'
                            :key="item3.id"
                            closable
                            @close='deleteRightsTag(scope.row,item3.id)'>{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"
                         label="#">
        </el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-edit"
                       @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger"
                       size="mini"
                       icon="el-icon-delete"
                       @click='deleteRoleByID(scope.row.id)'>删除</el-button>
            <el-button type="warning"
                       size="mini"
                       icon="el-icon-setting"
                       @click="showSetRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色"
                 :visible.sync="addRoleDialogVisible"
                 width="50%">
        <el-form :model="addRoleForm"
                 :rules="addRoleRules"
                 ref="addRoleRef">
          <el-form-item label="角色名称"
                        label-width="80px"
                        prop="roleName">
            <el-input v-model='addRoleForm.roleName'></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        label-width="80px"
                        prop="roleDesc">
            <el-input v-model='addRoleForm.roleDesc'></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addRoleDialogClosed">取 消</el-button>
          <el-button type="primary"
                     @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑角色的对话框 -->
      <el-dialog title="编辑角色"
                 :visible.sync="editRoleDialogVisible"
                 width="50%">
        <!-- 编辑角色的验证规则和添加角色的规则一样，故使用添加角色的验证规则对象 -->
        <el-form :model="editRoleForm"
                 :rules="addRoleRules"
                 ref="editRoleRef">
          <el-form-item label="角色名称"
                        label-width="80px"
                        prop="roleName">
            <el-input v-model='editRoleForm.roleName'></el-input>
          </el-form-item>
          <el-form-item label="角色描述"
                        label-width="80px"
                        prop="roleDesc">
            <el-input v-model='editRoleForm.roleDesc'></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editRoleDialogClosed">取 消</el-button>
          <el-button type="primary"
                     @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限的对话框 -->
      <el-dialog title="分配权限"
                 :visible.sync="setRightsDialogVisible"
                 width="50%"
                 @closed='setRightsDialogClosed'>
        <!-- 树形控件,data绑定数据对象，proprs指定节点名称 和 子树节点 -->
        <!-- node-key 给其指定权限的id，用来作为唯一标识 -->
        <el-tree :data="rightsList"
                 :props="defaultProps"
                 show-checkbox
                 default-expand-all
                 :default-checked-keys="defaultCheckedKeys"
                 node-key="id"
                 ref="treeRef"></el-tree>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click='setRightsDialogVisible=false'>取 消</el-button>
          <el-button type="primary"
                     @click="setRights">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色的表单数据对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的表单数据验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制编辑用户的对话框显示与隐藏
      editRoleDialogVisible: false,
      // 待编辑的角色的表单数据对象
      editRoleForm: {},
      // 控制分配权限的对话框显示与隐藏
      setRightsDialogVisible: false,
      // 权限树形数据
      rightsList: [],
      // 指定树形控件的节点名称 和 子树节点 为绑定的数据对象的属性值
      // authName、children是树形控件绑定的数据对象(权限列表数据):data中的属性
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选节点的key的数组，即该角色所拥有三级权限的id
      defaultCheckedKeys: [],
      // 授权角色的id
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表数据
    async getRolesList () {
      var { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return false
      this.rolesList = res.data
    },
    // 显示添加角色的对话框
    showAddRoleDialog () {
      this.addRoleDialogVisible = true
    },
    // 添加角色
    addRole () {
      // 表单验证
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return this.$message.error('字段值不符合规则，添加角色失败')
        // 向接口发送请求，添加角色
        var { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 关闭对话框
        this.addRoleDialogVisible = false
        // 重置表单
        this.$refs.addRoleRef.resetFields()
        this.$message.success('添加角色成功')
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    // 当添加角色对话框关闭时触发
    addRoleDialogClosed () {
      this.addRoleDialogVisible = false
      // 重置表单
      this.$refs.addRoleRef.resetFields()
    },
    // 展示编辑角色的对话框
    async showEditRoleDialog (id) {
      this.editRoleDialogVisible = true
      // 根据id查询角色
      var { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return false
      // 将角色数据添加到 data中
      this.editRoleForm = res.data
    },
    // 保存编辑完的角色
    editRole () {
      // 表单验证
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return this.$message.error('修改的字段值不符合规则,修改失败')
        // 向接口发送请求，保存编辑完的角色
        var { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 重新获取角色列表数据
        this.getRolesList()
        this.$message.success('成功编辑该角色信息')
        // 重置表单
        this.$refs.editRoleRef.resetFields()
      })
    },
    // 当编辑角色的对话框关闭时触发
    editRoleDialogClosed () {
      this.editRoleDialogVisible = false
      // 重置表单
      this.$refs.editRoleRef.resetFields()
    },
    // 根据ID删除角色
    async deleteRoleByID (id) {
      // 确认是否删除的提示框,点击确认获取到confirm，点击取消获取到cancel
      var result = await this.$confirm('是否删除该角色', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => { return err })
      if (result === 'cancel') return this.$message.info('已取消删除该角色')
      // 调用接口删除角色
      var { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('成功删除该角色')
      // 重新获取角色列表数据
      this.getRolesList()
    },
    // 展示分配权限的对话框
    showSetRightsDialog (role) {
      // role为该角色的数据
      // 将该分配权限的角色的id保存到data中,用于后续的提交权限分配请求
      this.roleId = role.id
      // 递归获取该角色三级权限的id，并保存到defaultCheckedKeys数组中
      this.getBaseRightsId(role, this.defaultCheckedKeys)
      // default-checked-keys是树形控件初始化加载的时候用的
      // 当树形控件加载完毕，这时候改变 default-checked-keys 的值就没有用了

      this.setRightsDialogVisible = true
      // 由于Vue的渲染机制,此时用到什么组件则渲染什么，对话框没显示就没有加载渲染到页面中去，
      // 树形控件嵌套在对话框中，故树形控件也没有加载出来，使用this.$refs.treeRef会显示undefind
      // 上面将对话框的visible改为true,对话框会渲染显示出来，但是this.$refs.treeRef 还是会报错
      // Vue 实现响应式并不是数据发生变化之后 DOM 立即变化，而是按一定的策略进行 DOM 的更新，树形组件并不是立即加载出来
      // nextTick()钩子 在下次 DOM 更新循环结束之后执行延迟回调,当对话框组件、树形控件加载渲染出来再执行
      this.$nextTick(() => {
        // 调用树形控件的方法 改变选中的节点,参数为选中的节点数组
        this.$refs.treeRef.setCheckedKeys(this.defaultCheckedKeys)
      })
    },

    // 获取树状权限列表
    async getRightsListByTree () {
      var { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return false
      this.rightsList = res.data
    },

    // 获取角色已授权的基础权限的id，在本项目中即获取三级权限的id 并保存到默认选中节点的数组defaultCheckedKeys中
    // 三级权限被选中，则一二级权限被半选；当三级权限全被选中，一二级权限全选
    // 故只需要获取三级权限的id 就能完成树形控件的节点默认勾选
    getBaseRightsId (node, arr) {
      // 通过判断该节点数据中是否有children属性 来判断当前是否为基础权限
      if (!node.children) return arr.push(node.id)
      // 数据对象当中有children属性,其属性值为数组，遍历children数组，再次调用该函数
      node.children.forEach((val) => {
        // 遍历到的为权限对象数据，递归调用
        this.getBaseRightsId(val, arr)
      })
    },
    // 当分配权限的对话框关闭时触发
    setRightsDialogClosed () {
      // 清空默认选中节点的数组 defalutCheckedKeys
      // 不清空的话，当打开了多个角色的分配权限对话框，则数组一直在被追加，
      // 默认选中节点的数组 保留着之前角色的三级权限id
      this.defaultCheckedKeys = []
    },

    // 提交分配的权限
    async setRights () {
      // 获取所选中的节点的key,获取到的是key的数组
      // node-key是节点在树中的唯一标识，我们给key赋值为权限的id
      var checkedArr = this.$refs.treeRef.getCheckedKeys()
      // 获取目前半选中的节点的key，获取到的是数组
      var halfCheckedArr = this.$refs.treeRef.getHalfCheckedKeys()
      // 接口的请求参数要求为 以逗号分隔的 所有被选中节点的key和半选中节点的key的字符串
      // 利用扩展运算符将两个数组合并为一个数组，再将数组拼接为字符串
      var rids = [checkedArr, halfCheckedArr].join(',')
      // 调用接口，提交权限
      var { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: rids })
      if (res.meta.status !== 200) return false
      this.setRightsDialogVisible = false
      // 重新获取角色列表数据
      this.getRolesList()
      this.$message.success('角色分配权限成功')
    },
    // 当删除标签时触发，即删除角色指定的权限
    async deleteRightsTag (role, rightsId) {
      // 是否删除确认框
      var result = await this.$confirm('是否删除该权限？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      if (result === 'cancel') return this.$message.info('已取消删除该权限')
      // 调用接口，删除指定权限
      var { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // 此处若重新获取角色列表数据的话,表格会被重新渲染，打开的表格区域会被关闭
      // 调用接口成功返回的数据是 当前角色下最新的权限数据
      // role接收的是表格中该行所绑定的数据对象，即用户的数据对象，将获取的最新权限数据赋值给 数据对象的属性
      // 由于对象是引用类型，修改对象中的属性会被保存下来
      // 故该行所绑定的数据对象发生了改变，由于数据的响应式，该行内容相应变化，标签被删除
      // 这并没有刷新数据，只是前端页面的修改,这样设计更加合理
      role.children = res.data
    }
  },
  created () {
    // 获取角色列表数据
    this.getRolesList()
    // 获取树形权限数据
    this.getRightsListByTree()
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
.el-row {
  display: flex;
  align-items: center;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 10px 5px;
}
</style>
