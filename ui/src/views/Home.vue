<template>
  <v-container>
    <h1 class=".display-4">Sevens Online</h1>
    <v-container v-if="lobby">
      <Lobby />
    </v-container>
    <v-container v-if="game">
      <Game :userId="user.playerId" :gameId="currentGame" />
    </v-container>
  </v-container>
</template>
<script>
import axios from 'axios';
import Game from '../components/Game'
import Lobby from '../components/Lobby'
export default {
  components: {
    Game,
    Lobby,
  },
  data() {
    return {
      lobby: true,
      game: false,
      currentGame: null,
      gameSocket: false,
      defaultSocket: false,
      user: {
        username: null,
        playerId: null,
      }
    };
  },
  sockets: {
    connect() {
      this.defaultSocket = true;
    },
    startGame(data) {
      this.currentGame = data.gameId;
      this.lobby = false;
      this.game = true;
    },
  },
  methods: {
    addUserToData(data) {
      this.user = data
    }
  }
};

</script>
