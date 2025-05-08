<template>
  <app-header></app-header>
  <div :class="[name,'page']">
   Respone: {{respone_msg}}
   <br>
    <button class="btn btn-primary" @click="loadData(1)" >test1</button>
    <br>
     <br>
    <button class="btn btn-primary" @click="loadData(2)">test2</button>
  </div>
</template>
<script>
import mixinLayoutComponents from '@/mixins/layout_components';

export default {
  name: 'test_3004',
  data() {
    return {
        respone_msg:"none",
      name: 'test_3004',
    };
  },
  routes: [
    {
      path: '/test_3004',
      name: 'test_3004',
    },
  ],
  mixins: [mixinLayoutComponents],
  components: {},
  computed: {},
  methods: {
    loadData(id){
this.$ajax.post("/test_3004/get/"+id,{},(err, response)=>{
    console.log(err, response);
    if(err){
        this.respone_msg=err;   

    }else{
        this.respone_msg=`${response.data.test_name}`
    }
})
    },
  },
  props: [],
  beforeCreate() {
    console.log(`${this.name} beforeCreate`);
  },
  created() {
    console.log(`${this.name} created`);
  },
  beforeMount() {
    console.log(`${this.name} beforeMount`);
  },
  mounted() {
    console.log(`${this.name} mounted`);
  },
  beforeUpdate() {
    console.log(`${this.name} beforeUpdate`);
  },
  updated() {
    console.log(`${this.name} updated`);
  },
  beforeUnmount() {
    console.log(`${this.name} beforeUnmount`);
  },
  unmounted() {
    console.log(`${this.name} unmounted`);
  },
  errorCaptured() {
    console.log(`${this.name} errorCaptured`);
  },
  renderTracked() {

  },
  renderTriggered() {
    console.log(`${this.name} renderTriggered`);
  },
  activated() {
    console.log(`${this.name} activated`);
  },
  deactivated() {
    console.log(`${this.name} deactivated`);
  },
};
</script>
<style scoped></style>
