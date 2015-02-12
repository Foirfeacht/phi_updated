#!/usr/bin/env node

var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    events = require('events');

var DEFAULT_PORT = 8000;

function main(argv) {
  new HttpServer({
    'GET': createServlet(StaticServlet),
    'HEAD': createServlet(StaticServlet),
    'POST': createServlet(StaticServlet),
  }).start(Number(argv[2]) || DEFAULT_PORT);
}

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function(port) {
  this.port = port;
  this.server.listen(port);
  sys.puts('Http Server running at http://localhost:' + port + '/');
  sys.puts('Hit CTRL-C to stop the server');
};

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function(req, res) {
  var logEntry = req.method + ' ' + req.url;
  if (req.headers['user-agent']) {
    logEntry += ' ' + req.headers['user-agent'];
  }
  sys.puts(logEntry);
  req.url = this.parseUrl_(req.url);
  var handler = this.handlers[req.method];
  if (!handler) {
    res.writeHead(501);
    res.end();
  } else {
    handler.call(this, req, res);
  }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',
  'json': 'application/json',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png'
};

StaticServlet.prototype.handleRequest = function(req, res) {
  var self = this;
  if (req.url.pathname.indexOf("/data_vaultq") === 0){
    var isThereCounter = req.url.query.cnt != undefined;
    if (req.method === 'GET'){
      if (isThereCounter){
        return self.getUpdatesVaultQ(req, res)
      } else {
        return self.getLatestVaultQ(req, res)
      }      
    } else if (req.method === 'POST'){
      return self.putVaultQ(req, res)
    }
  }
  
  var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/, function(match, hex){
    return String.fromCharCode(parseInt(hex, 16));
  });   
  var parts = path.split('/');
  if (parts[parts.length-1].charAt(0) === '.')
    return self.sendForbidden_(req, res, path);
  fs.stat(path, function(err, stat) {
    if (req.method === 'GET'){
      if (err)
        return self.sendMissing_(req, res, path);
      if (stat.isDirectory())
        return self.sendDirectory_(req, res, path);     
      return self.sendFile_(req, res, path);
    } else {
      return self.writeFile_(req, res, path);
    }    
  });
}

StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(sys.inspect(error)) + '</pre>');
  sys.puts('500 Internal Server Error');
  sys.puts(sys.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  sys.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  sys.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  sys.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  res.writeHead(200, {
    'Content-Type': StaticServlet.
      MimeMap[path.split('.').pop()] || 'text/plain'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
  var self = this;
  if (path.match(/[^\/]$/)) {
    req.url.pathname += '/';
    var redirectUrl = url.format(url.parse(url.format(req.url)));
    return self.sendRedirect_(req, res, redirectUrl);
  }
  fs.readdir(path, function(err, files) {
    if (err)
      return self.sendError_(req, res, error);

    if (!files.length)
      return self.writeDirectoryIndex_(req, res, path, []);

    var remaining = files.length;
    files.forEach(function(fileName, index) {
      fs.stat(path + '/' + fileName, function(err, stat) {
        if (err)
          return self.sendError_(req, res, err);
        if (stat.isDirectory()) {
          files[index] = fileName + '/';
        }
        if (!(--remaining))
          return self.writeDirectoryIndex_(req, res, path, files);
      });
    });
  });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};

StaticServlet.prototype.writeFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createWriteStream(path);
  req.on('data', function (data) {
    file.write(data);
  });
  req.on('end', function () {
    file.end();
  });
  res.writeHead(200);
  res.end();
};

StaticServlet.prototype.getUpdatesVaultQ = function(req, res) {
  var self = this;
  var dataPath = req.url.pathname.replace("/data_vaultq", "");
  var dataCnt = parseInt(req.url.query.cnt);
  
  var dataFsPath = './data_vaultq' + dataPath;
  var lastSlashPos = dataFsPath.lastIndexOf('/');
  var dataFsFolder =  dataFsPath.substring(0, lastSlashPos);
  var dataFsFileName = dataFsPath.substring(lastSlashPos+1);
  
  fs.readdir(dataFsFolder, function(err, files){
    var result = {
        'path':dataPath, 
        'updates':[]
    };
 
    if (!err){ 
      var fileNameRegexp = new RegExp(dataFsFileName+"\.([0-9]+)");
      for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        var fileNameMatch = fileName.match(fileNameRegexp);
        if (fileNameMatch){
          var content = fs.readFileSync(dataFsFolder + "/" + fileName, {encoding:"utf8"});
          var cnt = parseInt(fileNameMatch[1]);
          if (cnt > dataCnt){
            var update = {
                'obj': content, 
                'cnt': cnt
            };
            result.updates.push(update);
          }
        }
      }      
      result.updates.sort(function(update1, update2){
        return update1.cnt - update2.cnt;
      });
    }
    res.writeHead(200);
    res.write(JSON.stringify(result));
    res.end();
  });
};

StaticServlet.prototype.getLatestVaultQ = function(req, res) {
  var self = this;
  var dataPath = req.url.pathname.replace("/data_vaultq", "");
  
  var dataFsPath = './data_vaultq' + dataPath;
  var lastSlashPos = dataFsPath.lastIndexOf('/');
  var dataFsFolder =  dataFsPath.substring(0, lastSlashPos);
  var dataFsFileName = dataFsPath.substring(lastSlashPos+1);
  
  var result = {
      'obj': undefined,
      'cnt': 0
  };
  
  fs.readdir(dataFsFolder, function(err, files){ 
    if (!err){ 
      var maxCnt = -1;
      
      var fileNameRegexp = new RegExp(dataFsFileName+"\.([0-9]+)");
      for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        var fileNameMatch = fileName.match(fileNameRegexp);
        if (fileNameMatch){
          var cnt = parseInt(fileNameMatch[1]);
          if (cnt > maxCnt){
            maxCnt = cnt;
          }
        }
      }    
      var content;
      if (maxCnt > -1){
        content = fs.readFileSync(dataFsFolder + "/" + dataFsFileName + "." + maxCnt, {encoding:"utf8"});
      } else {
        if (fs.existsSync(dataFsFolder + "/" + dataFsFileName)){
          content = fs.readFileSync(dataFsFolder + "/" + dataFsFileName, {encoding:"utf8"});
          maxCnt = 0;
        }        
      }
      result.obj = content;
      result.cnt = maxCnt;
    }
    res.writeHead(200);
    res.write(JSON.stringify(result));
    res.end();
  });
};

StaticServlet.prototype.putVaultQ = function(req, res) {
  var self = this;
  var dataPath = req.url.pathname.replace("/data_vaultq", "");
  var dataCnt = (new Date()).getTime();
  
  var dataFsPath = './data_vaultq' + dataPath + "." + dataCnt;
  var lastSlashPos = dataFsPath.lastIndexOf('/');
  var dataFsFolder =  dataFsPath.substring(0, lastSlashPos);
  
  var folderExists = fs.existsSync(dataFsFolder);
  if (!folderExists){
    fs.mkdirSync(dataFsFolder);
  }
  
  var file = fs.createWriteStream(dataFsPath);
  req.on('data', function (data) {
    file.write(data);
  });
  req.on('end', function () {
    file.end();
  });
  res.writeHead(200);
  res.write(JSON.stringify(dataCnt));
  res.end();
};

// Must be last,
main(process.argv);