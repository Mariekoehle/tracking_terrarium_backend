<template>
  <div class="register-form">
     <h3>register</h3>
    <form
    @submit.prevent="registerUser"
    metod="post"
    novalidate
    autocomplete="off"
    >
        <label for="username">user name:</label><br>
        <input type="text" id="username" name="username" value="" v-model="username"><br>
        <label for="password">password:</label><br>
        <input type="text" id="password" name="password" value="" v-model="password"><br>
        <input type="submit" value="register">
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Registerform',
  props: {},
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    registerUser: function () {
      const userData = {
        username: this.username,
        password: this.password
      }
      const uri = 'http://localhost:3001/api/register'
      axios.post(uri, userData)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (err) {
          console.log(err)
        })
    }
  }
}
</script>

<style scoped>

</style>
