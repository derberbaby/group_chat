var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname + "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
});

var server = app.listen(6789, function() {
  console.log('listening on port 6789');
});

var io = require('socket.io').listen(server);

var users = [];

class User {
  constructor(name) {
    this.name = name;
    this.id;
  }
}

var messages = [];

io.sockets.on('connect', (socket) => {
  socket.emit("history", messages);
  //all the socket code goes in here!
  socket.on("new_user", (data) => {
    console.log(data);
    let user = new User(data.name);
    user.id = socket.id;
    users.push(user);
    // need to add attribute to be able to log joins and leaves in history**
    io.emit("new_user_added", {name: user.name});
  })
  //  EMIT:
  // socket.emit('my_emit_event');
  //  BROADCAST:
  // socket.broadcast.emit("my_broadcast_event");
  //  FULL BROADCAST:
  // io.emit("my_full_broadcast_event");

  socket.on("send_msg", (data)=> {
    messages.push(data);
    io.emit('add_msg', data);
  });

  socket.on("disconnect", () => {
    var bye_user;
    for(let i = 0; i < users.length; i++) {
      if(users[i].id == socket.id) {
        bye_user = users[i].name;
        users.splice(i, 1);
      }
    }
    io.emit("left", {name: bye_user})
  })
});
