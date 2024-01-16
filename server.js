const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();
 

const server = http.createServer(app);
const { CLIENT_URL } = require('./config/config');

// Connecting the database
connectDB();

// Initialise a Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/users' , require('./routes/users'));
app.use('/profile' , require('./routes/profile'));
app.use('/auth' , require('./routes/auth'));



const io = require('socket.io')(server , {
	cors: {
		origin: CLIENT_URL,
		methods: ['GET' , 'POST']
	}
});

const defaultValue = "";

io.on('connection' , (socket) => {
	socket.on('get-document' , (documentId) => {
		const document = defaultValue;
		socket.join(documentId);
		socket.emit('load-document' , document);

		socket.on('send-changes' , (delta) => {
			socket.broadcast.to(documentId).emit('receive-changes' , delta);
		});

		socket.on('save-document' , (data) => {

		});
	});
});

// Server static assests in production
// if ( process.env.NODE_ENV === 'production' ) {
// 	// set static folder
// 	app.use(express.static('client/build'));

// 	app.get('*' , (req , res) => {
// 		res.sendFile(path.resolve(__dirname , 'client' , 'build' , 'index.html'))
// 	});	
// }

const PORT = process.env.PORT || 5000;

server.listen(PORT , () => {
	console.log(`Server started on PORT : ${PORT}`);
});
