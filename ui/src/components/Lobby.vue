<template>
  <v-container>
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
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
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
      /* beautify ignore:end */
    };
  },
  sockets: {
    createRoom(data) {
      this.$socket.emit('createRoom', data.address);
      this.getLobbies();
    },
    joinRoom(data) {
      this.$socket.emit('joinRoom', data.address);
      this.getLobbies();
    },
    startGame(data) {
      this.currentGame = data.gameId;
      this.lobby = false;
      this.game = true;
    },
  },
  methods: {
    async registerNewUser() {
      const response = await axios.post('/api/users/new', this.user);
      console.log(response.data)
      this.user.playerId = response.data.playerId;
      this.$emit('click', this.user);
    },
    async newLobby() {
      await axios.post('/api/games/new', { userName: this.user.userName });
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
      await axios.post(`/api/games/${gameId}/start`);
    },
  },
};

</script>
<style>
</style>
