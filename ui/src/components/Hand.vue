<template>
  <v-container>
    <div v-for="card in cards">
      <Card :card="card" />
    </div>
  </v-container>
</template>
<script>
import Card from './Card'

export default {
  props: {
    cards: Array,
  },
  components: {
    Card,
  },
  data() {
    return {};
  },
};

</script>
<style>
</style>
