<template>
  <div>
    <el-button type="info" @click="loginout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  methods: {
    loginout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped lang="less">
</style>