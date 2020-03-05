/* Executed on the server side. */
var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/rental');

router.get('/', function(req, res) {
    var collection = db.get('rental');
    collection.find({}, function(err, cars){
        if (err) throw err;
      	res.json(cars);
    });
});


router.get('/:id', function(req, res) {
    var collection = db.get('rental');
    collection.findOne({ _id: req.params.id}, function(err, cars){
        if (err) throw err;
      	res.json(cars);
    });
});

module.exports = router; 