<template>
  <div id="app">
    <router-view></router-view>
    <ul class="links">
      <router-link :to="{ name: 'home' }" tag="li"><a>Home</a></router-link>
      <router-link :to="{ name: 'about' }" tag="li"><a>About</a></router-link>
      <router-link to="/nopage" tag="li"><a>Missing page</a></router-link>
      <router-link to="/nopage2" tag="li"><a>Missing page 2</a></router-link>
    </ul>
  </div>
</template>
<script>
  import Home from './Home/'
  import About from './About/'
  import NotFound from './NotFound/'
  export const routes = [
    { name: 'home', path: '/', component: Home, meta: { title: 'Homepage' } },
    { name: 'about', path: '/about', component: About, meta: { title: 'About' } },
    { name: 'notfound', path: "*", component: NotFound, meta: { title: 'Not Found' } }
  ];
  export default {
    name: 'App'
  }
</script>
<style lang="scss">
body {
  font-family: Arial;
  font-size: 14px;
}
body, a {
  color: #000000;
}
.links {
  li {
    &.router-link-exact-active > a {
      color: #FF0000;
    }
    &:before {
      display: inline-block;
      width: 16px;
      height: 16px;
      content: '';
      background: transparent url(../assets/square.png) no-repeat center center;
      margin-right: 0.5em;
      vertical-align: bottom;
    }
  }
}
</style>
