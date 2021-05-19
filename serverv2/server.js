var net = require('net');
var clients = []
var packages = 0;
var client0diffieargs = Buffer.from("")
var bsplit = require('buffer-split')
var delim = new Buffer.from('split')

var buffer = new Buffer.alloc(0);


bufId = Buffer.from("id")
buf1 = Buffer.from("1")
buf0 = Buffer.from("0")

var server = net.createServer(function (client) {
  //client type - 0 -> principal, 1 -> second

  if (packages == 1 && clients.length == 1) {
    client.name = client.remoteAddress + ':' + client.remotePort
    clients.push(client)
    let idUserdiffieargs = joinBuffers([bufId, buf1, client0diffieargs])
    clients[1].write(idUserdiffieargs); //principal
    clients[1].pipe(clients[1]);
    console.log(idUserdiffieargs);
    packages++
  }

  if (clients.length == 0) {
    client.name = client.remoteAddress + ':' + client.remotePort
    clients.push(client)
    client.write(joinBuffers([bufId, buf0])); //principal
    client.pipe(client);
    console.log(clients.length);
    packages++
  }

  client.on('data', function (data) {

    const dataBufferArgs = bsplit(data, delim); // splits the data into spaces  

    if (dataBufferArgs.length === 0) { // in case there is no command
      client.write("ERROR no data");
      return; // prevents other code from running
    }
    const command = dataBufferArgs[0].toString(); // gets the command

    if (command === "df") { // id command
      if (dataBufferArgs.length === 4) {
        client0diffieargs = data
      }
      else {
        client.write("ERROR no data");
        return; // prevents other code from running
      }
    }
    if (command === "cliente1key") { // id command
      if (dataBufferArgs.length === 2) {
        clients[0].write(data)
        clients[0].pipe(clients[0]);
      }
      else {
        client.write("ERROR no data");
        return; // prevents other code from running
      }
    }

    if (command === "upd") { // id command
      if (dataBufferArgs.length === 3) {
        clients[1].write(data)
        clients[1].pipe(clients[1]);
      
        console.log(data);
        buffer = Buffer.concat([buffer, dataBufferArgs[2]]);
        var writeStream = fs.createWriteStream(path.join(__dirname, dataBufferArgs[1]));
        console.log("buffer size", buffer.length);
        while (buffer.length) {
          var head = buffer.slice(0, 4);
          console.log("head", head.toString());
          if (head.toString() != "FILE") {
            console.log("ERROR!!!!");
            process.exit(1);
          }
          var sizeHex = buffer.slice(4, 8);
          var size = parseInt(sizeHex, 16);
      
          console.log("size", size);
      
          var content = buffer.slice(8, size + 8);
          var delimiter = buffer.slice(size + 8, size + 9);
          console.log("delimiter", delimiter.toString());
          if (delimiter != "@") {
            console.log("wrong delimiter!!!");
            process.exit(1);
          }
      
          writeStream.write(content);
          buffer = buffer.slice(size + 9);
      
        }
        packets = 1;
      
        setTimeout(function () {
          writeStream.end();
        }, 2000);
      }
      else {
        client.write("ERROR no data");
        return; // prevents other code from running
      }
    }

    if (command === "rmv") { // id command
      if (dataBufferArgs.length === 2) {
        clients[1].write(data)
        clients[1].pipe(clients[1]);
        
        //remove
        filename = dataBufferArgs[1];
        fs.unlinkSync(filename)


      }
      else {
        client.write("ERROR no data");
        return; // prevents other code from running
      }
    }

  });

  client.on('error', function () {
    console.log("erro do cliente");
  });

  client.on('close', function () {
    console.log("comunicação com cliente terminada");
    clients.pop()

  });

});

server.listen(5000);

server.on('listening', function () {
  console.log("servidor escutando");
});
server.on('error', function (err) {
  console.log("erro do servidor");
});

function joinBuffers(buffers, delimiter = 'split') {
  let d = Buffer.from(delimiter);
  return buffers.reduce((prev, b) => Buffer.concat([prev, d, b]));
}


