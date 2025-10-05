const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
	createGame,
	submitGuess,
	resetGame,
	getGuesses,
} = require("../controllers/guessController");
const GuessGame = require("../models/GuessGame");

// --------------------
// 🔒 ADMIN ROUTES
// --------------------

// Create a new guess game
router.post("/create", verifyToken, createGame);

// Reset all games
router.post("/reset", verifyToken, resetGame);

// Set the correct balance for the current active game
router.post("/balance/set-correct", verifyToken, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res
				.status(403)
				.json({ message: "Only admin can set the correct balance" });
		}

		const { correctBalance } = req.body;
		const game = await GuessGame.findOne({ isActive: true });
		if (!game) return res.status(404).json({ message: "No active game found" });

		game.correctBalance = correctBalance;
		await game.save();

		res.json({ message: "✅ Correct balance updated successfully", game });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// --------------------
// 👤 USER ROUTES
// --------------------

// Submit a guess
router.post("/submit", verifyToken, submitGuess);

// Check if the current user already made a guess
router.get("/status", verifyToken, async (req, res) => {
	try {
		const activeGame = await GuessGame.findOne({ isActive: true });
		if (!activeGame) return res.status(404).json({ message: "No active game" });

		const hasGuessed = activeGame.guesses.some(
			(g) => g.user.toString() === req.user.id
		);

		res.json({ status: hasGuessed ? "submitted" : null });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// --------------------
// 🌍 PUBLIC ROUTE
// --------------------

// Everyone can see guesses
router.get("/guesses", getGuesses);
// in your router file
const { getCurrentBalance } = require("../controllers/guessController");

// Get current balance (Admin only)
router.get("/balance/current", verifyToken, getCurrentBalance);

module.exports = router;
