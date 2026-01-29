# 🎯 Live Bidding App

A real-time auction platform built with React and Socket.io. Users can place bids on items and see updates instantly across all connected clients.

## ✨ Features

- **Real-time Bidding**: Place bids and see updates instantly
- **Live Countdown**: Server-synchronized countdown timers for each auction
- **Race Condition Handling**: Prevents duplicate bids with lock mechanism
- **Responsive UI**: Modern design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- React 19
- Vite
- Socket.io Client
- Tailwind CSS

### Backend

- Node.js
- Express
- Socket.io
- CORS

## 📁 Project Structure

```

LiveBiddingApp/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── lib/
│ └── Dockerfile
├── server/ # Express backend
│ ├── data/
│ ├── server.js
│ └── Dockerfile
└── docker-compose.yml

```

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/tarunsinghofficial/live-bidding-app
   cd LiveBiddingApp
   ```

2. **Start both services**

   ```bash
   docker-compose up --build
   ```

3. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Local Development (Without Docker)

#### Backend Setup

```bash
cd server
npm install
npm start
```

#### Frontend Setup (in a new terminal)

```bash
cd client
npm install
npm run dev
```

## 🔧 Environment Variables

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=production
```

## 📦 Docker Commands

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f client
docker-compose logs -f server
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

Tarun Singh

```

```
