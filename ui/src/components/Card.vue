<template>
  <div class="card">
    <v-btn v-if="faceDown" @click="draw">Draw</v-btn>
    <v-card v-else>
      {{card}}
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    card: Object,
    faceDown: Boolean,
  },
  data() {
    return {

    }
  }
}
</script>
<style>
  .card {
    width: 100px;
    height: 150px;
    border: 1px solid black;
  }
</style>