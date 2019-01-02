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
  let index = 1;
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

io.on('connection', (socket) => {
	console.log('hello socket');
  socket.on('createRoom', (room) => {
    socket.join(room)
    console.log('room created')
  })
  socket.on('joinRoom', (room) => {
    socket.join(room)
    console.log('room joined triggered')
    socket.in(room).emit("playerJoin", "a player joined the lobby");
  })
});

app.get('/api', (req, res) => {
  res.json({ success: true });
});




http.listen(3000, () => {
  console.log('listening on 3000')
});
