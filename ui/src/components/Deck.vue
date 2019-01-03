<template>
  <div class="deck">
    <Card :faceDown="true" :card="deck[0]" @clicked="shiftOffDeckAndPass" />
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
  },
  methods: {
  	shiftOffDeckAndPass(card) {
  		this.deck.shift()
  		this.$emit('clicked', card)
  	}
  }
}

</script>
<style>
</style>
