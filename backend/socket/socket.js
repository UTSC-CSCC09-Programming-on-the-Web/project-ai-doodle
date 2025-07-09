import { Server } from "socket.io";
import { getRoomUsers, setRoomUsers } from "./roomStore.js";
import { redis } from "./redisClient.js";

// Game state storage (in production, use a proper database)
const gameStates = new Map();

// Secret words pool
const SECRET_WORDS = [
  "BUTTERFLY", "MOUNTAIN", "BICYCLE", "CASTLE", "RAINBOW", 
  "ELEPHANT", "GUITAR", "LIGHTHOUSE", "SUNFLOWER", "DRAGON",
  "WATERFALL", "SPACESHIP", "TELESCOPE", "VOLCANO", "PIZZA"
];

// AI Image Generation Function
async function generateAIImage(prompt, roomId, turn) {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using fallback image");
    // Use a deterministic image based on roomId and turn to ensure consistency
    const seed = `${roomId}-${turn}`;
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    const imageUrl = `https://picsum.photos/512/512?random=${imageId}`;
    console.log(`Generated fallback image for room ${roomId}, turn ${turn}: ${imageUrl}`);
    return imageUrl;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(`API call failed: ${errorData.error?.message}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log(`Generated AI image for room ${roomId}, turn ${turn}: ${imageUrl}`);
      return imageUrl;
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Error generating image with AI:", error);
    // Fallback to deterministic placeholder if AI generation fails
    const seed = `${roomId}-${turn}`;
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    const imageUrl = `https://picsum.photos/512/512?random=${imageId}`;
    console.log(`Generated fallback image after error for room ${roomId}, turn ${turn}: ${imageUrl}`);
    return imageUrl;
  }
}

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId, username }) => {
      socket.join(roomId);

      let users = await getRoomUsers(roomId);
      let existing = users.find((u) => u.username === username);

      if (existing) {
        existing.socketId = socket.id;
      } else {
        users.push({ username, socketId: socket.id, ready: false });
      }

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);

      // Send current game state if game is in progress
      if (gameStates.has(roomId)) {
        const gameState = gameStates.get(roomId);
        sendGameStateToUser(socket, gameState, username);
      }
    });

    socket.on("setReady", async ({ roomId, username, ready }) => {
      const users = await getRoomUsers(roomId);
      const user = users.find((u) => u.username === username);
      if (user) user.ready = ready;

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
    });

    socket.on("startGame", async (roomId) => {
      const users = await getRoomUsers(roomId);
      
      if (users.length < 2) {
        io.to(roomId).emit("gameError", { message: "Need at least 2 players to start" });
        return;
      }

      // Initialize game state
      const secretWord = SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)];
      // Shuffle player order
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const playerOrder = shuffledUsers.map(u => u.username);

      // Select a spy
      const spyCandidates = shuffledUsers.slice(1, -1); // exclude first and last
      const spyIndex = Math.floor(Math.random() * spyCandidates.length);
      const spyUsername = spyCandidates[spyIndex].username;
      
      // First player is always the first in the shuffled order (index 0)
      const firstPlayerIndex = 0;

      const gameState = {
        roomId,
        secretWord,
        spyUsername,
        currentPlayer: playerOrder[firstPlayerIndex],
        turn: 1,
        totalTurns: playerOrder.length,
        playerOrder,
        images: [],
        gamePhase: "IMAGE_GENERATION",
        isActive: true
      };

      gameStates.set(roomId, gameState);

      // Notify all room members to redirect to game page
      io.to(roomId).emit("gameStarted", { roomId });
      
      // Send initial game state to all players
      setTimeout(() => {
        users.forEach(user => {
          const userSocket = io.sockets.sockets.get(user.socketId);
          if (userSocket) {
            sendGameStateToUser(userSocket, gameState, user.username);
          }
        });
      }, 1500); // Delay to ensure clients have loaded the game page

      console.log(`Game started in room ${roomId} - Secret: ${secretWord}, Spy: ${spyUsername}, First: ${gameState.currentPlayer}`);
    });

    socket.on("generateImage", async ({ roomId, username, prompt, turn }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState || gameState.currentPlayer !== username) {
        socket.emit("gameError", { message: "Not your turn or game not active" });
        return;
      }

      console.log(`${username} generating image with prompt: "${prompt}" for room ${roomId}, turn ${turn}`);

      try {
        // Show generating status to user
        socket.emit("imageGenerating", { 
          player: username, 
          message: "Generating image with AI..." 
        });

        // Use real AI image generation with consistent parameters
        const imageUrl = await generateAIImage(prompt, roomId, turn);
        
        // Store image data
        const imageData = {
          player: username,
          prompt,
          imageUrl,
          turn,
          timestamp: new Date().toISOString()
        };
        
        gameState.images.push(imageData);
        
        console.log(`Image generated and stored for ${username}: ${imageUrl}`);
        console.log(`Current gameState.images:`, gameState.images.map(img => ({
          player: img.player,
          turn: img.turn,
          url: img.imageUrl
        })));

        // Notify current player about their generated image
        socket.emit("imageGenerated", { 
          player: username, 
          imageUrl,
          success: true,
          message: "Image generated successfully!"
        });

        // Find next player
        const currentIndex = gameState.playerOrder.indexOf(username);
        const nextIndex = currentIndex + 1;

        // last player skips drawing and goes to final guess
        if (nextIndex === gameState.totalTurns - 1) {
          gameState.gamePhase = "FINAL_GUESS";
          gameState.currentPlayer = gameState.playerOrder[nextIndex];

          gameStates.set(roomId, gameState);

          const users = await getRoomUsers(roomId);
          users.forEach(user => {
            const userSocket = io.sockets.sockets.get(user.socketId);
            if (userSocket) {
              sendGameStateToUser(userSocket, gameState, user.username);
            }
          });

          io.to(roomId).emit("phaseChange", {
            phase: "FINAL_GUESS",
            message: `${gameState.currentPlayer}, you're the last player — skip drawing and guess the secret word!`
          });

        } else {
          // move to next player
          gameState.currentPlayer = gameState.playerOrder[nextIndex];
          gameState.turn++;

          gameStates.set(roomId, gameState);

          const users = await getRoomUsers(roomId);
          users.forEach(user => {
            const userSocket = io.sockets.sockets.get(user.socketId);
            if (userSocket) {
              sendGameStateToUser(userSocket, gameState, user.username);
            }
          });
        }
      } catch (error) {
        console.error(`Image generation failed for ${username}:`, error);
        socket.emit("gameError", { 
          message: "Image generation failed. Please try again.",
          error: error.message 
        });
      }
    });

    socket.on("finalGuess", async ({ roomId, username, guess }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState || gameState.gamePhase !== "FINAL_GUESS") {
        socket.emit("gameError", { message: "Not in final guess phase" });
        return;
      }

      // Simple word matching (in production, use more sophisticated matching)
      const isCorrect = guess.toLowerCase() === gameState.secretWord.toLowerCase();
      
      if (isCorrect) {
        // Non-spy players win
        io.to(roomId).emit("gameEnd", {
          result: "GUESS_CORRECT",
          winner: "NON_SPY_PLAYERS",
          secretWord: gameState.secretWord,
          spy: gameState.spyUsername,
          finalGuess: guess
        });
      } else {
        // Move to voting phase
        gameState.gamePhase = "VOTING";
        gameState.currentPlayer = null; // No current player in voting phase
        gameStates.set(roomId, gameState);
        
        // Send updated game state to all players for voting phase
        const users = await getRoomUsers(roomId);
        users.forEach(user => {
          const userSocket = io.sockets.sockets.get(user.socketId);
          if (userSocket) {
            sendGameStateToUser(userSocket, gameState, user.username);
          }
        });
        
        io.to(roomId).emit("phaseChange", { 
          phase: "VOTING", 
          message: "Guess was incorrect! Time to vote for the spy.",
          images: gameState.images,
          secretWord: gameState.secretWord,
          finalGuess: guess
        });
      }
    });

    socket.on("vote", async ({ roomId, username, votedPlayer }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState || gameState.gamePhase !== "VOTING") {
        socket.emit("gameError", { message: "Not in voting phase" });
        return;
      }

      const firstPlayer = gameState.playerOrder[0];
      if (votedPlayer === firstPlayer) {
        socket.emit("gameError", {
          message: "The first player cannot be voted — they are not the spy."
        });
        return;
      }

      // Store vote
      if (!gameState.votes) gameState.votes = {};
      gameState.votes[username] = votedPlayer;
      
      console.log(`Vote received: ${username} voted for ${votedPlayer}`);
      console.log(`Current votes:`, gameState.votes);
      
      // Check if all players voted and determine winner
      const users = await getRoomUsers(roomId);
      const totalPlayers = gameState.playerOrder.length;
      const totalVotes = Object.keys(gameState.votes).length;
      
      console.log(`Vote count: ${totalVotes}/${totalPlayers}`);
      
      if (totalVotes === totalPlayers) {
        // Count votes and determine result
        const voteCount = {};
        Object.values(gameState.votes).forEach(vote => {
          voteCount[vote] = (voteCount[vote] || 0) + 1;
        });
        
        const mostVoted = Object.keys(voteCount).reduce((a, b) => 
          voteCount[a] > voteCount[b] ? a : b
        );
        
        const spyFound = mostVoted === gameState.spyUsername;
        
        console.log(`Voting completed - Most voted: ${mostVoted}, Spy: ${gameState.spyUsername}, Spy found: ${spyFound}`);
        
        io.to(roomId).emit("gameEnd", {
          result: spyFound ? "SPY_FOUND" : "SPY_WINS",
          winner: spyFound ? "NON_SPY_PLAYERS" : "SPY",
          secretWord: gameState.secretWord,
          spy: gameState.spyUsername,
          voteResults: voteCount,
          mostVoted
        });
      } else {
        // Notify room about vote progress
        io.to(roomId).emit("voteProgress", {
          votedPlayers: Object.keys(gameState.votes),
          remainingVotes: totalPlayers - totalVotes
        });
      }
    });

    socket.on("leaveGame", async ({ roomId, username }) => {
      // Handle leave game logic
      socket.leave(roomId);
      
      let users = await getRoomUsers(roomId);
      users = users.filter((u) => u.username !== username);

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
      io.to(roomId).emit("userLeftGame", { username });
      
      // If game creator leaves, end the game
      const gameState = gameStates.get(roomId);
      if (gameState && users.length < 2) {
        gameStates.delete(roomId);
        io.to(roomId).emit("gameEnd", { 
          result: "GAME_CANCELLED", 
          message: "Game ended due to insufficient players" 
        });
      }
      
      console.log(`${username} left game in room ${roomId}`);
    });

    socket.on("leaveRoom", async ({ roomId, username }) => {
      let users = await getRoomUsers(roomId);
      users = users.filter((u) => u.username !== username);

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
    });

    socket.on("disconnect", async () => {
      const keys = await redis.keys("room:*");
      for (const key of keys) {
        const roomId = key.split(":")[1];
        const users = await getRoomUsers(roomId);
        const updatedUsers = users.map((u) => {
          if (u.socketId === socket.id) {
            return { ...u, socketId: null };
          }
          return u;
        });
        await setRoomUsers(roomId, updatedUsers);
        io.to(roomId).emit("roomUpdate", updatedUsers);
      }
    });
  });
}

// Helper function to send correct game state to each user
function sendGameStateToUser(socket, gameState, username) {
  const isCurrentPlayer = gameState.currentPlayer === username;
  const isSpy = gameState.spyUsername === username;
  const isFirstTurn = gameState.turn === 1;
  const isFirstPlayer = isFirstTurn && isCurrentPlayer;
  const isFinalGuessPhase = gameState.gamePhase === "FINAL_GUESS";
  
  // Determine what the user should see
  let secretWord = null;
  let previousImage = null;
  let previousPlayer = null;
  let currentGameImage = null;
  let currentGamePlayer = null;
  let showPreviousImage = false;
  
  // Only show secret word to the first player if they're not a spy and it's their turn
  if (isFirstPlayer && !isSpy) {
    secretWord = gameState.secretWord;
  }
  
  // Show images based on game progress - all players see the same state
  if (gameState.images.length > 0) {
    const latestImage = gameState.images[gameState.images.length - 1];
    
    if (isFinalGuessPhase) {
      // In final guess phase, show the latest image to everyone for context
      currentGameImage = latestImage.imageUrl;
      currentGamePlayer = latestImage.player;
      
      if (isCurrentPlayer) {
        // Final guesser sees the latest image as "previous" to make their guess
        previousImage = latestImage.imageUrl;
        previousPlayer = latestImage.player;
        showPreviousImage = true;
      }
      console.log(`FINAL_GUESS phase - Sending image to ${username}: currentGame=${currentGameImage ? 'YES' : 'NO'}, previous=${previousImage ? 'YES' : 'NO'}`);
      
    } else if (isCurrentPlayer && !isFirstTurn) {
      // Current player (not first) sees the previous image (to describe)
      previousImage = latestImage.imageUrl;
      previousPlayer = latestImage.player;
      showPreviousImage = true;
      console.log(`Sending previousImage to current player ${username}: ${previousImage}`);
      
    } else if (!isCurrentPlayer) {
      // Other players see the latest generated image as "current game progress"
      currentGameImage = latestImage.imageUrl;
      currentGamePlayer = latestImage.player;
      console.log(`Sending currentGameImage to waiting player ${username}: ${currentGameImage}`);
    }
  }
  
  socket.emit("gameUpdate", {
    ...gameState,
    secretWord,
    isSpy,
    isFirstPlayer,
    showPreviousImage,
    previousImage,
    previousPlayer,
    currentGameImage,
    currentGamePlayer
  });
  
  console.log(`Sent game state to ${username}: phase=${gameState.gamePhase}, turn=${gameState.turn}, currentPlayer=${gameState.currentPlayer}, isFirstPlayer=${isFirstPlayer}, showPreviousImage=${showPreviousImage}, secretWord=${secretWord ? 'YES' : 'NO'}, previousImage=${previousImage ? 'YES' : 'NO'}, currentGameImage=${currentGameImage ? 'YES' : 'NO'}`);
}
