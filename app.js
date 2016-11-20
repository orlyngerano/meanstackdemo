var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var User = require('./models/user');
var jwt = require('jsonwebtoken');
var apiRoutes = express.Router();
var bcrypt = require('bcrypt-nodejs')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.set('views', './views');
app.set('view engine', 'pug');
app.set('secretToken', 'sdf897!7$');

apiRoutes.post('/auth', function (req, res) {
    User.findOne({ username: req.body.username }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.sendStatus(401);  
        } else {

            bcrypt.compare(req.body.password, user.password, function(err, cmpRslt) {
              
                if(err || !cmpRslt){
                    res.sendStatus(401);  
                }else{
                    // create a token
                    var token = jwt.sign(user, app.get('secretToken'), {
                        expiresIn: 1440 // expires in 24 hours
                    });

                    res.json({token: token});                    
                }
            });
        }

    })
})

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
  var authorization = req.headers['authorization'];
  if(authorization){
      var authorizationTokens = authorization.split(" ");
      if(authorizationTokens.length==2){
        var token = authorizationTokens[1];
        jwt.verify(token, app.get('secretToken'), function(err, decoded) {      
            if (err) {
                res.sendStatus(403);  
            } else {
                req.decoded = decoded;    
                next();
            }
        });          
      }
  }else{
      res.sendStatus(403);
  }

});


apiRoutes.get('/user', function (req, res) {

    User.find(function (err, users) {
        if (err) throw err;
        
        res.send(users)
    })
})

apiRoutes.get('/user/:id', function (req, res) {
    var id = req.params.id
    User.findById(id, function (err, user) {
        if (err) throw err;

        res.send(user)
    })

})

apiRoutes.post('/user', function (req, res) {
    var user = req.body;
    user.password = bcrypt.hashSync(user.password);

    User.create(req.body, function (err, user) {
        if (err) throw err;
        
        res.send(user)
    })
})

apiRoutes.put('/user/:id', function (req, res) {
    var id = req.params.id
    var user = req.body;
    user.password = bcrypt.hashSync(user.password);

    User.findOneAndUpdate({ _id: id }, user, { new: true }, function (err, user) {
        if (err) throw err;
        
        res.send(user)
    });
})

apiRoutes.delete('/user/:id', function (req, res) {
    var id = req.params.id
    User.findOneAndRemove({ _id: id }, function (err, user) {
        if (err) throw err;
        
        res.sendStatus(204);  
    });
})



app.use('/api', apiRoutes);

app.listen(3000, function () {
    console.log('user crud app listeneing on port 3000!')
})

