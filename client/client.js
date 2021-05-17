var net = require('net');
var socket = new net.Socket();
var fs = require('fs');
var path = require('path');

var packets = 0;
var buffer = new Buffer.alloc(0);
var filename = ""
var evt = ''
var readlineSync = require('readline-sync')

var userType = "0"

socket.connect(5000, "127.0.0.1", function(){


});


socket.on('data', function (chunk) {

  if (packets == 0){

    userType = chunk.toString()
    console.log(userType);
    if(userType=="0"){
      var dirName = readlineSync.question("which folder do you want to sync?: ")
    }
    else{
      
    }

  }
  if (packets == 1) {
    nameEvt = chunk.toString().split("--");
    filename = nameEvt[0]
    evt = nameEvt[1]
    console.log(filename);
    console.log(evt);
    packets++;
    if (evt == 'remove') {
      fs.unlinkSync(filename)
      packets = 1;
    }

  } 
  if(packets > 1 ) {

    if (evt == 'update') {
      console.log(chunk);
      buffer = Buffer.concat([buffer, chunk]);
      var writeStream = fs.createWriteStream(path.join(__dirname, filename));
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
  }






});

socket.on('close', function () {
  console.log("total packages", packets);

  /*if (evt == 'update') {
      var writeStream = fs.createWriteStream(path.join(__dirname, filename));
      console.log("buffer size", buffer.length);
      while(buffer.length){
        var head = buffer.slice(0, 4);
        console.log("head", head.toString());
        if(head.toString() != "FILE"){
          console.log("ERROR!!!!");
          process.exit(1);
        }
        var sizeHex = buffer.slice(4, 8);
        var size = parseInt(sizeHex, 16);
      
        console.log("size", size);
      
        var content = buffer.slice(8, size + 8);
        var delimiter = buffer.slice(size + 8, size + 9);
        console.log("delimiter", delimiter.toString());
        if(delimiter != "@"){
          console.log("wrong delimiter!!!");
          process.exit(1);
        }

        writeStream.write(content);
        buffer = buffer.slice(size + 9);
    }

  setTimeout(function(){
    writeStream.end();
  }, 2000);
  }
  else{
    fs.unlinkSync(filename)
  }*/

});