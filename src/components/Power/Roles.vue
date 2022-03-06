<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisable = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二，三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
              <el-col></el-col>
            </el-row>
            <!-- <pre> {{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoles(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delEditRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRights(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 角色添加对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisable"
      width="50%"
      @closed="addDialogClosed"
    >
      <el-form
        :model="RolesForm"
        :rules="Rolesrules"
        ref="RolesRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input clearable v-model="RolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input clearable v-model="RolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 角色修改对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="editVisable" width="70%">
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editRuleFormRef"
        label-width="80px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisable = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 角色分配权限 -->
    <el-dialog
      title="分配权限"
      @close="setRightDialogClosed"
      :visible.sync="distriVisable"
      width="70%"
    >
      <!-- 树形结构 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        default-expand-all
        :default-checked-keys="defKeys"
        node-key="id"
        show-checkbox
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="distriVisable = false">取 消</el-button>
        <el-button
          type="primary"
          @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
      

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //控制添加角色对话框显示与隐藏
      addRolesDialogVisable: false,
      //角色信息添加对象
      RolesForm: {
        roleName: '',
        roleDesc: '',
      },
      //角色添加规则
      Rolesrules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
          {
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
          {
            min: 2,
            max: 15,
            message: '长度在 2 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
      //角色修改视图显示与隐藏
      editVisable: false,
      //角色分配权限视图显示与隐藏
      distriVisable: false,
      //角色数据获取
      editForm: [],
      //角色修改规则
      editRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
          {
            min: 2,
            max: 5,
            message: '长度在 2 到 5 个字符',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 15,
            message: '长度在 3 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
      //角色权限分配
      distriform: {},
      //权限数据初始化
      rightslist: [],
      //树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //选中的节点id数组
      defKeys: [],
      //当前即将分配权限id
      roleId: '',
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    //获取所有角色的列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表数据失败！')
      this.rolelist = res.data
    },

    //清空表单数据
    addDialogClosed() {
      this.$refs.RolesRef.resetFields()
    },
    //添加角色预校验
    addRoles() {
      this.$refs.RolesRef.validate(async (valid) => {
        if (!valid) return
        //发起添加角色网络请求
        const { data: res } = await this.$http.post('roles', this.RolesForm)
        if (res.meta.status !== 201)
          return this.$message.error('添加角色失败！')
        this.$message.success('添加角色成功！')
        //隐藏添加角色的对话框
        this.addRolesDialogVisable = false
        //刷星角色列表
        this.getRoleList()
      })
    },
    //展示角色编辑对话框
    async showEditRoles(id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }
      this.editForm = res.data
      this.editVisable = true
    },
    //修改表单重置功能
    editDialogClosed() {
      this.$refs.RolesRef.resetFields()
    },
    //角色修改功能
    editRoles() {
      this.$refs.editRuleFormRef.validate(async (valid) => {
        if (!valid) return
        //发起网络请求并提交
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        )
        if (res.meta.status !== 200)
          return this.$message.error('修改角色用户信息失败！')
        //关闭对话框
        this.editVisable = false
        //更新角色列表数据
        this.getRoleList()
        //提示用户信息修改成功
        this.$message.success('修改角色信息成功！')
      })
    },
    //角色删除弹框
    async delEditRoles(id) {
      console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm')
        return this.$message.info('您已取消删除！')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRoleList()
    },
    //删除第三级tag标签
    async removeRightById(role, rightId) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该属性, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm')
        return this.$message.info('您已取消删除！')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) this.$message.error('删除权限失败！')
      // this.getRoleList()
      role.children = res.data
    },
    //控制权限分配显示与隐藏,数据获取
    async showRights(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) this.$message.error('获取权限数据失败！')
      this.rightslist = res.data
      this.getLeafKeys(role, this.defKeys)
      this.distriVisable = true
    },
    //
    getLeafKeys(node, arr) {
      //如果当前的节点不包含孩子属性，则把节点的id添加到arr数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      //递归调用
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //监听分配权限对话框的关闭时间
    setRightDialogClosed() {
      this.defKeys = []
    },
    //分配权限
    async allotRights() {
      console.log('hhhh');
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRoleList()
      this.distriVisable = false
    },
  },
  //
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>