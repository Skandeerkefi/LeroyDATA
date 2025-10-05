const GuessGame = require("../models/GuessGame");
const { User } = require("../models/User");

// Admin creates a new guess game
exports.createGame = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Only admin can start a game" });
		}

		// deactivate old games
		await GuessGame.updateMany({}, { isActive: false });

		const game = new GuessGame({ correctBalance: req.body.correctBalance });
		await game.save();

		res.status(201).json({ message: "New Guess Game started", game });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// User submits guess
exports.submitGuess = async (req, res) => {
  try {
    const { guessedNumber } = req.body;

    const game = await GuessGame.findOne({ isActive: true });
    if (!game) return res.status(404).json({ message: "No active game found" });

    // check if user already guessed
    if (game.guesses.some((g) => g.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "You already made your guess!" });
    }

    // push guess
    const guess = {
      user: req.user.id,
      username: req.user.kickUsername,
      guessedNumber,
    };
    game.guesses.push(guess);

    // check winner
    if (parseInt(guessedNumber) === game.correctBalance && !game.winner?.user) {
      game.winner = guess; // save first winner
    }

    await game.save();

    res.json({
      message:
        parseInt(guessedNumber) === game.correctBalance
          ? "🎉 You guessed correctly!"
          : "Guess submitted!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin resets the game
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

// Get guesses (admin only)
exports.getGuesses = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Only admin can see guesses" });
		}

		const game = await GuessGame.findOne({ isActive: true }).populate(
			"guesses.user"
		);
		if (!game) return res.status(404).json({ message: "No active game" });

		res.json(game.guesses);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
