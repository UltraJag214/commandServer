const net = require('net');
const fs = require('fs');

console.clear();

const clients = [];
let newClientId = 0;
let currentUsers = 0;
let adminPassword = 'asdf';

process.stdin.setEncoding('utf8');
const chatLog = fs.createWriteStream('./chat.log');

const server = net.createServer(socket => {
    socket.id = ++newClientId

    socket.username = `Guest${newClientId}`
    socket.write('Welcome to the chat room!');
    currentUsers += 1;
    console.log(`User ${socket.id} Joined the Chat`);

    clients.forEach(client => {
        if (client != socket) {
            client.write(`User ${socket.id} Joined the Chat`);
            chatLog.write(`User ${socket.id} Joined the Chat` + '\n');
        }
    });

    clients.push(socket)

    socket.setEncoding('utf8');
    socket.on('data', function (data) {
        data = data.toString().trim()
        if (data.match(/^\/w/)) {
            whisper(data)
        } else if (data.match(/^\/username/)) {
            updateUsername(data)
        } else if (data.match(/^\/kick/)) {
            removeUser(data)
        } else if (data.match(/^\/clientlist$/)) {
            displayClientList(data)
        } else

            clients.filter(client => {
                if (client.id !== socket.id) {
                    client.write(`User ${socket.id}: ${data}`);
                }
            })
        chatLog.write(`User ${socket.id}: ${data}` + '\n');
    });

    function whisper(dataString) {
        let dataArray = dataString.split(' ');
        dataArray.shift();
        let filterStorage = clients.filter(user => {
            if (user.id == dataArray[0]) {
                return user;
            }
        })

        if (filterStorage.length) {
            let messageArray = dataArray.slice(1);
            filterStorage[0].write(`message from ${socket.id}: ${messageArray.join(' ')}`)
        } else {
            socket.write('We cannot write to that user.')
        }
    };

    function updateUsername(dataString) {
        let dataArray = dataString.split(' ');
        dataArray.shift();
        let filterStorage = clients.filter(user => {
            if (user.id == dataArray[0]) {
                return user;
            }
        })
        if (socket.id == dataArray[0]) {
            socket.write("you are already using this user name")
        } else if (filterStorage.length) {
            socket.write("Somebody else is already using that name")
        }
        else {
            clients.filter(user => {
                if (user.id == socket.id) {
                    let oldId = user.id;
                    user.id = dataArray[0];
                    clients.filter(user => {
                        if (user.id !== socket.id) {
                            user.write(`User: ${oldId} changed their username to ${socket.id}`);
                            chatLog.write(`User: ${oldId} changed their username to ${socket.id}` + '\n');
                        }
                    })
                }
            })
        }


    };
    function removeUser(dataString) {
        let dataArray = dataString.split(' ');
        dataArray.shift();
        let userIndex;
        let filterStorage = clients.filter((user, index) => {
            if (user.id == dataArray[0]) {
                userIndex = index;
                return user;
            }
        })
        if (dataArray[1] == adminPassword && !filterStorage.length) {
            socket.write("That username does not exist")
        } else if (dataArray[1] != adminPassword) {
            socket.write("That is not the correct password")
        } else {
            filterStorage[0].write("You have been kicked from the chat")
            clients.splice(userIndex, 1);
            clients.forEach(user => {
                user.write(`${filterStorage[0].id} has been kicked from the chat`)
                chatLog.write(`${filterStorage[0].id} has been kicked from the chat` + '\n')
            })
        }

    };
    function displayClientList(dataString) {
        socket.write('These are the current users:\n');
        clients.forEach(user => {
            socket.write(`${user.id},\n`)
        })
    };

    process.stdin.on('data', function (data) {
        socket.write("server: " + data);
    });

    socket.on('end', () => {
        // removes client from array
        const index = clients.indexOf(socket)
        clients.splice(index, 1)
        clients.forEach(client => {
            if (client != socket) {
                client.write(`${socket.username} left the Chat`);
                console.log(`${socket.username} left the Chat`);
                chatLog.write(`${socket.username} left the Chat` + '\n');
            }
        })
    });

}).listen(5000);

console.log('listening on port 5000');