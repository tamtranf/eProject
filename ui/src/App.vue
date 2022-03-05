<template>
  <router-view/>
  <notifications position="bottom center" />
</template>

<style>
  @import "~ag-grid-community/dist/styles/ag-grid.css";
  @import "~ag-grid-community/dist/styles/ag-theme-blue.css";
  @import "~ag-grid-community/dist/styles/ag-theme-bootstrap.css";
  @import '~bootstrap/dist/css/bootstrap.css';
  @import '~bootstrap-icons/font/bootstrap-icons.css'

  /* @import "~ag-grid-community/dist/styles/ag-theme-alpine.css"; */
</style>

<style>
body{
  margin: 0px;
}
h1{
    text-align: center;
}
#app {
  font-family:  Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
}

.page {
  margin: 0px 10vw;
}

#nav {
  padding: 30px;

}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: red;
}
.ag-blue .ag-header{
    font-weight: 200!important;
}
.ag-blue{
    font-size: 13px!important;
}
.ag-grid-tab-button{
  margin: 0px!important;
  padding: 0px!important;
  font-size: 13px!important;
}
</style>
