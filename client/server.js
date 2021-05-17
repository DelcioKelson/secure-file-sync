var net = require('net');
var fs = require('fs');
var path = require('path');
var fileName = "escondidas.md";
var filePath = path.join(__dirname, fileName);
var watch = require('node-watch');
var clients = []

var server = net.createServer(function (client) {
  var packages = 0;
  var totalBytes = 0;
  client.name = client.remoteAddress + ':' + client.remotePort
  clients.push(client)
  
  //client type - 0 -> principal, 1 -> second
  if(clients.length > 1){
    client.write("1");
  }
  else{
    client.write("0"); //principal
  }


  watch('./', { recursive: true }, function (evt, name) {
    console.log('%s changed.', name);
    client.write(name + "--" + evt);
    client.pipe(client);

    if (evt == 'update') {

      var readStream = fs.createReadStream(name, { highWaterMark: 16384 });
      readStream.on('data', function (chunk) {
        packages++;
        var head = new Buffer.from("FILE");
        var sizeHex = chunk.length.toString(16);
        while (sizeHex.length < 4) {
          sizeHex = "0" + sizeHex;
        }
        var size = new Buffer.from(sizeHex);
        console.log("size", chunk.length, "hex", sizeHex);
        var delimiter = new Buffer.from("@");
        var pack = Buffer.concat([head, size, chunk, delimiter]);
        totalBytes += pack.length;
        client.write(pack);

        readStream.on('close', function () {
          //client.end();
          console.log("total packages", packages);
          console.log("total bytes sent", totalBytes);
        });
      });

    }

    if (evt == 'remove') {
      // on delete
      //client.end();

    }


  });

  client.on('error', function () {
    console.log("error del cliente");
  });

  client.on('close', function () {
    console.log("terminó comunicación con cliente");
  });

});

server.listen(5000);

server.on('listening', function () {
  console.log("servidor escuchando");
});
server.on('error', function (err) {
  console.log("error del servidor");
});