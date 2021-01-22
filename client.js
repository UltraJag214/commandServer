const fs = require('fs');
const net = require('net');
console.clear();

let client = net.createConnection({port: 5000}, () => {
    console.log("Connected");
});

client.on("error", (err) => {
    console.log(err);
});

client.setEncoding('utf8');

process.stdin.setEncoding('utf8');
process.stdin.pipe(client);

client.on('data', function(data) {
    console.log(data);
});

client.on('end', () => {
    console.log('server shut down ending session');
    process.exit();
});

client.on('close', () => {
    console.log('Connection Closed');
});

// client.write('Guest has joined the chat');

// process.stdin.on('data', function (data) {
//     client.write(data);
// });