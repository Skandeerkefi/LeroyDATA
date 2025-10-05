const GuessGame = require("../models/GuessGame");
const { User } = require("../models/User");

// ✅ Admin creates a new guess game
exports.createGame = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Only admin can start a game" });
		}

		// Deactivate all previous games
		await GuessGame.updateMany({}, { isActive: false });

		const game = new GuessGame({ correctBalance: req.body.correctBalance });
		await game.save();

		res.status(201).json({ message: "New Guess Game started", game });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// ✅ User submits a guess
exports.submitGuess = async (req, res) => {
	try {
		const { guessedNumber } = req.body;
		if (!guessedNumber)
			return res.status(400).json({ message: "Please provide a guess" });

		const game = await GuessGame.findOne({ isActive: true });
		if (!game) return res.status(404).json({ message: "No active game found" });

		// Prevent duplicate guesses
		if (game.guesses.some((g) => g.user.toString() === req.user.id)) {
			return res.status(400).json({ message: "You already made your guess!" });
		}

		const guess = {
			user: req.user.id,
			username: req.user.kickUsername || req.user.username,
			guessedNumber,
		};

		game.guesses.push(guess);

		// Check if guess is correct
		if (parseInt(guessedNumber) === game.correctBalance && !game.winner?.user) {
			game.winner = guess; // first winner only
		}

		await game.save();

		res.json({
			message:
				parseInt(guessedNumber) === game.correctBalance
					? "🎉 You guessed correctly!"
					: "✅ Guess submitted successfully!",
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// ✅ Admin resets the game
exports.resetGame = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Only admin can reset the game" });
		}

		await GuessGame.deleteMany({});
		res.json({ message: "Guess Game reset successfully." });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// ✅ Everyone can now view guesses (not just admin)
exports.getGuesses = async (req, res) => {
	try {
		const game = await GuessGame.findOne({ isActive: true }).populate(
			"guesses.user",
			"username kickUsername"
		);
		if (!game) return res.status(404).json({ message: "No active game" });

		// Return only useful data
		const publicGuesses = game.guesses.map((g) => ({
			username: g.username,
			guessedNumber: g.guessedNumber,
		}));

		res.json(publicGuesses);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
// in guessController.js

// ✅ Get the current correct balance (Admin only)
exports.getCurrentBalance = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res
				.status(403)
				.json({ message: "Only admin can view the balance" });
		}

		const game = await GuessGame.findOne({ isActive: true });
		if (!game) return res.status(404).json({ message: "No active game found" });

		res.json({ correctBalance: game.correctBalance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
