<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs5>
      </v-flex>
      <v-flex xs2>
        <v-btn @click="deal">Deal</v-btn>
      </v-flex>
      <v-flex xs5>
      </v-flex>
    </v-layout>
    <v-footer absolute>
    </v-footer>
  </v-container>
</template>
<script>
import { shuffle, newDeck } from '52-deck';
import axios from 'axios';
import Hand from './Hand.vue';
export default {
  props: {
    userId: String
  },

  data() {
    return {
      deck: null,
      topCard: null,
      players: null,
      round: null,

    };
  },
  async created() {
    console.log(this.$route.query.gameId)
    let gameData = await axios.get(`/api/games/${this.$route.query.gameId}`)

    let roundData = await axios.get(`/api/games/${this.$route.query.gameId}/rounds`)
    console.log(roundData)
    console.log('api broken?')
    for (player in gameData.player_ids) {
      let playerObj = {
        id: player,
        cards: [],
      }
      this.players.push(playerObj);
      console.log(gameData)
      this.roundId = gameData.data.roundId
    }

  },
  sockets: {

  },
  methods: {
    async deal() {
      let response = await axios.post(`/api/games/${this.$route.query.gameId}/${this.round}/shuffle`, { playerId: this.userId })
      let deck = response.data.deck;

      let i = 0;
      while (i < 7) {
        for (player in this.players) {
          player.cards.push(deck.shift());
          i++;
        }
      }
      this.topCard = deck.shift();
      this.deck = deck;
      this.$socket.in(`/games/${this.$router.query.gameId}`).emit('deal', { deck, topCard: this.topCard })

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
