var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
	price: Number,
	startdate: String,
	enddate: String,
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
	}
   	
});

// Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Order', orderSchema);