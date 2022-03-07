<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddVisble">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        border
        :show-row-hover="false"
        :data="catelist"
        :show-index="true"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        class="treeTable"
        index-text="#"
      >
        <!-- 是否有效区域 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
          <i></i>
        </template>
        <!-- 排序区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="handle" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="getEdit(scope.row.cat_id)"
          ></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="showdeletedist(scope.row.cat_id)"
          ></el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加区域 -->
    <el-dialog
      title="添加分类"
      :visible.sync="AdddialogVisible"
      @close="addCateDialogClosed"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addrules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="活动名称：" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- option用于绑定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            :props="cascaderProps"
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="ParentcateList"
            @change="parentCateChanged"
            clearable
            change-on-select
            class="el-cascader-menu"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AdddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改区域 -->
    <el-dialog title="修改分类" :visible.sync="EditdialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRuleForm"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editdist">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除区域 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类数据列表，默认为空
      catelist: [],
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 总页数，初始化
      total: 0,
      //为table指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //将此列设为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          //将此列设为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'handle',
        },
      ],
      //控制添加视图显示与隐藏
      AdddialogVisible: false,
      //添加数据获取
      addForm: {
        //添加分类的名称
        cat_name: '',
        //添加分类的父级id
        cat_pid: 0,
        //添加分类的等级，默认是一级
        cat_level: 0,
      },
      // 添加数据规则
      addrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
      //父级分类列表
      ParentcateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //选中父级id数组
      selectedKeys: [],
      //显示与隐藏修改分类视图
      EditdialogVisible: false,
      //修改分类数据对象
      editForm: {},
      //修改分类规则
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    //挂载获取数据列表
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      console.log(res)
      //获取
      this.catelist = res.data.result
      this.total = res.data.total
      // this.getCateList()
    },
    //控制每一页显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 控制跳转到几页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //@ts-check
    showAddVisble() {
      this.getAddclass()
      this.AdddialogVisible = true
    },
    //添加功能父级获取数据
    async getAddclass() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) this.$message.error('分类数据获取失败！')
      //保存父级数据
      console.log(res.data)
      this.ParentcateList = res.data
    },
    //@ts-check
    parentCateChanged() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //当前分类的等级赋值
        this.addForm.cat_level = this.selectedKeys.length
        return
      } else {
        //父级分类的id
        this.addForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addForm.cat_level = 0
      }
    },
    // 添加新的分类功能实现
    addCate() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        console.log(res.data)
        if (res.meta.status !== 201) {
          return this.$message.error('分类添加失败！')
        }
        this.getCateList()
        this.$message.success('分类添加成功')
        this.AdddialogVisible = false
      })
    },
    //@ts-check 监听对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    //控制修改视图显示与隐藏
    //  showEditVisable(id) {
    //   this.EditdialogVisible = true
    //   this.getEdit(id)
    // },
    //获取修改功能的数据
    async getEdit(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据获取失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.EditdialogVisible = true
    },
    //修改分类信息
    async editdist() {
      this.$refs.editRuleForm.validate((valid) => {
        if (!valid) return
      })
      const { data: res } = await this.$http.put(
        'categories/' + this.editForm.cat_id,
        {
          cat_name: this.editForm.cat_name,
        }
      )
      console.log(res.data)
      if (res.meta.status !== 200) this.$message.error('修改分类信息失败')
      this.$message.success('修改分类信息成功')
      this.getCateList()
      this.EditdialogVisible = false
    },
    //删除功能
    async showdeletedist(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') return this.$message.info('您已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('分类删除失败！')
      this.$message.success('分类删除成功！')
      this.getCateList()
    },
  },
}
</script>

<style scoped lang="less">
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>