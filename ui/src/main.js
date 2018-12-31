import Vue from 'vue';
import './plugins/vuetify';
import VueSocketio from 'vue-socket.io-extended';
import io from 'socket.io-client';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
Vue.use(VueSocketio, io('http://localhost:3000'));
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
