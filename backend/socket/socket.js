import { Server } from "socket.io";
import { getRoomUsers, setRoomUsers } from "./roomStore.js";
import { redis } from "./redisClient.js";

// Game state storage (in production, use a proper database)
const gameStates = new Map();

// Secret words pool
const SECRET_WORDS = [
  "BUTTERFLY",
  "MOUNTAIN",
  "BICYCLE",
  "CASTLE",
  "RAINBOW",
  "ELEPHANT",
  "GUITAR",
  "LIGHTHOUSE",
  "SUNFLOWER",
  "DRAGON",
  "WATERFALL",
  "SPACESHIP",
  "TELESCOPE",
  "VOLCANO",
  "PIZZA",
];

// AI Image Generation Function
async function generateAIImage(prompt, roomId, turn) {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using fallback image");
    // Use a deterministic image based on roomId and turn to ensure consistency
    const seed = `${roomId}-${turn}`;
    const hash = seed.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    const imageUrl = `https://picsum.photos/512/512?random=${imageId}`;
    console.log(
      `Generated fallback image for room ${roomId}, turn ${turn}: ${imageUrl}`,
    );
    return imageUrl;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
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
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(
        `API call failed: ${errorData.error && errorData.error.message ? errorData.error.message : "Unknown error"}`,
      );
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;
      console.log(
        `Generated AI image for room ${roomId}, turn ${turn}: ${imageUrl}`,
      );
      return imageUrl;
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Error generating image with AI:", error);
    // Fallback to deterministic placeholder if AI generation fails
    const seed = `${roomId}-${turn}`;
    const hash = seed.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageId = Math.abs(hash) % 1000;
    const imageUrl = `https://picsum.photos/512/512?random=${imageId}`;
    console.log(
      `Generated fallback image after error for room ${roomId}, turn ${turn}: ${imageUrl}`,
    );
    return imageUrl;
  }
}

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId, username }) => {
      socket.join(roomId);

      let users = await getRoomUsers(roomId);
      let existing = users.find((u) => u.username === username);

      // Check if game is in progress and user is not already in the room
      if (gameStates.has(roomId) && !existing) {
        socket.emit("gameError", {
          message: "Cannot join room - game is already in progress",
          redirect: true, // Add redirect flag
        });
        return;
      }

      if (existing) {
        existing.socketId = socket.id;
      } else {
        users.push({ username, socketId: socket.id, ready: false });
      }

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);

      // Send current game state if game is in progress and user is in the room
      if (gameStates.has(roomId) && existing) {
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

      if (users.length < 4) {
        io.to(roomId).emit("gameError", {
          message: "Need at least 4 players to start",
        });
        return;
      }

      // Initialize game state
      const secretWord =
        SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)];
      // Shuffle player order
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const playerOrder = shuffledUsers.map((u) => u.username);

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
        isActive: true,
      };

      gameStates.set(roomId, gameState);

      // Notify all room members to redirect to game page
      io.to(roomId).emit("gameStarted", { roomId });

      // Send initial game state to all players
      setTimeout(() => {
        users.forEach((user) => {
          const userSocket = io.sockets.sockets.get(user.socketId);
          if (userSocket) {
            sendGameStateToUser(userSocket, gameState, user.username);
          }
        });
      }, 1500); // Delay to ensure clients have loaded the game page

      console.log(
        `Game started in room ${roomId} - Secret: ${secretWord}, Spy: ${spyUsername}, First: ${gameState.currentPlayer}`,
      );
    });

    socket.on("generateImage", async ({ roomId, username, prompt, turn }) => {
      const gameState = gameStates.get(roomId);
      if (!gameState || gameState.currentPlayer !== username) {
        socket.emit("gameError", {
          message: "Not your turn or game not active",
        });
        return;
      }

      console.log(
        `${username} generating image with prompt: "${prompt}" for room ${roomId}, turn ${turn}`,
      );

      try {
        // Show generating status to user
        socket.emit("imageGenerating", {
          player: username,
          message: "Generating image with AI...",
        });

        // Use real AI image generation with consistent parameters
        const imageUrl = await generateAIImage(prompt, roomId, turn);

        // Store image data
        const imageData = {
          player: username,
          prompt,
          imageUrl,
          turn,
          timestamp: new Date().toISOString(),
        };

        gameState.images.push(imageData);

        console.log(`Image generated and stored for ${username}: ${imageUrl}`);
        console.log(
          `Current gameState.images:`,
          gameState.images.map((img) => ({
            player: img.player,
            turn: img.turn,
            url: img.imageUrl,
          })),
        );

        // Notify current player about their generated image
        socket.emit("imageGenerated", {
          player: username,
          imageUrl,
          success: true,
          message: "Image generated successfully!",
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
          users.forEach((user) => {
            const userSocket = io.sockets.sockets.get(user.socketId);
            if (userSocket) {
              sendGameStateToUser(userSocket, gameState, user.username);
            }
          });

          io.to(roomId).emit("phaseChange", {
            phase: "FINAL_GUESS",
            message: `${gameState.currentPlayer}, you're the last player — skip drawing and guess the secret word!`,
          });
        } else {
          // move to next player
          gameState.currentPlayer = gameState.playerOrder[nextIndex];
          gameState.turn++;

          gameStates.set(roomId, gameState);

          const users = await getRoomUsers(roomId);
          users.forEach((user) => {
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
          error: error.message,
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
      const isCorrect =
        guess.toLowerCase() === gameState.secretWord.toLowerCase();

      if (isCorrect) {
        // Non-spy players win
        const gameResult = {
          result: "GUESS_CORRECT",
          winner: "NON_SPY_PLAYERS",
          secretWord: gameState.secretWord,
          spy: gameState.spyUsername,
          finalGuess: guess,
        };

        io.to(roomId).emit("gameEnd", gameResult);

        // Start countdown timer for room cleanup
        startGameEndCountdown(roomId);
      } else {
        // Move to voting phase
        gameState.gamePhase = "VOTING";
        gameState.currentPlayer = null; // No current player in voting phase
        gameStates.set(roomId, gameState);

        // Send updated game state to all players for voting phase
        const users = await getRoomUsers(roomId);
        users.forEach((user) => {
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
          finalGuess: guess,
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
          message: "The first player cannot be voted — they are not the spy.",
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
        Object.values(gameState.votes).forEach((vote) => {
          voteCount[vote] = (voteCount[vote] || 0) + 1;
        });

        // Find the highest vote count
        const maxVotes = Math.max(...Object.values(voteCount));
        const mostVotedPlayers = Object.keys(voteCount).filter(
          (player) => voteCount[player] === maxVotes,
        );

        let gameResult;

        if (mostVotedPlayers.length > 1) {
          const spyInTie = mostVotedPlayers.includes(gameState.spyUsername);

          if (spyInTie) {
            // Spy is among the tied → no one wins
            gameResult = {
              result: "TIE_NO_WINNER",
              winner: "NONE",
              secretWord: gameState.secretWord,
              spy: gameState.spyUsername,
              voteResults: voteCount,
              tiedPlayers: mostVotedPlayers,
              message:
                "It's a tie and the spy is among the most voted — no winner!",
            };
          } else {
            // Spy not in tied → spy wins
            gameResult = {
              result: "SPY_NOT_VOTED",
              winner: "SPY",
              secretWord: gameState.secretWord,
              spy: gameState.spyUsername,
              voteResults: voteCount,
              tiedPlayers: mostVotedPlayers,
              message: "Players failed to identify the spy — Spy wins!",
            };
          }
        } else {
          const mostVoted = mostVotedPlayers[0];
          const spyFound = mostVoted === gameState.spyUsername;

          gameResult = {
            result: spyFound ? "SPY_FOUND" : "SPY_NOT_FOUND",
            winner: spyFound ? "NON_SPY_PLAYERS" : "SPY",
            secretWord: gameState.secretWord,
            spy: gameState.spyUsername,
            voteResults: voteCount,
            mostVoted,
          };
        }

        console.log(`Voting completed - Vote counts:`, voteCount);
        console.log(`Result:`, gameResult);

        io.to(roomId).emit("gameEnd", gameResult);

        // Start countdown timer for room cleanup
        startGameEndCountdown(roomId);
      } else {
        // Notify room about vote progress
        io.to(roomId).emit("voteProgress", {
          votedPlayers: Object.keys(gameState.votes),
          remainingVotes: totalPlayers - totalVotes,
        });
      }
    });

    socket.on("endGame", async ({ roomId, username }) => {
      const users = await getRoomUsers(roomId);
      const room = users.find((u) => u.username === username);

      // Only allow host to end game
      if (!room) {
        socket.emit("gameError", { message: "User not found in room" });
        return;
      }

      // Check if there's an active game
      if (!gameStates.has(roomId)) {
        socket.emit("gameError", { message: "No active game to end" });
        return;
      }

      console.log(`Host ${username} is ending game in room ${roomId}`);

      // Start 10-second countdown
      let countdown = 10;
      io.to(roomId).emit("gameEndingCountdown", {
        countdown,
        message: `Host is ending the game. Returning to lobby in ${countdown} seconds...`,
      });

      const endGameInterval = setInterval(() => {
        countdown--;
        io.to(roomId).emit("gameEndingCountdown", {
          countdown,
          message: `Host is ending the game. Returning to lobby in ${countdown} seconds...`,
        });

        if (countdown <= 0) {
          clearInterval(endGameInterval);

          // Reset all players to unready state
          const resetUsers = users.map((u) => ({ ...u, ready: false }));
          setRoomUsers(roomId, resetUsers);

          // Remove game state
          gameStates.delete(roomId);

          // Notify all clients to return to lobby
          io.to(roomId).emit("gameEnded", {
            message: "Game ended by host. All players reset to unready state.",
          });
          io.to(roomId).emit("roomUpdate", resetUsers);

          console.log(`Game ended by host in room ${roomId}`);
        }
      }, 1000);
    });

    socket.on("leaveGame", async ({ roomId, username }) => {
      // Check if game is in progress
      if (gameStates.has(roomId)) {
        socket.emit("gameError", {
          message: "Cannot leave room during active game",
        });
        return;
      }

      // Handle leave game logic
      socket.leave(roomId);

      let users = await getRoomUsers(roomId);
      users = users.filter((u) => u.username !== username);

      await setRoomUsers(roomId, users);
      io.to(roomId).emit("roomUpdate", users);
      io.to(roomId).emit("userLeftGame", { username });

      console.log(`${username} left game in room ${roomId}`);
    });

    socket.on("leaveRoom", async ({ roomId, username }) => {
      // Check if game is in progress
      if (gameStates.has(roomId)) {
        socket.emit("gameError", {
          message: "Cannot leave room during active game",
        });
        return;
      }

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

    socket.on("removePlayer", async ({ roomId, username, hostUsername }) => {
      try {
        const users = await getRoomUsers(roomId);
        const host = users.find((u) => u.username === hostUsername);
        const targetUser = users.find((u) => u.username === username);

        // Verify that the requester is the host
        if (!host || host.socketId !== socket.id) {
          socket.emit("gameError", {
            message: "Only the host can remove players",
          });
          return;
        }

        // Check if game is in progress
        if (gameStates.has(roomId)) {
          socket.emit("gameError", {
            message: "Cannot remove players during active game",
          });
          return;
        }

        // Can't remove yourself
        if (username === hostUsername) {
          socket.emit("gameError", { message: "Cannot remove yourself" });
          return;
        }

        if (!targetUser) {
          socket.emit("gameError", { message: "Player not found in room" });
          return;
        }

        // Remove the player from the room
        const updatedUsers = users.filter((u) => u.username !== username);
        await setRoomUsers(roomId, updatedUsers);

        // Notify the removed player
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.emit("playerRemoved", {
            message: "You have been removed from the room by the host",
            roomId,
          });
          targetSocket.leave(roomId);
        }

        // Update all remaining users
        io.to(roomId).emit("roomUpdate", updatedUsers);
        io.to(roomId).emit("playerRemovedNotification", {
          message: `${username} has been removed from the room`,
          removedPlayer: username,
        });

        console.log(
          `Player ${username} removed from room ${roomId} by host ${hostUsername}`,
        );
      } catch (error) {
        console.error(
          `Error removing player ${username} from room ${roomId}:`,
          error,
        );
        socket.emit("gameError", { message: "Failed to remove player" });
      }
    });

    socket.on("deleteRoom", async ({ roomId, hostUsername }) => {
      try {
        const users = await getRoomUsers(roomId);
        const host = users.find((u) => u.username === hostUsername);

        // Verify that the requester is the host
        if (!host || host.socketId !== socket.id) {
          socket.emit("gameError", {
            message: "Only the host can delete the room",
          });
          return;
        }

        // Check if game is in progress
        if (gameStates.has(roomId)) {
          socket.emit("gameError", {
            message: "Cannot delete room during active game",
          });
          return;
        }

        console.log(`Host ${hostUsername} is deleting room ${roomId}`);

        // Notify all users in the room that it's being deleted
        io.to(roomId).emit("roomDeleted", {
          message: "This room has been deleted by the host",
          roomId,
        });

        // Remove all users from the room
        for (const user of users) {
          const userSocket = io.sockets.sockets.get(user.socketId);
          if (userSocket) {
            userSocket.leave(roomId);
          }
        }

        // Clean up room data
        await setRoomUsers(roomId, []);
        await redis.del(`room:${roomId}`);

        // Remove game state if exists
        gameStates.delete(roomId);

        console.log(`Room ${roomId} has been deleted by host ${hostUsername}`);
      } catch (error) {
        console.error(`Error deleting room ${roomId}:`, error);
        socket.emit("gameError", { message: "Failed to delete room" });
      }
    });
  });

  // Helper function to start countdown timer and cleanup room
  function startGameEndCountdown(roomId) {
    console.log(`Starting 30-second countdown for room ${roomId}`);

    let countdown = 30;

    // Send initial countdown
    io.to(roomId).emit("gameEndCountdown", { countdown });

    const countdownInterval = setInterval(() => {
      countdown--;
      io.to(roomId).emit("gameEndCountdown", { countdown });

      if (countdown <= 0) {
        clearInterval(countdownInterval);

        // Clean up room
        cleanupRoom(roomId);

        // Notify clients to redirect
        io.to(roomId).emit("roomDestroyed", {
          message: "Room has been destroyed. Redirecting to home page...",
        });

        console.log(`Room ${roomId} has been destroyed after countdown`);
      }
    }, 1000);
  }

  // Helper function to cleanup room data
  async function cleanupRoom(roomId) {
    try {
      // Remove from game states
      gameStates.delete(roomId);

      // Clear room users from Redis
      await setRoomUsers(roomId, []);

      // Remove room key from Redis
      await redis.del(`room:${roomId}`);

      // Delete room from database using Room model directly
      try {
        const { Room } = await import("../models/rooms.js");
        const room = await Room.findByPk(roomId);
        if (room) {
          await room.destroy();
          console.log(`Cleaned up room data for ${roomId} - Database: SUCCESS`);
        } else {
          console.log(
            `Cleaned up room data for ${roomId} - Database: ROOM_NOT_FOUND`,
          );
        }
      } catch (dbError) {
        console.error(`Error deleting room ${roomId} from database:`, dbError);
        console.log(`Cleaned up room data for ${roomId} - Database: FAILED`);
      }
    } catch (error) {
      console.error(`Error cleaning up room ${roomId}:`, error);
    }
  }
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
  let userGeneratedImage = null;
  let hasCompletedGeneration = false;

  // Only show secret word to the first player if they're not a spy and it's their turn
  if (isFirstPlayer && !isSpy) {
    secretWord = gameState.secretWord;
  }

  const userImage = gameState.images.find((img) => img.player === username);
  if (userImage) {
    userGeneratedImage = userImage.imageUrl;
    hasCompletedGeneration = true;
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
      console.log(
        `FINAL_GUESS phase - Sending image to ${username}: currentGame=${currentGameImage ? "YES" : "NO"}, previous=${previousImage ? "YES" : "NO"}`,
      );
    } else if (isCurrentPlayer && !isFirstTurn) {
      // Current player (not first) sees the previous image (to describe)
      previousImage = latestImage.imageUrl;
      previousPlayer = latestImage.player;
      showPreviousImage = true;
      console.log(
        `Sending previousImage to current player ${username}: ${previousImage}`,
      );
    } else if (!isCurrentPlayer) {
      // Other players see the latest generated image as "current game progress"
      currentGameImage = latestImage.imageUrl;
      currentGamePlayer = latestImage.player;
      console.log(
        `Sending currentGameImage to waiting player ${username}: ${currentGameImage}`,
      );
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
    currentGamePlayer,
    userGeneratedImage,
    hasCompletedGeneration,
  });

  console.log(
    `Sent game state to ${username}: phase=${gameState.gamePhase}, turn=${gameState.turn}, currentPlayer=${gameState.currentPlayer}, isFirstPlayer=${isFirstPlayer}, showPreviousImage=${showPreviousImage}, secretWord=${secretWord ? "YES" : "NO"}, previousImage=${previousImage ? "YES" : "NO"}, currentGameImage=${currentGameImage ? "YES" : "NO"}, userImage=${userGeneratedImage ? "YES" : "NO"}, completed=${hasCompletedGeneration}`,
  );
}
