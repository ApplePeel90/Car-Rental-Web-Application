/* Executed on the server side. */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
var Order = require('../models/order');
var Car = require('../models/car');
var Wishlist = require('../models/wishlist');

var monk = require('monk');
var db = monk('localhost:27017/rental');




function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


// Homepage route
router.get("/", function(req, res){
  // res.redirect("/cars");
  res.render('landing');
});



//Register
router.get('/register', function(req, res) {
  if(req.query.username && req.xhr) {
    console.log(req.query.username);
    Account.findOne({username: req.query.username}, function(err, user){
        if(err) {
          console.log(err);
        }
        var message;
        if(user) {
            message = "user exists";
        } else {
            message= "user doesn't exist";
        }
        res.json({message: message});
    });
  }
  else {
    res.render('register', {user : req.user});
  }
});

router.post('/register', function(req, res) {
  var newAccount = new Account({username: req.body.username});
  if(req.body.username === "admin") {
    newAccount.isAdmin = true;
  }
  // eval(require('locus'))
  Account.register(newAccount, req.body.password, function(err, account) {
      if (err) {
        console.log(err.message);
        return res.redirect('/register');
          // return res.render('register', { account : account });
      }

      passport.authenticate('local')(req, res, function () {
        res.redirect('/cars/1');
      });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post("/login", passport.authenticate("local",
 {

  successRedirect: "/cars/1",
  failureRedirect: "/login",
  // failureFlash : true  
 }), function(req, res){
 
});



function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  // req.session.redirectUrl = req.url;
  // req.flash("warn", "You must be logged in to do that")
  res.redirect("/login");
  
}



router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/cars/1');
});

router.get('/ping', function(req, res){
  res.send("pong!", 200);
});




router.get('/cars/:page', async(req, res, next)=> {
  const page = req.params.page || 1;
  const resPerPage = 6; // results per page
  const foundCars =await Car.find({}).skip((resPerPage *page) -resPerPage).limit(resPerPage);
  const numOfCars = await Car.count({});
  const numOfPages = Math.ceil(numOfCars / resPerPage)
   var collection = db.get('cars');


  if(req.query.search && req.xhr) {
      
      if(req.query.type != "all"){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        var type = new RegExp(escapeRegex(req.query.type), 'gi');
        collection.find({model: regex, type : type}, function(err, cars){
           if(err){
              console.log(err);
           } else {
              res.status(200).json(cars);
           }
        });
      }
      else if(req.query.type == "all"){
        // Get all campgrounds from DB
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        var type = new RegExp(escapeRegex(req.query.type), 'gi');
        collection.find({model: regex}, function(err, cars){
           if(err){
              console.log(err);
           } else {
              res.status(200).json(cars);
           }
        });
      }
  } 


  else if(req.query.search =="" && req.query.type != "all"){
      var type = new RegExp(escapeRegex(req.query.type), 'gi');
      collection.find({type: type}, function(err, cars){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(cars);
         }
      });
  }
  else{
            if(req.xhr) {
              res.json(foundCars);
            } else {
              res.render('index', {
                cars: foundCars,
                currentPage: page,
                numOfPages: numOfPages,
                numOfResults: numOfCars,
                user: req.user
              });
            }
          }
              
  
});



// direct to the 'new' page
router.get('/cars/cars/new', function(req, res) {
    res.render('new', {user : req.user});
});

router.get('/cars/cars/:id', function(req, res) {
    var collection = db.get('cars');
    collection.findOne({ _id: req.params.id}, function(err, car){
        if (err) throw err;
       //res.json(cars);
       res.render('show', { car: car, user: req.user });
    });
});

// create new car
router.post('/cars/1', function(req, res) {
 //res.send('update route');
    var collection = db.get('cars');
    collection.insert({
     make: req.body.make,
     model: req.body.model,
     image: req.body.image,
      image_l: req.body.image_l,
      type: req.body.type,
      passenger: req.body.passenger,
      price: req.body.price, 
      location: req.body.location,
      count: parseInt(req.body.count)
    }, function(err, car){
        if (err) throw err;
       //res.json(cars);
       res.redirect('/cars/1');
    });
});

// edit car page
router.get('/cars/:id/edit', function(req, res) {
    var collection = db.get('cars');
    collection.findOne({ _id: req.params.id}, function(err, car){
        if (err) throw err;
       //res.json(cars);
       res.render('edit', { car: car, user: req.user });
    });
});

router.put('/cars/:id', function(req, res) {
    var collection = db.get('cars');
    collection.findOneAndUpdate({_id: req.params.id}, 
            { $set: {make: req.body.make,
                          model: req.body.model,
                          image: req.body.image,
                          image_l: req.body.image_l,
                          type: req.body.type,
                          passenger: req.body.passenger,
                          location: req.body.location,
                          count: parseInt(req.body.count),
                          price: req.body.price} }).then((updatedDoc) => {});
    res.redirect('/cars/1');
});


// delete
router.delete('/cars/:id', function(req, res) {
    var collection = db.get('cars');
    collection.remove({ _id: req.params.id }, function(err, car){
     if (err) throw err;
     res.redirect('/cars/1');
    });
    
});






router.get('/cars/:id/rent', isLoggedIn, function(req, res){
  var collection = db.get('cars');
  collection.findOne({ _id: req.params.id}, function(err, car){
      if (err) throw err;
      //res.json(cars);
      // res.send("111");
       res.render('rent', { car: car, user: req.user });
  });
 
});



// current order detail
router.post('/cars/:id/order_detail', function(req, res) {
  
    var car_collection = db.get('cars');
    var order_collection = db.get('orders');
    var user_collection = db.get('account');

    const from = req.body.from;
    const to = req.body.to;
    const price = req.body.price;



    car_collection.update(
       {  _id: req.params.id },
       { $inc:
          {
            count: -1,
          }
       }
    )

    // first fetch car object,
    car_collection.findOne({ _id: req.params.id}, function(err, car){
      if (err) throw err;



      //then insert car object, account object to order db table
      order_collection.insert({
          car: car, 
          userid: req.user._id,
          username: req.user.username,
          // account: req.user, 
          startdate: from, 
          enddate: to, 
          price: price
      }, function(err, order) {
        if (err) throw err;
        // res.send("hh");
        res.render('order_detail', { car: car, order: order, user: req.user, from, to, price});
      });
    });



});





// });



// user profile
router.get('/:id/profile', function(req, res) {
  Account.findById(req.params.id, function(err, foundUser) {
    if (err) {
      res.redirect("/login"); // not logged in yet
    }
    // res.render("profile", {user: foundUser});
    Order.find().where('username').equals(foundUser.username).exec(function(err, foundOrder){
      // res.send(foundOrder);
      if (err) {
        res.redirect("/cars/1"); // no order history yet
      }
      res.render('profile', { user : foundUser, orders: foundOrder });
    })

  });

});


// showing wish list
router.get('/:id/wishlist', function(req, res) {
  // res.render('wishlist', {user: req.user});
  // Wishlist.find().where('userid').equals(req.params.id).exec(function(err, foundWishlist){
  //   if (err) {
  //     res.redirect("/login"); // not logged in yet
  //   }
  //   res.send(foundWishlist);
  // }); 

  var wl_collection = db.get('wishlist');
  Account.findById(req.params.id, function(err, foundUser) {
    if (err) {
      res.redirect("/login"); // not logged in yet
    }
  // res.render("profile", {user: foundUser});     

  // Wishlist.find().where('username').equals(foundUser.username).exec(function(err, foundWishlist){
  // if (err) {
  //   res.redirect("/cars/1"); // not logged in yet
  // }
  // res.json(foundWishlist);

  // })

    wl_collection.find({username : foundUser.username}, function(err, wls) {
      if (err) {
        res.redirect("/cars/1");
      }
      res.render("wishlist", { user : foundUser, wishlists: wls });
    });
  });


});  



// Delete wishlist
// delete
router.delete('/:id/wishlist', function(req, res) {
    var collection = db.get('wishlist');
    var wlcarid = req.body.wlcarid;
    var url = '/' + req.params.id + '/wishlist';
    // res.send(wlcarid);
    Car.findById(wlcarid, function(err, foundCar) {
      // res.send(foundCar);
      if (err) throw err;
      collection.remove({ carmodel: foundCar.model }, function(err, wl){
        // res.send("111");
         if (err) throw err;
         res.redirect(url);
        });
    });
  
});
    
    


router.post('/:id/wishlist', function(req, res) {
  var car_collection = db.get('cars');
  var wl_collection = db.get('wishlist');

  car_collection.findOne({ _id: req.body.like}, function(err, car){
    if (err) throw err;
    //acc_collection.update({ _id: req.params.id}, { $push: { likedCars: car} });  
    var url = '/cars/cars/' + req.body.like;

    wl_collection.insert({
        car : car,
        carmodel : car.model,
        userid : req.user._id,
        username : req.user.username
    }, function(err, wishlist) {
        if (err) throw err;
        res.redirect(url);
    });
    
  });

  
});







module.exports = router;