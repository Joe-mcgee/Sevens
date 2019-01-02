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
    userId: Number,
    gameId: String,
  },

  data() {
    return {
      deck: null,
      topCard: null,
      players: [],
      round: null,

    };
  },
  async created() {
    let gameData = await axios.get(`/api/games/${this.gameId}`)

    let roundData = await axios.get(`/api/games/${this.gameId}/rounds`)
    gameData.data.game["player_ids"].forEach((player) => {
      let playerObj = {
        id: player,
        cards: [],
      }
      this.players.push(playerObj);
    })
    this.roundId = roundData.data[roundData.data.length - 1]["_id"];

  },
  sockets: {
    startTurn(data) {
      console.log(data)
    },
  },
  methods: {
    async deal() {
      let response = await axios.post(`/api/games/${this.gameId}/rounds/${this.roundId}/shuffle`, { playerId: this.userId })
      let deck = response.data.deck;

      let i = 0;
      while (i < 7) {

        this.players.forEach((player) => {
          player.cards.push(deck.shift());
        })
        i++;
      }
      this.topCard = deck.shift();
      this.deck = deck;
      let gameState = await axios.post(`/api/games/${this.gameId}/rounds/${this.roundId}/init`, {
        players: this.players,
        deck: this.deck,
        topCard: this.topCard,
      });

      console.log(gameState)
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
