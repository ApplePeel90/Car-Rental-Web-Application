var mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
	make: String,
	model: String,
   image: String,
   image_l: String,
   price: String,
   type: String,
   passenger: String,
   count: Number,
   location: String,
   description: String,
   

});

// Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Car', carSchema);