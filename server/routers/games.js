const express = require('express');

const router = express.Router();

module.exports = () => {

  router.get('/', async (req, res) => {
    const games = await res.locals.db.collection('games').find({ isOpen: true }).toArray();
    res.json(games);
    return
  });

  router.post('/new', async (req, res) => {
    let io = req.app.get('socketio');
    const user = await res.locals.db.collection('users').find({ name: req.body.userName }).toArray();
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
      io.emit('createRoom', {message: 'room created', address: address })
      res.json({ success: true });
    });
  });

  router.post('/:gameid/join', async (req, res) => {
    let io = req.app.get('socketio');
    const idAsNum = Number(req.params.gameid);
    const playerId = req.body.playerId
    res.locals.db.collection('games').findOneAndUpdate({ _id: idAsNum }, { $push: { player_ids: playerId } }, (err, object) => {
      if (err != null) {
        res.json({ success: false, error: err });
        return;
      }
      let address = `/games/${req.params.gameid}`
      io.emit('joinRoom', {address: address})
      res.json({ success: true });
    });
  });

router.post('/:gameid/start', async (req, res) => {
  let io = req.app.get('socketio');
  const idAsNum = Number(req.params.gameid)
  let response = await res.locals.db.collection('games')
    .find({ _id: idAsNum }).toArray()

  const data = {
    _id: res.locals.idGen.next().value,
    game_id: response._id,
    winner: null,
    astericks_earned: null
  }
  if (response[0]) {
    let round = res.locals.db.collection('rounds')
      .insertOne(data, (err, dbRes) => {
        if (err != null) {
          res.json({ success: false, error: err })
          return
        }
        const address = `/games/${req.params.gameid}`
        io.in(address).emit('startGame', {gameId: req.params.gameid})
        res.json({ success: true })
        return
      })
  }
})

  return router;
}
