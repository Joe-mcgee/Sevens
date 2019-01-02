const express = require('express');

const router = express.Router();

import { shuffle, newDeck } from '52-deck';

module.exports = () => {

  router.get('/', async (req, res) => {
    const games = await res.locals.db.collection('games').find({ isOpen: true }).toArray();
    res.json(games);
    return
  });

  router.post('/new', async (req, res) => {
    let io = req.app.get('socketio');
    const user = await res.locals.db.collection('users').findOne({ name: req.body.userName })
    console.log('user', user)
    const data = {
      _id: res.locals.idGen.next().value,
      isOpen: true,
      creator_id: user._id,
      player_ids: [user._id],
      date: new Date(),
    };

    res.locals.db.collection('games').insertOne(data, (err, dbres) => {
      if (err != null) {
        res.json({ success: false, error: err });
        return;
      }
      let address = `/games/${data._id}`
      io.emit('createRoom', { message: 'room created', address: address })
      res.json({ success: true });
    });
  });

  router.get('/:gameid', async (req, res) => {
    console.log(req.params.gameid)
    const game = await res.locals.db.collection('games').findOne({ _id: Number(req.params.gameid) })
    console.log('game', game)
    res.json({ game })
  })

  router.post('/:gameid/join', async (req, res) => {
    let io = req.app.get('socketio');
    const idAsNum = Number(req.params.gameid);
    const playerId = req.body.playerId
    res.locals.db.collection('games').findOneAndUpdate({ _id: idAsNum }, { $push: { player_ids: playerId } }, (err, object) => {
      console.log(object)
      if (err != null) {
        res.json({ success: false, error: err });
        return;
      }
      let address = `/games/${req.params.gameid}`
      io.emit('joinRoom', { address: address })
      res.json({ success: true });
    });
  });

  router.post('/:gameid/start', async (req, res) => {
    let io = req.app.get('socketio');
    const idAsNum = Number(req.params.gameid)
    let response = await res.locals.db.collection('games')
      .findOne({ _id: idAsNum })
    console.log('response', response)
    const data = {
      _id: res.locals.idGen.next().value,
      game_id: response._id,
      winner: null,
      astericks_earned: null,
      deck: null,
      shuffles: null,

    }
    if (response) {
      let round = res.locals.db.collection('rounds')
        .insertOne(data, (err, dbRes) => {
          if (err != null) {
            res.json({ success: false, error: err })
            return
          }
          const address = `/games/${req.params.gameid}`
          io.in(address).emit('startGame', { gameId: req.params.gameid })
          res.json({ success: true })
          return
        })
    }
  });

  router.get('/:gameid/rounds', async (req, res) => {
    let roundData = await res.locals.db.collection('rounds')
      .find({ game_id: Number(req.params.gameid) }).toArray()
    res.json(roundData)
    return

  });
  router.post('/:gameid/rounds/:roundid/shuffle', async (req, res) => {
    let playerId = req.body.playerId

    let gameData = await res.locals.db.collection('games')
      .find({ _id: Number(req.params.gameid) }).toArray()

    let roundData = await res.locals.db.collection('rounds')
      .find({ _id: Number(req.params.roundid) })

    let deck = shuffle(newDeck());

    res.json({ deck })
    return
  })

  router.post('/:gameid/rounds/:roundid/init', async (req, res) => {
    let io = req.app.get('socketio');
    let data = {
      _id: res.locals.idGen.next().value,
      game_id: req.params.gameid,
      round_id: req.params.roundid,
      players: req.body.players,
      deck: req.body.deck,
      discardPile: [req.body.topCard]
    }
    let address = `/games/${req.params.gameid}`
    let response = await res.locals.db.collection('turns')
      .insertOne(data, (err, dbRes) => {
        console.log('in insert')
        console.log(err)
        if (err === null) {
          const address = `/games/${req.params.gameid}`
          console.log('data', data)
          io.in(address).emit('startTurn', data)
          res.json({ success: true })
          return
        } else {
          res.json({success: false})
          return
        }
      })
  })

  return router;
}
