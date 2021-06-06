<template>
<div>
  <Loginform/>
  <Registerform/>
</div>
</template>

<script>
import Loginform from './components/Loginform.vue'
import Registerform from './components/Registerform.vue'

export default {
  name: 'App',
  components: {
    Registerform,
    Loginform
  }
}
</script>

<style>
</style>