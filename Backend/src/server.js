
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const POINTS_PER_CORRECT_ANSWER = 10;

// 1. Available mini-games
const games = [
    {
        id: "explore",
        name: "Explore & Discover",
        subject: "Biology"
    },
    {
        id: "match",
        name: "Match the Concepts",
        subject: "Computer Science"
    },
    {
        id: "quest",
        name: "Challenge Quest",
        subject: "Environmental Science"
    }
];

// 2. Sample questions
// Correct answers stay on the backend.
const questions = [
    {
        id: "Q1",
        gameId: "explore",
        question: "Which process allows plants to make food using sunlight?",
        options: ["Respiration", "Photosynthesis", "Digestion"],
        correctAnswer: "Photosynthesis",
        explanation: "Plants use light energy to make food through photosynthesis."
    },
    {
        id: "Q2",
        gameId: "explore",
        question: "Which part of a plant absorbs water from soil?",
        options: ["Roots", "Flowers", "Fruits"],
        correctAnswer: "Roots",
        explanation: "Roots absorb water and minerals from the soil."
    },
    {
        id: "Q3",
        gameId: "match",
        question: "Which computer component processes instructions?",
        options: ["CPU", "Monitor", "Keyboard"],
        correctAnswer: "CPU",
        explanation: "The CPU executes instructions and processes data."
    },
    {
        id: "Q4",
        gameId: "match",
        question: "Which component stores data temporarily while programs run?",
        options: ["RAM", "Printer", "Mouse"],
        correctAnswer: "RAM",
        explanation: "RAM stores data and instructions currently in use."
    },
    {
        id: "Q5",
        gameId: "quest",
        question: "Which action helps reduce plastic pollution?",
        options: [
            "Use reusable bags",
            "Throw plastic into rivers",
            "Burn plastic outdoors"
        ],
        correctAnswer: "Use reusable bags",
        explanation: "Reusable bags can reduce single-use plastic waste."
    },
    {
        id: "Q6",
        gameId: "quest",
        question: "What should you do with recyclable waste?",
        options: [
            "Separate it for recycling",
            "Throw it into a river",
            "Leave it in a forest"
        ],
        correctAnswer: "Separate it for recycling",
        explanation: "Separating recyclable materials helps them be processed and reused."
    }
];

// 3. Temporary player progress.
// This data resets whenever the server restarts.
const playerProgress = new Map();

// Create progress for a player when needed.
function getOrCreateProgress(userId) {
    if (!playerProgress.has(userId)) {
        playerProgress.set(userId, {
            userId,
            totalScore: 0,
            totalAnswered: 0,
            totalCorrect: 0,
            answers: {},
            games: {}
        });
    }

    return playerProgress.get(userId);
}

// Calculate progress for a single game.
function getGameProgress(progress, gameId) {
    const gameQuestions = questions.filter(
        question => question.gameId === gameId
    );

    const gameAnswers = Object.values(progress.answers).filter(
        answer => answer.gameId === gameId
    );

    const correctCount = gameAnswers.filter(
        answer => answer.isCorrect
    ).length;

    return {
        gameId,
        totalQuestions: gameQuestions.length,
        answered: gameAnswers.length,
        correctAnswers: correctCount,
        score: gameAnswers.reduce(
            (total, answer) => total + answer.pointsEarned,
            0
        ),
        completed:
            gameQuestions.length > 0 &&
            gameAnswers.length === gameQuestions.length
    };
}

// 4. Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Educational Game Backend is running"
    });
});

// 5. Get all games
app.get("/api/games", (req, res) => {
    res.json({
        status: "success",
        data: games
    });
});

// 6. Get questions for one game
app.get("/api/questions", (req, res) => {
    const { gameId } = req.query;

    if (!gameId) {
        return res.status(400).json({
            status: "error",
            message: "Please provide a gameId."
        });
    }

    const gameExists = games.some(game => game.id === gameId);

    if (!gameExists) {
        return res.status(404).json({
            status: "error",
            message: "Game not found."
        });
    }

    const gameQuestions = questions
        .filter(question => question.gameId === gameId)
        .map(({ correctAnswer, ...question }) => question);

    res.json({
        status: "success",
        data: gameQuestions
    });
});

// 7. Submit an answer and award points
app.post("/api/answers", (req, res) => {
    const { userId, questionId, answer } = req.body;

    if (
        typeof userId !== "string" ||
        !userId.trim() ||
        typeof questionId !== "string" ||
        !questionId.trim() ||
        typeof answer !== "string" ||
        !answer.trim()
    ) {
        return res.status(400).json({
            status: "error",
            message: "userId, questionId, and answer are required."
        });
    }

    const question = questions.find(
        item => item.id === questionId
    );

    if (!question) {
        return res.status(404).json({
            status: "error",
            message: "Question not found."
        });
    }

    const progress = getOrCreateProgress(userId.trim());

    // Prevent the same player earning points repeatedly
    // by submitting the same question more than once.
    if (progress.answers[questionId]) {
        return res.status(409).json({
            status: "error",
            message: "You have already answered this question.",
            data: {
                previousResult: progress.answers[questionId],
                totalScore: progress.totalScore
            }
        });
    }

    const isCorrect =
        answer.trim().toLowerCase() ===
        question.correctAnswer.toLowerCase();

    const pointsEarned = isCorrect
        ? POINTS_PER_CORRECT_ANSWER
        : 0;

    const result = {
        questionId: question.id,
        gameId: question.gameId,
        isCorrect,
        pointsEarned,
        explanation: question.explanation
    };

    progress.answers[questionId] = result;
    progress.totalAnswered += 1;

    if (isCorrect) {
        progress.totalCorrect += 1;
        progress.totalScore += pointsEarned;
    }

    progress.games[question.gameId] =
        getGameProgress(progress, question.gameId);

    res.json({
        status: "success",
        message: isCorrect ? "Correct answer!" : "Incorrect answer.",
        data: {
            ...result,
            correctAnswer: question.correctAnswer,
            totalScore: progress.totalScore,
            gameProgress: progress.games[question.gameId]
        }
    });
});

// 8. Get a player's overall progress
app.get("/api/progress/:userId", (req, res) => {
    const userId = req.params.userId;

    if (!userId.trim()) {
        return res.status(400).json({
            status: "error",
            message: "A userId is required."
        });
    }

    const progress = getOrCreateProgress(userId);

    const gameProgress = games.map(game => ({
        ...game,
        ...getGameProgress(progress, game.id)
    }));

    const totalQuestions = questions.length;

    res.json({
        status: "success",
        data: {
            userId: progress.userId,
            totalScore: progress.totalScore,
            totalAnswered: progress.totalAnswered,
            totalCorrect: progress.totalCorrect,
            totalQuestions,
            completionPercentage: Math.round(
                (progress.totalAnswered / totalQuestions) * 100
            ),
            games: gameProgress
        }
    });
});

// 9. Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Endpoint not found."
    });
});

// 10. Handle unexpected server errors
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);

    res.status(500).json({
        status: "error",
        message: "An unexpected server error occurred."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
