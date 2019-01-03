<template>
  <div class="discardPile">
    <Card :card="discardPile[discardPile.length-1]" :faceDown="false" />
  </div>
</template>
<script>
import Card from './Card'
export default {
  components: {
    Card,
  },
  props: {
    discardPile: Array,
  },
  data() {
    return {}
  }
}

</script>
<style>
</style>
