<template>
  <v-container>
    <v-footer absolute>

    </v-footer>
  </v-container>
</template>
<script>
import { shuffle, newDeck } from '52-deck';
import axios from 'axios';
import Hand from './Hand.vue';
export default {
  data() {
    return {
      deck: null,
      players: null,

    };
  },
  async created() {
    console.log(this.$route.query.gameId)
    let gameData = await axios.get(`/api/games/${this.$route.query.gameId}`)
    for (player in gameData.player_ids) {
      let playerObj = {
        id: player,
        cards: [],
      }
      this.players.push(playerObj);
    }
    this.deck = shuffle(newDeck());
    this.stack = [];
  },
  sockets: {

  },
  methods: {
    deal() {
      let i = 0;
      while (i < 7) {
        for (player in this.players) {
          player.cards.push(this.deck.shift());
          i++;
        }
      }
    },
    flip() {
      this.stack.push(this.deck.shift());
    },
    playCard(player, card) {

    },
    drawCard(player) {

    },
  },
};

</script>
<style>
</style>
