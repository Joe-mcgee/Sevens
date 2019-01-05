<template>
  <v-container>
    <v-container v-if="!dealed">
      <v-layout row wrap>
        <v-flex xs5>
        </v-flex>
        <v-flex xs2>
          <v-btn @click="deal">Deal</v-btn>
        </v-flex>
        <v-flex xs5>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-if="dealed">
      <v-layout row wrap>
        <v-flex xs2>
        </v-flex>
        <v-flex xs4>
          <Deck :deck="deck" @clicked="addCardToHand" />
        </v-flex>
        <DiscardPile :discardPile="discardPile" />
        <v-flex xs4>
        </v-flex>
        <v-flex xs2>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer class="footer" fixed height="175px">
      <Hand :cards="this.currentPlayer.cards" @play="playCard" />
    </v-footer>
  </v-container>
</template>
<script>
import { shuffle, newDeck } from '52-deck';
import axios from 'axios';
import Hand from './Hand.vue';
import Deck from './Deck.vue';
import DiscardPile from './DiscardPile.vue';
export default {
  props: {
    userId: Number,
    gameId: String,
  },
  components: {
    Hand,
    Deck,
    DiscardPile,
  },
  data() {
    return {
      dealed: false,
      deck: null,
      discardPile: [],
      players: [],
      currentPlayer: { cards: [] },
      round: null,
      isTurn: false

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
        isTurn: false,
      }
      this.players.push(playerObj);
    })
    this.roundId = roundData.data[roundData.data.length - 1]["_id"];

  },
  sockets: {
    startTurn(data) {
      this.deck = data.deck;
      this.players = data.players;
      this.players.forEach((player) => {
        if (player.id === this.userId) {
          if (player.isTurn === true) {
            this.isTurn = true
          }
        }
      })
      this.discardPile = data.discardPile;
      this.playerHand();
      this.dealed = !this.dealed
    },
    newTurn(data) {
      this.deck = data.deck;
      let iterator;
      console.log(data.players)
      data.players.forEach((player, i) => {
        if (player.isTurn === true) {
          data.players[i].isTurn = false;
          iterator = (i + 1) % data.players.length;
          console.log(iterator);
        }
      })
      data.players[iterator].isTurn = true;
      data.players.forEach((player) => {
        if (player.id === this.userId) {
          if (player.isTurn === true) {
            this.isTurn = true
          }
        }
      })
      this.players = data.players;
      this.discardPile = data.discardPile;
      this.playerHand();
    }
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
      this.discardPile.push(deck.shift());
      this.deck = deck;
      this.players[this.setTurnOrder()].isTurn = true
      await axios.post(`/api/games/${this.gameId}/rounds/${this.roundId}/init`, {
        players: this.players,
        deck: this.deck,
        topCard: this.discardPile,
      });
    },
    setTurnOrder() {
      let dealerId = this.userId
      let result;
      this.players.forEach((player, i) => {
        if (player.id === dealerId) {
          result = i + 1
        }
      })
      return result
    },
    playerHand() {
      this.players.forEach((player) => {
        if (player.id == this.userId) {
          this.currentPlayer = player;
        }
      })
    },
    flip() {
      this.stack.push(this.deck.shift());
    },
    checkValidity(card) {
      if (this.isTurn === false) {
        return false
      }
      let topCard = this.discardPile[this.discardPile.length - 1]
      if (topCard.suite === card.suite) {
        return true
      }
      if (topCard.text === card.text) {
        return true
      }
      if (card.text === '8') {
        return true
      }
      return false
    },
    async playCard(data) {
      let isValidMove = this.checkValidity(data)
      if (isValidMove) {
        let updatedDeck = this.currentPlayer.cards.filter((card) => {
          return data.text === card.text ? data.suite === card.suite ? false : true : true
        })
        this.currentPlayer.cards = updatedDeck
        this.discardPile.push(data)
        let updatedPlayers = this.players.map((player) => {
          if (player.id === this.currentPlayer.id) {
            return this.currentPlayer
          } else {
            return player
          }
        })
        this.players = updatedPlayers
        this.endTurn()
      } else {
        console.log('invalid card')
      }

    },
    async endTurn() {
      let response = await axios.post(`/api/games/${this.gameId}/rounds/${this.roundId}/endTurn`, {
        players: this.players,
        deck: this.deck,
        discardPile: this.discardPile
      })
      this.isTurn = false
      console.log(response)

    },
    addCardToHand(card) {
      this.currentPlayer.cards.push(card);
    },
  },
};

</script>
<style>
.footer {
  overflow-y: scroll;
}

</style>
