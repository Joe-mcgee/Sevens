<template>
  <div class="deck">
    <Card :card="deck[0]" :faceDown="true" />
  </div>
</template>
<script>
import Card from './Card'
export default {
  components: {
    Card,
  },
  props: {
    deck: Array,
  },
  data() {
    return {}
  }
}

</script>
<style>
</style>
