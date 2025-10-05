const mongoose = require("mongoose");

const guessGameSchema = new mongoose.Schema({
	correctBalance: { type: Number, required: true }, // balance to guess (hidden from users)
	isActive: { type: Boolean, default: true },
	guesses: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			username: { type: String, required: true },
			guessedNumber: { type: Number, required: true },
			createdAt: { type: Date, default: Date.now },
		},
	],
	winner: {
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		username: String,
		guessedNumber: Number,
	},
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GuessGame", guessGameSchema);
