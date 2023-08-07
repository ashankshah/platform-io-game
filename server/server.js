// Server Side Program

// Load shared constants
const Constants = require('../public/constants.json');

const port = process.env.PORT || Constants.DEV_PORT;

// Creating Server
const express = require('express');
const app = express();
const server = app.listen(port);

// Getting Client Side
app.use(express.static('public'));
console.log("Server App listening on Port " + port);

// Creating Socket Ports for Clients
const socket = require('socket.io');
const io = socket(server);

// Checking for New Connections
io.sockets.on('connection', socket => {

	console.log('New Connection: ' + socket.id);
	
	// TODO
	// Recieve game movements from players
	// Process in game state
	// Broadcast new game state back out to players

	// Broadcasting Data to all other clients
	// socket.on(Constants.MESSAGES.MOUSE, data => {

	// 	// let recieveT = Date.now();
	// 	// console.log("sent: " + data.t);
	// 	// console.log("recieved: " + recieveT);
	// 	// console.log("diff: " + recieveT - data.t);

	// 	socket.broadcast.emit(Constants.MESSAGES.MOUSE, data);

	// }); 

	/*
	* Broadcast join
	* brocast disconnect
	* broadcast dead
	* broadcast movement

	*/

	
	// socket.on(Constants.MESSAGES.JOIN, data => {
	// 	console.log("SERVER CLIENT JOINED: " + data.id);
	// 	socket.broadcast.emit(Constants.MESSAGES.JOIN, data);
	// })


	socket.on(Constants.MESSAGES.POSITION, data => {
		socket.broadcast.emit(Constants.MESSAGES.POSITION, data);
	})
	
	// socket.on(Constants.MESSAGES.CLEAR, data => {
	// 	socket.broadcast.emit(Constants.MESSAGES.CLEAR, data);
	// });

	// Acknowledge ping
	socket.on("ping", (callback) => {
		callback();
	});

	// Checking for Disconnections
	socket.on('disconnect', () => {
		console.log('Client has disconnected: ' + socket.id);
		socket.broadcast.emit(Constants.MESSAGES.DISCONNECT, {id: socket.id});
	});

});
