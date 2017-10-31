'use strict';

const url = require('url');
const http = require('http');
const cluster = require('cluster');
const FileSend = require('./dist/index');
const NUMCPUS = require('os').cpus().length;

// create server
function createServer(root, port) {
  http.createServer(function(request, response) {
    const send = new FileSend(request, url.parse(request.url).pathname, {
      root: root || process.cwd(),
      maxAge: '3day',
      ignore: ['/**/.*?(/*.*|/)'],
      index: ['index.html']
    });

    send.on('headers', function(headers) {
      const message = 'URL      : ' + request.url
        + '\r\nPATH     : ' + send.path
        + '\r\nROOT     : ' + send.root
        + '\r\nREALPATH : ' + send.realpath
        + '\r\nSTATUS   : ' + send.statusCode
        + '\r\nHEADERS  : ' + JSON.stringify(headers, null, 2)
        + '\r\n-----------------------------------------------------------------------------------------';

      // process.send(message);
    });

    send.pipe(response);
  }).listen(port || 8080);
}

if (cluster.isMaster) {
  // fork workers
  for (let i = 0; i < NUMCPUS; i++) {
    const worker = cluster.fork();

    // worker is listening
    if (i === NUMCPUS - 1) {
      worker.on('listening', (address) => {
        console.log(
          'Server run at:',
          (address.address || '127.0.0.1') + ':' + address.port,
          '\r\n-----------------------------------------------------------------------------------------'
        );
      });
    }

    worker.on('message', function(message) {
      console.log(message);
    });
  }
} else {
  // workers can share any tcp connection
  // in this case it is an http server
  createServer('F://电影文件');
}
