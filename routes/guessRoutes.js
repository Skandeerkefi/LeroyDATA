const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
	createGame,
	submitGuess,
	resetGame,
	getGuesses,
} = require("../controllers/guessController");

// Admin routes
router.post("/create", verifyToken, createGame);
router.post("/reset", verifyToken, resetGame);
router.get("/guesses", verifyToken, getGuesses);

// User route
router.post("/submit", verifyToken, submitGuess);
// In guessRoutes.js
router.get("/balance/status", verifyToken, async (req, res) => {
	try {
		const guesses = await Guess.find({ user: req.user.id }); // adjust model
		const status = guesses.length ? "submitted" : null;
		res.json({ status });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/balance/guess", verifyToken, async (req, res) => {
	const { guessedBalance } = req.body;
	try {
		// Save guess to DB
		const newGuess = new Guess({
			user: req.user.id,
			guessedNumber: guessedBalance,
		});
		await newGuess.save();
		res.json({ message: "Guess submitted!" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
router.get("/status", verifyToken, async (req, res) => {
	const guesses = await Guess.find({ user: req.user.id });
	const status = guesses.length ? "submitted" : null;
	res.json({ status });
});
module.exports = router;
router.post("/balance/set-correct", verifyToken, async (req, res) => {
	const { correctBalance } = req.body;
	try {
		const game = await GuessGame.findOne({ active: true });
		if (!game) return res.status(404).json({ message: "No active game" });

		game.correctBalance = correctBalance;
		await game.save();

		res.json({ message: "Correct balance updated", game });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
