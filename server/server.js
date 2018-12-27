const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io');
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/sevensDB';
const dbName = 'sevensDB';
const bodyParser = require('body-parser');

let idGen = 0;
function iterId() {
	return idGen++
}

const client = new MongoClient(dbUrl);
const ws = io.listen(server);
let _db = null;


client.connect((err, client) => {
	// reset db for dev
	client.db('sevensDB').dropDatabase()
	_db = client.db('sevensDB');
})

app.use((req, res, next) => {
	res.locals.db = _db;
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



ws.on('connection', (sock) => {
	console.log('client connected')
})

app.get('/api', (req, res) => {
	res.json({"success": true})
})


app.post('/api/games/new', async (req, res) => {
	console.log(req.body)
	let user = await res.locals.db.collection('users').find({ name: req.body.userName}).toArray()
	console.log(user)


	const data = {
		_id: iterId(),
		isOpen: true,
		creator_id: user._id,
		player_ids: [user._id],
		date: new Date
	}

	let newRoom = ws.of(`/game/${data._id}`);
	newRoom.on('connection', (socket) => {
		console.log('a player connected');
	});

	res.locals.db.collection('games').insertOne(data, (err, dbres) => {
		if (err != null) {
			res.json({"success": false, error: err })
			return
		}

		res.json({"success": true})
		return
	});
})

app.get('/api/games', async (req, res) => {
	let games = await res.locals.db.collection('games').find( { isOpen: true } ).toArray()
	res.json(games)
	return

})

app.post('/api/games/:gameid/join', async (req, res) => {
	let idAsNum = Number(req.params.gameid);
	res.locals.db.collection('games').findOneAndUpdate({ _id: idAsNum }, { $push: {player_ids: 2} } , (err, object) => {
		if (err != null) {
			res.json({success: false, error: err})
			return
		}
		res.json({success: true})
	})
})

app.post('/api/users/new', async (req, res) => {
	console.log(req.body)
	let data = {
		_id: iterId(),
		name: req.body.userName,
		password: req.body.password
	}

	res.locals.db.collection('users').insertOne(data, (err, dbres) => {
		if (err != null) {
			res.json({success: false, err: err})
			return
		}
		res.json({success: true})
	})
})
server.listen(3000);