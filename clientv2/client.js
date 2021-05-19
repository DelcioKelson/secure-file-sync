var net = require('net');
var client = new net.Socket();
client.connect(5000, "127.0.0.1");

var fs = require('fs');
const {
  createReadStream,
  createWriteStream,
} = fs;
var path = require('path');
var watch = require('node-watch');
var bsplit = require('buffer-split')
var delim = new Buffer.from('split')
var packets = 0;
var buffer = new Buffer.alloc(0);
var filename = ""
var evt = ''
var readlineSync = require('readline-sync')
const {
  generateKeyPairSync,
  createSign,
  createVerify,
  scryptSync,
  createDecipheriv,
  scrypt,
  randomFill,
  createCipheriv,
  createDiffieHellman,
} = require('crypto');

const {
  pipeline
} = require('stream');


var privateKey, publicKey

var SecretKey = Buffer.from("")
var client0Diffie
var client1Diffe

var userType = "-"

client.on('data', function (data) {

  const dataBufferArgs = bsplit(data, delim); // splits the data into spaces
  const command = dataBufferArgs[0].toString(); // gets the command

  if (dataBufferArgs.length === 0) { // in case there is no command
    client.write("ERROR no data");
    return; // prevents other code from running
  }
  if (command == "id") { // id command
    console.log(command);

    if (dataBufferArgs.length >= 2) {
      userType = dataBufferArgs[1]
      if (userType == "0") {
        privateKey, publicKey = generateKeyPairSync('rsa', {
          modulusLength: 2048,
        });
        client0Diffie = createDiffieHellman(1024);
        cliente0Key = client0Diffie.generateKeys();
        console.log(userType);
        let bufOption = Buffer.from("df")
        let client0diffieargs = joinBuffers([bufOption, client0Diffie.getPrime(), client0Diffie.getGenerator(), cliente0Key]);
        console.log(bsplit(client0diffieargs, delim)[0].toString());
        client.write(client0diffieargs); //principal
        client.pipe(client);
      }

      if (userType == "1" && dataBufferArgs[2] == "df") {
        console.log(dataBufferArgs[2]);

        const prime = dataBufferArgs[3]
        const generator = dataBufferArgs[4]
        const cliente0Key = dataBufferArgs[5]
        client1Diffe = createDiffieHellman(prime, generator)
        const cliente1Key = client1Diffe.generateKeys()
        SecretKey = client1Diffe.computeSecret(cliente0Key)
        let bufOption = Buffer.from("cliente1key")
        client.write(joinBuffers([bufOption, cliente1Key]))
        client.pipe(client);
        console.log(SecretKey);
      }
      console.log("passei0 id" + userType)
    }
  }

  if (command === "cliente1key") { // id command
    if (dataBufferArgs.length === 2) {
      if (userType == "0") {
        SecretKey = client0Diffie.computeSecret(dataBufferArgs[1])
        console.log(SecretKey);
      }
    }
  }

  if (command == "upd") { // id command

    console.log(data);
    buffer = Buffer.concat([buffer, dataBufferArgs[2]]);
    var writeStream = fs.createWriteStream(path.join('/home/deli/Documents/SSI/tg/client', dataBufferArgs[1]));
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

  if (command == "rmv") { // id command
    filename = dataBufferArgs[1];
    fs.unlinkSync(filename)
  }
});

client.on('error', function () {
  client.connect(5000, "127.0.0.1");
});

client.on('close', function () {
});

function joinBuffers(buffers, delimiter = 'split') {
  let d = Buffer.from(delimiter);

  return buffers.reduce((prev, b) => Buffer.concat([prev, d, b]));
}


function encryp(password, filename) {
  //'Password used to generate key';

  const algorithm = 'aes-192-cbc';

  // First, we'll generate the key. The key length is dependent on the algorithm.
  // In this case for aes192, it is 24 bytes (192 bits).
  scrypt(password, 'salt', 24, (err, key) => {
    if (err) throw err;
    // Then, we'll generate a random initialization vector
    randomFill(new Uint8Array(16), (err, iv) => {
      if (err) throw err;

      const cipher = createCipheriv(algorithm, key, iv);

      const input = createReadStream(filename);
      const output = createWriteStream(filename + '.enc');

      pipeline(input, cipher, output, (err) => {
        if (err) throw err;
      });
    });
  });
}

function decryp(password, filename) {
  //'Password used to generate key'

  const algorithm = 'aes-192-cbc';
  // Use the async `crypto.scrypt()` instead.
  const key = scryptSync(password, 'salt', 24);
  // The IV is usually passed along with the ciphertext.
  const iv = Buffer.alloc(16, 0); // Initialization vector.

  const decipher = createDecipheriv(algorithm, key, iv);

  const input = createReadStream(filename + '.enc');
  const output = createWriteStream(filename);

  input.pipe(decipher).pipe(output);
}

watch('./', { recursive: true }, function (evt, name) {
  console.log('%s changed.', name);

  if (evt == 'update') {
    upd = Buffer.from("upd")
    nameBuffer = Buffer.from(name)
    var totalBytes = 0;

    var readStream = fs.createReadStream(name, { highWaterMark: 16384 });
    readStream.on('data', function (data) {
      var head = new Buffer.from("FILE");
      var sizeHex = data.length.toString(16);
      while (sizeHex.length < 4) {
        sizeHex = "0" + sizeHex;
      }
      var size = new Buffer.from(sizeHex);
      console.log("size", data.length, "hex", sizeHex);
      var delimiter = new Buffer.from("@");
      var pack = Buffer.concat([head, size, data, delimiter]);
      totalBytes += pack.length;
      client.write(joinBuffers([upd, nameBuffer,pack]));
      client.pipe(client);

      readStream.on('close', function () {
        //client.end();
        console.log("total bytes sent", totalBytes);
      });
    });

  }

  if (evt == 'remove') {
    // on delete
    //client.end();
    rmv = Buffer.from("rmv")
    nameBuffer = Buffer.from(name)
    client.write(joinBuffers([rmv, nameBuffer]));
    client.pipe(client);
  }

});