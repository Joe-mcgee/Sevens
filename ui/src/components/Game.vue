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
      <Hand :cards="this.currentPlayer.cards" />
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
  components: {
    Hand,
  },
  data() {
    return {
      deck: null,
      discardPile: null,
      players: [],
      currentPlayer: {cards: []},
      round: null,

    };
  },
  async created() {
    let gameData = await axios.get(`/api/games/${this.gameId}`)

    let roundData = await axios.get(`/api/games/${this.gameId}/rounds`)
    gameData.data.game["player_ids"].forEach((player) => {
      console.log('gamedataplayer', player)
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
      this.deck = data.deck;
      this.players = data.players;
      this.discardPile = data.discardPile;
      this.playerHand();
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
      this.discardPile = deck.shift();
      this.deck = deck;
      console.log('this.players', this.players);
      await axios.post(`/api/games/${this.gameId}/rounds/${this.roundId}/init`, {
        players: this.players,
        deck: this.deck,
        topCard: this.discardPile,
      });

      
    },
    playerHand() {
      this.players.forEach((player) => {
        console.log(player)
        if (player.id == this.userId) {
          this.currentPlayer = player;
        }
      })
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
