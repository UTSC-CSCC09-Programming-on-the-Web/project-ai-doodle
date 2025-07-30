# AI Doodle

## Deployed URL

[https://aidoodle.online](https://aidoodle.online)

## Video Demo Link

[https://youtu.be/6xOm91hoAuk](https://youtu.be/6xOm91hoAuk)

## Team Members

- **Wengxin Xu**  
  Email: wengxin.xu@mail.utoronto.ca  
  UTORid: xuwengxi

- **Pengpeng Cao**  
  Email: p.cao@mail.utoronto.ca  
  UTORid: caopeng3

---

## Project Description

**AI Doodle** is a multi-player web game that combines AI image generation, creativity, and social deduction. It challenges players to interpret and describe images in a chain—while trying to identify a hidden spy.

### Game Rules

1. At the start of each round, AI randomly selects a secret word and assigns one player as the **Spy**.
2. The first player sees the word (except the spy) and enters a prompt based on the word to generate an image using AI.
3. The next player **only sees the previous image**, and writes a prompt describing what they think it is. A new image is generated based on that.
4. The process continues until the last player.
5. The last player attempts to guess the original word (or a synonym).
   - If correct, all players except the spy win.
   - If incorrect, all players view the image chain and vote on who the spy is.
     - If the spy is correctly identified, all players except the spy win.
     - Otherwise, the spy wins.

---

## Tech Stack

- **Frontend**: Vue 3 (Single Page Application)
- **Backend**: Express.js (REST API)
- **Database**: PostgreSQL
- **Authentication**: OAuth 2.0 (Google Login)
- **Image Generation**: OpenAI
- **Real-time Communication**: Socket.IO (WebSockets)
- **Deployment**: Docker + Docker Compose on a Virtual Machine
- **CI/CD**: GitHub Actions

---

## Additional Feature: Real-time Functionality

This project uses **Socket.IO** to implement real-time communication throughout the game:

- Players join a game room and take turns in real time
- Each prompt/image submission is immediately broadcast to the next player
- Voting and results are shown live to all users without needing to refresh

---

## Milestones

### Alpha Version

- [ ] Google OAuth login and nickname system
- [ ] Room creation and join via invite code
- [ ] AI prompt + image generation
- [ ] Basic frontend and image display interface
- [ ] Payment system based on Stripe

### Beta Version

- [ ] Full game loop: word selection, spy assignment, image-prompt chain
- [ ] Last-player guessing and validation logic
- [ ] Real-time synchronization with WebSocket
- [ ] Dockerized deployment on a VM

### Final Version

- [ ] Spy voting phase and winner decision
- [ ] Image history and game recap display
- [ ] Flexible word-guess validation (synonyms allowed)
- [ ] Voting interface with player icons
- [ ] Final documentation and demo video

---
