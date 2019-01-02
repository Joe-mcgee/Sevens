<template>
  <v-container>
    <h1 class=".display-4">Sevens Online</h1>
    <v-container v-if="lobby">
      <v-form>
        <v-container>
          <v-layout row wrap>
            <v-flex xs4>
              <v-text-field label="Name" v-model="user.userName"></v-text-field>
            </v-flex>
            <v-flex xs4>
              <v-text-field label="Password" v-model="user.password">
              </v-text-field>
            </v-flex>
            <v-flex xs4>
              <v-btn @click="registerNewUser">Submit
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
      <v-btn @click="newLobby">Create Lobby</v-btn>
      <v-data-table :headers="lobbyHeaders" :items="lobbies">
        <template slot="items" slot-scope="lobby">
          <td>{{lobby.item._id}}</td>
          <td>{{lobby.item.player_ids.length}}</td>
          <td>
            <v-btn @click="joinLobby(lobby.item._id)">
              Join Lobby
            </v-btn>
            <v-btn @click="startGame(lobby.item._id)">Start
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-container>
    <v-container v-if="game">
      <Game :userId="user.playerId" :gameId="currentGame" />
    </v-container>
  </v-container>
</template>
<script>
import axios from 'axios';
import Game from '../components/Game'
export default {
  components: {
    Game
  },
  data() {
    return {
      lobby: true,
      game: false,
      currentGame: null,
      user: {
        userName: null,
        password: null,
        playerId: null,
      },
      /* beautify ignore:start */
      lobbyHeaders: [{
        text: 'Lobby Name',
        align: 'left',
        sortable: true,
        value: 'name',
      },
      {
        text: 'Players',
        align: 'left',
        sortable: true,
        value: 'players',
      },
      ],
      playerHeaders: [{
        text: 'Avatar',
        aligh: 'left',
        sortable: false,
        value: 'avatar',
      },
      {
        text: 'Player Name',
        align: 'left',
        sortable: true,
        value: 'name',
      },
      {
        text: '* / game',
        align: 'left',
        sortable: true,
        value: 'astericksPerGame',
      },
      ],
      players: [],
      lobbies: [],
      gameSocket: false,
      defaultSocket: false,
      /* beautify ignore:end */
    };
  },
  sockets: {
    connect() {
      this.defaultSocket = true;
    },
    createRoom: function(data) {
      console.log(data)
      this.$socket.emit("createRoom", data.address)
      this.getLobbies();
    },
    joinRoom(data) {
      console.log(data.address, "address")
      this.$socket.emit("joinRoom", data.address)
      console.log('a player joined the lobby')
      this.getLobbies();
    },
    startGame(data) {
      console.log('game started! :D')
      this.currentGame = data.gameId,
      this.lobby = false
      this.game = true
    },
  },
  created() {
    this.getLobbies();
  },
  methods: {
    async registerNewUser() {
      const response = await axios.post('/api/users/new', this.user);
      this.user.playerId = response.data.playerId
    },
    async newLobby() {
      const response = await axios.post('/api/games/new', { userName: this.user.userName });
    },

    async getLobbies() {
      const getResponse = await axios.get('/api/games');
      getResponse.data.forEach((openLobby) => {
        this.lobbies.push(openLobby);
      });

      const unique = new Map(this.lobbies.map(obj => [obj._id, obj]));
      const uniques = Array.from(unique.values());
      this.lobbies = uniques;
    },
    async joinLobby(gameId) {
      const response = await axios.post(`/api/games/${gameId}/join`, { playerId: this.user.playerId });
      if (response.data.success === true) {
        this.lobbies.forEach((lobby, i) => {
          if (lobby._id === gameId) {
            this.lobbies[i].player_ids.push(2);
          }
        });
      }
    },
    async startGame(gameId) {
      const response = await axios.post(`/api/games/${gameId}/start`);
    },
  },
};

</script>
