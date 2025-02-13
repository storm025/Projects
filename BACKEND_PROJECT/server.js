const http = require("http");

const host='localhost';
const port = 3030;

const server = http.createServer((req, res) => {
    res.write("Welcome to StorM Server");
    res.end();
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

