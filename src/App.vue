<template>
  <Editor v-model="state" />
</template>

<script setup>
import { provide, ref } from "vue";
import data from "./data.json";
import Editor from "./packages/editor";
import { registerConfig as config } from "./utils/editor-config";
const state = ref(data);
provide("config", config);
console.log("state", state.value.blocks);
</script>

<script>
export default {
  name: "App",
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  position: fixed;
  top: 20px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}
</style>
