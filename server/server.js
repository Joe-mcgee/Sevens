const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/sevensDB';
const dbName = 'sevensDB';

const gameRouter = require('./routers/games');
const userRouter = require('./routers/users');

const bodyParser = require('body-parser');

app.set('socketio', io);



function* idGen() {
  let index = 0;
  while (index < index + 1) {
    yield index++
  }
}

let _idGenerator = idGen();

app.use((req, res, next) => {
  res.locals.idGen = _idGenerator;
  next();
})

const client = new MongoClient(dbUrl);
let _db = null;

client.connect((err, client) => {
  // reset db for dev
  client.db('sevensDB').dropDatabase();
  _db = client.db('sevensDB');
});

app.use((req, res, next) => {
  res.locals.db = _db;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/games', gameRouter());
app.use('/api/users', userRouter());


class Game {
	constructor(gameId, creator) {
		this.gameId = gameId;
		this.creator = creator;
		this.players = [creator];
		this.room = `/game/${gameId}`;
	}
}


io.on('connection', (socket) => {
	console.log('hello socket');
  socket.on('newRoom', (room) => {
    socket.join(room)
  })
});

app.get('/api', (req, res) => {
  res.json({ success: true });
});


app.get('/api/games/:gameid', async (req, res) => {
	console.log(req.params.gameid)
	const game = await res.locals.db.collection('games').findOne({_id: Number(req.params.gameid)})
	console.log(game)
})


app.post('/api/games/:gameid/start', async (req, res) => {
  const idAsNum = Number(req.params.gameid)
  let response = await res.locals.db.collection('games')
    .find({ _id: idAsNum }).toArray()

  const data = {
    _id: iterId(),
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
        res.json({ success: true })
        return
      })
  }
})

http.listen(3000, () => {
  console.log('listening on 3000')
});
