var mongoose = require('mongoose');

var wishlistSchema = new mongoose.Schema({
	userid: String,
	username: String,
   	
	car:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
	   		ref:"Car"
		},
	   	make: String,
	   	model: String,
	   	image: String,
	   	// type: String,
	   	price: Number,
	   	passenger: String	
	},

	carmodel: String
   	
});

// Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Wishlist', wishlistSchema);