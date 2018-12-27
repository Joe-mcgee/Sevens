<template>
  <v-container>
    <h1 class=".display-4">Sevens Online</h1>
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
  },
  created() {
    this.getLobbies();
  },
  methods: {
    async registerNewUser() {
      const response = await axios.post('/api/users/new', this.user);
      console.log(response);
    },
    async newLobby() {
      const response = await axios.post('/api/games/new', { userName: this.user.userName });
      if (response.data.success === true) {
        this.getLobbies();
      }
    },
    async getLobbies() {
      const getResponse = await axios.get('/api/games');
      getResponse.data.forEach((openLobby) => {
        this.lobbies.push(openLobby);
      });
    },
    async joinLobby(gameId) {
      const response = await axios.post(`/api/games/${gameId}/join`);
      if (response.data.success === true) {
        this.lobbies.forEach((lobby, i) => {
          if (lobby._id === gameId) {
            this.lobbies[i].player_ids.push(2);
          }
        });
      }
    },
  },
};

</script>
