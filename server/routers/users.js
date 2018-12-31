const express = require('express');

const router = express.Router();

module.exports = () => {

  router.post('/new', async (req, res) => {
    console.log(req.body);
    const data = {
      _id: res.locals.idGen.next().value,
      name: req.body.userName,
      password: req.body.password,
    };

    res.locals.db.collection('users').insertOne(data, (err, dbres) => {
      if (err != null) {
        res.json({ success: false, err });
        return;
      }
      res.json({ success: true, playerId: data._id });
    });
  });
  return router
}
