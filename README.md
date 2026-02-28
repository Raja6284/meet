# NearMeet — Real-Time Video Calling App

A full-stack, real-time video calling application built with **React**, **WebRTC**, **Socket.io**, and **Node.js**. Crystal-clear peer-to-peer video calls with up to 8 participants, screen sharing, in-call chat, and a premium dark UI.

![NearMeet](https://img.shields.io/badge/NearMeet-Video%20Calls-6366f1?style=for-the-badge)

## Features

- **Instant video calls** — Create or join meetings with a shareable room code
- **Peer-to-peer (mesh)** — WebRTC connections go directly between browsers
- **Up to 8 participants** — Perfect for team standups and small group calls
- **Screen sharing** — Share your screen with one click
- **In-call chat** — Text chat alongside video
- **Active speaker detection** — Visual indicator for who's speaking
- **Camera/mic controls** — Toggle camera, mute mic, instant feedback
- **Lobby preview** — See yourself before joining a call
- **Responsive grid** — Auto-layout from 1 to 8 participants
- **Glassmorphism UI** — Premium dark theme with smooth animations
- **Connection resilience** — Auto-reconnect, ICE restart on failure

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Signaling | Node.js, Express, Socket.io |
| Media | WebRTC (native browser APIs) |
| Icons | Lucide React |
| Routing | React Router v7 |

## Project Structure

```
meet/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── Avatar.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── ControlsBar.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ParticipantList.jsx
│   │   │   ├── RoomGrid.jsx
│   │   │   ├── ToastContainer.jsx
│   │   │   └── VideoTile.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useActiveSpeaker.js
│   │   │   ├── useMediaStream.js
│   │   │   ├── useSocket.js
│   │   │   ├── useToast.js
│   │   │   └── useWebRTC.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── RoomPage.jsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── utils/
│   │   │   ├── formatTime.js
│   │   │   └── roomUtils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── vite.config.js
│   └── vercel.json
├── server/                 # Signaling server
│   ├── index.js
│   ├── roomManager.js
│   ├── .env
│   └── Procfile
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+

### 1. Clone & install

```bash
git clone <your-repo-url> nearmeet
cd nearmeet

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

**Server** (`server/.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_SERVER_URL=http://localhost:5000
```

### 3. Run locally

Start the signaling server:
```bash
cd server
npm start          # or: npm run dev (watch mode)
```

Start the client dev server (in a separate terminal):
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Test a call

1. Open two browser tabs at `http://localhost:5173`
2. Click **Start a Meeting** → enter your name → start
3. Copy the room code
4. In the second tab, click **Join with Code** → paste the code → enter a name → join
5. You should see both video feeds!

## Deployment

### Client → Vercel

```bash
cd client
npx vercel
```

Set `VITE_SERVER_URL` to your deployed server URL in Vercel environment variables.

### Server → Railway / Render / Fly.io

Deploy the `server/` directory. Set environment variables:

```env
PORT=5000
CLIENT_URL=https://your-client-domain.vercel.app
```

### TURN Server (optional, for production)

For calls across strict NATs/firewalls, configure a TURN server:

```env
# client/.env
VITE_TURN_URL=turn:your-turn-server:3478
VITE_TURN_USERNAME=username
VITE_TURN_CREDENTIAL=credential
```

Free options: [Open Relay](https://www.metered.ca/tools/openrelay/), [Xirsys](https://xirsys.com/), or self-hosted [coturn](https://github.com/coturn/coturn).

## Architecture

```
Browser A ◄──WebRTC──► Browser B
    │                      │
    └──Socket.io──► Server ◄──Socket.io──┘
                (signaling only)
```

- **Signaling server** exchanges offers, answers, and ICE candidates
- **Media flows peer-to-peer** — never touches the server
- **Mesh topology** — each peer connects to every other peer (scales to ~8)

## License

MIT
