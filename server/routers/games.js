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
      io.emit('roomCreated', {message: 'room created', address: address })
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
      io.to(address).emit('joinedLobby', "a player joined the lobby")
      res.json({ success: true });
    });
  });

  return router;
}
