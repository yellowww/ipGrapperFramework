const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var con = mysql.createConnection({
	/*
		your database information
	*/
});
con.connect(function(err) {
  if(err) throw err;
})
function configureTables() {
  var sql = "CREATE TABLE pathNames (id INT AUTO_INCREMENT PRIMARY KEY, path VARCHAR(255), name VARCHAR(255), ip VARCHAR(255), x VARCHAR(255), y VARCHAR(255), isp VARCHAR(255), hostname VARCHAR(255))";
  con.query(sql, function(err, res) {
    if(err) throw err;
    console.log("pathNames table created");
  })

  var sql = "CREATE TABLE adminperms (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), keyVal VARCHAR(255), plevel VARCHAR(255))";
  con.query(sql, function(err, res) {
    if(err) throw err;
    console.log("adminperms table created");
  })
}

app.get('/admin', (request, response) => {
  fs.readFile(__dirname+"/public/admin/admin.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    } else {
        response.send(html);
    }
  })
})

app.get('/admin/addPath', (request, response) => {
  fs.readFile(__dirname+"/public/admin/html/addPath.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    } else {
      response.send(html);
    }
  })
})

app.get('/admin/getData', (request, response) => {
  fs.readFile(__dirname+"/public/admin/html/viewData.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    } else {
      response.send(html);
    }
  })
})

app.get('/admin/moreData', (request, response) => {
  fs.readFile(__dirname+"/public/admin/html/moreData.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    } else {
      response.send(html);
    }
  })
})

app.get('/admin/viewAdmin', (request, response) => {
  fs.readFile(__dirname+"/public/admin/html/changePerms.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    } else {
      response.send(html);
    }
  })
})

app.get('/req/ajax/getData', function(req,res) {
   getAllData(function(data) {
    var stringData = JSON.stringify(data);
    res.send(stringData);
  });
});

app.get('/req/ajax/getAdminData', function(req,res) {
   getAdminData(function(data) {
    var stringData = JSON.stringify(data);
    res.send(stringData);
  });
});

app.get('/req/ajax/getMoreData', function(req,res) {
  var query = req.query.query;
  checkIfPathExists(query, function(exists) {
    if(exists) {
      getPathData(query, function(data) {
        var stringData = JSON.stringify(data);
        res.send(stringData);
      })
    }
  })
});

app.get('/req/ajax/auth', function(req,res) {
  var key = req.query.key;
  checkIfPermExists(key, function (exists) {
    if(exists) {
      checkKey(key, function(adminData) {
        res.send(JSON.stringify(adminData));
      })
    } else {
      res.send(JSON.stringify({noData:true}));
    }
  })
});

app.post('/admin/submitData', function(req, res) {

  checkIfPathExists(req.body.path, function(pathExists) {
    if(pathExists) {
      res.send("That path already exists!");
    } else {
      writePathNameToDB(req.body, function() {
        fs.readFile(__dirname+"/public/admin/admin.html", 'utf8', (err, html) => {
          if(err) {
            res.status(500).send('sorry, out of order');
          } else {
            res.send(html);
          }
        })
      })
    }
  });
})

app.post('/admin/deleteEntry', function(req, res) {
  checkIfPathExists(req.body.path, function(exists) {
    if(exists) {
      deleteEntry(req.body.path, function() {
        fs.readFile(__dirname+"/public/admin/html/viewData.html", 'utf8', (err, html) => {
          if(err) {
            res.status(500).send('sorry, out of order');
          } else {
            res.send(html);
          }
        })
      })
    } else {
      res.send("that URL path does not exist");
    }
  })
})

app.post('/admin/deletePerms', function(req, res) {
  checkIfPermExists(req.body.dKey, function(exists) {
    if(exists) {
      deletePerm(req.body.dKey, function() {
        fs.readFile(__dirname+"/public/admin/html/changePerms.html", 'utf8', (err, html) => {
          if(err) {
            res.status(500).send('sorry, out of order');
          } else {
            res.send(html);
          }
        })
      })
    } else {
      res.send("that admin key does not exist ("+req.body.dKey+")");
    }
  })
})

app.post('/admin/addPerms', function(req, res) {
  checkIfPermExists(req.body.aKey, function(exists) {
    if(!exists) {
      addPerm(req.body, function() {
        fs.readFile(__dirname+"/public/admin/html/changePerms.html", 'utf8', (err, html) => {
          if(err) {
            res.status(500).send('sorry, out of order');
          } else {
            res.send(html);
          }
        })
      })
    } else {
      res.send("that admin key already exists");
    }
  })
})

app.post('/submitIpData', (request, response) => {
  checkIfPathExists(request.body.path, function(exists) {
    if(exists) {
      updatePath(request.body, function () {
        fs.readFile(__dirname+"/public/redirect.html", 'utf8', (err, html) => {
          if(err) {
            response.status(500).send('sorry, out of order');
          } else {
            response.send(html);
          }
        })
      });
    } else {
      fs.readFile(__dirname+"/public/redirect.html", 'utf8', (err, html) => {
        if(err) {
          response.status(500).send('sorry, out of order');
        } else {
          response.send(html);
        }
      })
    }
  })
})

app.get('*', (request, response) => {
  fs.readFile(__dirname+"/public/home.html", 'utf8', (err, html) => {
    if(err) {
      response.status(500).send('sorry, out of order');
    }
    response.send(html);
  })
})






function checkIfPathExists(path, cb) {
  var sql = "SELECT * from pathnames WHERE path='"+path+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    var exists = res[0] != undefined;
    cb(exists);
  })
}

function checkIfPermExists(key, cb) {
  var sql = "SELECT * from adminperms WHERE keyVal='"+key+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    var exists = res[0] != undefined;
    cb(exists)
  })
}

function getPathData(path, cb) {
  var sql = "SELECT * from pathnames WHERE path='"+path+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb(res);
  })
}

function writePathNameToDB(body, cb) {
  var sql = "INSERT INTO pathnames (path, name, ip, x, y, isp, hostname) VALUES ('"+body.path+"','"+body.name+"', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined')";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb()
  })
}

function updatePath(body, cb) {
  var sql = "UPDATE pathnames SET ip = '"+body.ip+"', x = '"+body.x+"', y = '"+body.y+"', isp = '"+body.isp+"', hostname = '"+body.hostname+"' WHERE path = '"+body.path+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb()
  })
}


function getAllData(cb) {
  var sql = "SELECT * FROM pathnames";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb(res)
  })
}

function deleteEntry(entryPath, cb) {
  var sql = "DELETE FROM pathnames WHERE path = '"+entryPath+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb()
  })
}

function getAdminData(cb) {
  var sql = "SELECT * FROM adminperms";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb(res)
  })
}


function deletePerm(key, cb) {
  var sql = "DELETE FROM adminperms WHERE keyVal = '"+key+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb()
  })
}

function addPerm(body, cb) {
  var sql = "INSERT INTO adminperms (name, keyVal, plevel) VALUES ('"+body.name+"','"+body.aKey+"', '"+body.pLevel+"')";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb()
  })
}

function checkKey(key, cb) {
  var sql = "SELECT  * FROM adminperms WHERE keyVal = '"+key+"'";
  con.query(sql, function(err, res) {
    if(err) throw err;
    cb(res[0]);
  })
}


app.listen(process.env.PORT || 3002, () => console.log('server started 3002'))
