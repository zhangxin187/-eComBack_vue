<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息"
                show-icon
                type="info"
                center
                :closable='false'>
      </el-alert>
      <!-- 状态步骤条 -->
      <!-- -0,将字符串转为数字 -->
      <el-steps :active="activeName-0"
                finish-status="success"
                :align-center='true'>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab标签页区域 -->
      <!-- tabs和tab-pane间不能插入Form组件,故将Form表单组件包裹在tabs的外面 -->
      <el-form :model="addGoodsForm"
               :rules="addGoodsRules"
               ref="addGoodsRef"
               label-position='top'>
        <el-tabs tab-position="left"
                 v-model="activeName"
                 :before-leave='beforeTabChange'>
          <el-tab-pane label="基本信息"
                       name="0">
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类"
                          prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader v-model="addGoodsForm.goods_cat"
                           :options="goodsCateList"
                           :props="casProps"
                           @change="handleCasChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数"
                       name="1">
            <!-- 循环生成动态参数 -->
            <el-form-item v-for="item in manyDataList"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <!-- 属性复选框 -->
              <!-- v-model绑定数组，label绑定值与数组中的元素相对应 -->
              <!-- 当改变了选中状态，绑定的数组会直接被修改，故onlyDataList相应被修改 -->
              <!-- 取消勾选，该选择框会被移除，因为绑定的数组发生了修改，会重新渲染且不再渲染该选择框 -->
              <!-- 循环生成动态参数属性项的复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val"
                             v-for="(val,i) in item.attr_vals"
                             :key='i'
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性"
                       name="2">
            <!-- 循环生成静态属性 -->
            <el-form-item :label="item.attr_name"
                          v-for='item in onlyDataList'
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片"
                       name="3">
            <!-- 文件上传组件 -->
            <!-- 后台服务器要求 当访问需要授权的接口,需要设置请求头 -->
            <!-- 我们之前给axios设置了请求头,文件上传组件不是使用axios向接口发送请求,故要给该文件上传组件设置请求头 -->
            <el-upload :action="uploadUrl"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       :on-success='handleUploadSuccess'
                       list-type="picture"
                       :headers="headers">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容"
                       name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor"
                          v-model="addGoodsForm.goods_introduce" />

            <!-- 添加商品的按钮 -->
            <el-button type="primary"
                       class='addBtn'
                       @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 图片预览对话框 -->
      <el-dialog :visible.sync="picDialogVisible"
                 title="图片预览"
                 width="50%">
        <img :src="previewUrl"
             alt=""
             class="previewPic">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 添加商品的表单数据对象
      addGoodsForm: {
        goods_name: '',
        goods_price: null,
        goods_number: null,
        goods_weight: null,
        goods_cat: [],
        // 上传图片的临时路径
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品参数数组，包括动态参数和静态属性
        attrs: []
      },
      addGoodsRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类列表数据
      goodsCateList: [],
      // 级联选择器的配置对象
      casProps: {
        children: 'children',
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover'
      },
      // 三级分类静态属性
      onlyDataList: [],
      // 三级分类动态参数
      manyDataList: [],

      // tab栏的当前选中标签页、steps的当前步骤
      // 要想实现tab栏选中和step步骤条同步变化,需要将该数据同时指定给它们,steps的active属性接收数字类型
      activeName: '0',
      // 文件上传的路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置文件上传组件的请求头
      headers: {
        // 给文件上传组件的请求授权
        Authorization: sessionStorage.getItem('token')
      },
      // 控制图片预览对话框的显示与隐藏
      picDialogVisible: false,
      // 预览图片的路径
      previewUrl: ''

    }
  },
  methods: {
    // 获取商品分类列表数据
    async getGoodsCate () {
      var { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return false
      this.goodsCateList = res.data
    },
    // 当级联选择器选中发生变化时触发
    handleCasChange () {
      // 只能选中三级分类，商品只能添加在三级分类下
      // 当选中的不是三级分类，则让选中数组清空
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 切换tab栏选项卡之前触发该函数
    beforeTabChange (activeName, oldActiveName) {
      // activeName：切换到的tab的name  oldActiveName：切换起始tab的name,从哪个tab选项切换
      // 如果未输入完整的商品信息,阻止tab栏切换
      if (oldActiveName === '0') {
        if (!this.addGoodsForm.goods_name) {
          this.$message.error('请输入商品名称')
          // 阻止切换
          return false
        }
        if (!this.addGoodsForm.goods_price) {
          this.$message.error('请输入商品价格')
          // 阻止切换
          return false
        }
        if (!this.addGoodsForm.goods_weight) {
          this.$message.error('请输入商品重量')
          // 阻止切换
          return false
        }
        if (!this.addGoodsForm.goods_number) {
          this.$message.error('请输入商品数量')
          // 阻止切换
          return false
        }
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品分类')
          // 阻止切换
          return false
        }
        // 当选中了三级分类，则获取选中三级分类的动态参数和静态属性
        this.getCateAttr()
      }
    },
    // 获取选中三级分类的动态参数和静态属性
    async getCateAttr () {
      // 获取动态参数
      var { data: res } = await this.$http.get(`categories/${this.selectedCateId}/attributes`, {
        params: { sel: 'many' }
      })
      if (res.meta.status !== 200) return false
      // 将每个参数的attr_vals字符串转为数组,便于后续操作
      res.data.forEach(item => {
        // 空字符串用split.(' ') 会转换为非空数组，数组含有第一个元素为空字符串
        // 故当其为空字符串时，返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
      this.manyDataList = res.data

      // 获取静态属性
      var { data: res1 } = await this.$http.get(`categories/${this.selectedCateId}/attributes`, {
        params: { sel: 'only' }
      })
      if (res1.meta.status !== 200) return false
      this.onlyDataList = res1.data
    },
    // 当文件上传成功时触发
    handleUploadSuccess (response) {
      // 将上传文件的临时路径存为对象添加到 pics数组中
      this.addGoodsForm.pics.push({ pic: response.data.tmp_path })
    },
    // 当点击文件列表中已上传的文件时触发,实现图片预览
    handlePreview (file) {
      this.previewUrl = file.response.data.url
      // 显示预览图片对话框
      this.picDialogVisible = true
    },
    // 当移除上传文件时触发
    handleRemove (file) {
      // file关于该上传文件的信息
      // 通过file.response.data从pics数组中查找到该元素，并从数组中删除
      // 拿到当前移除文件在数组中的索引
      var index = this.addGoodsForm.pics.findIndex(value => {
        return value.pic === file.response.data.tmp_path
      })
      // 从数组中删除该文件
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 添加商品
    addGoods () {
      // 向接口发送请求，接口要求参数goods_cat为字符串,但级联选择器要求其为数组，两个之间有冲突
      // 故深拷贝addGoodsForm对象,将拷贝对象的goods_cat转换为字符串, 将拷贝的对象作为请求参数对象
      var newForm = _.cloneDeep(this.addGoodsForm)
      newForm.goods_cat = newForm.goods_cat.join(',')
      // 将选中的动态参数和静态属性改造为接口要求的参数对象形式 并添加到商品参数数组中
      // 遍历动态参数列表
      this.manyDataList.forEach(item => {
        // 将attr_vals数组转为字符串
        const valsObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        newForm.attrs.push(valsObj)
      })
      // 遍历静态属性列表
      this.onlyDataList.forEach(item => {
        // 静态属性attr_vals为字符串,静态属性的属性值只有一个
        const valsObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        newForm.attrs.push(valsObj)
      })
      // 表单验证
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error('表单字段值验证不通过')
        // 调用接口，发送请求
        var { data: res } = await this.$http.post('goods', newForm)
        if (res.meta.status !== 201) return false
        // 编程式导航跳转到商品列表组件
        // this.$router.push('/goods')
        console.log(res.data)
        this.$message.success('添加商品成功')
      })
    }

  },
  created () {
    // 获取商品分类列表数据
    this.getGoodsCate()
  },
  computed: {
    // 获取三级分类id
    selectedCateId () {
      if (this.addGoodsForm.goods_cat.length === 3) {
        // 选中的是三级分类，则返回数组中的第三位
        return this.addGoodsForm.goods_cat[2]
      }
      // 选中的不是三级分类
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 10px 10px 0 !important;
}
.previewPic {
  width: 100%;
}
.addBtn {
  margin-top: 10px;
}
</style>
