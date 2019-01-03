<template>
  <v-container>
    <v-layout row wrap>
    <v-flex class="xs-custom" v-for="card in cards">
      <Card :card="card" :faceDown="false" />
    </v-flex>
  </v-layout>
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

.xs-custom {
  width: 14%;
  max-width: 14%;
  flex-basis: 14%;
}
</style>
