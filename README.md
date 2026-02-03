# Live Bidding Platform

A modern, real-time auction platform built with React, Node.js, and Socket.io. Experience the thrill of live bidding with a beautiful UI powered by shadcn/ui components.

## 🚀 Features

### Core Features
- **Real-time Bidding** - Live updates every second with Socket.io
- **Auto-updating Bids** - Minimum bid amounts update automatically
- **Image Upload** - Cloudinary integration for seamless image handling
- **User Authentication** - Secure JWT-based authentication system
- **Role-based Access** - Admin and user roles with different permissions

### Advanced Features
- **Win/Lose Animations** - Visual feedback when auctions end
- **Auction History** - Track your bidding and auction activity
- **Watchlist** - Save favorite auctions (coming soon)
- **Advanced Filtering** - Search and filter auctions by category, price, and time
- **Auto-extend Auctions** - Automatically extend auction time when bids are placed near deadline
- **Reserve Prices** - Set minimum selling prices for auctions

### Technical Features
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates** - Socket.io for instant bid notifications
- **Image Storage** - Cloudinary integration for scalable image hosting
- **Form Persistence** - Auto-save auction creation drafts
- **Data Validation** - Comprehensive input validation with Zod schemas

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router v6** - Client-side routing with nested routes
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form management with validation
- **Zod** - TypeScript-first schema validation
- **React Hot Toast** - Elegant toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bid communication
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage and processing

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **nodemon** - Auto-restart server on changes

## 📁 Project Structure

```
LiveBiddingApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   └── user/       # User-facing components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API calls
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.io handlers
│   └── server.js           # Server entry point
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tarunsinghofficial/live-bidding-app
   cd LiveBiddingApp
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**

   **Backend (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/live-bidding
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_API_SECRET=your-api-secret
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   ```

4. **Setup Cloudinary**
   - Create a Cloudinary account
   - Create an upload preset named `auction_uploads`
   - Add your cloud name and upload preset to frontend .env

5. **Start the application**
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend development server
   cd ../client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Auction Endpoints
- `GET /api/auctions` - Get all public auctions
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions` - Create auction (admin only)
- `PUT /api/auctions/:id` - Update auction (admin only)
- `DELETE /api/auctions/:id` - Delete auction (admin only)
- `GET /api/auctions/user/history` - User auction history

### Bid Endpoints
- `POST /api/bids` - Place bid
- `GET /api/bids/auction/:id` - Get auction bids
- `GET /api/bids/user/history` - User bid history

### Socket.io Events
- `bidPlaced` - Real-time bid updates
- `auctionEnded` - Auction completion notifications

## 🏗 Architecture

### Frontend Architecture
- **Component-based** - Modular React components
- **Context API** - Global state management (Auth)
- **Custom Hooks** - Reusable logic (Socket.io, API calls)
- **Route Guards** - Protected routes based on authentication
- **Form Management** - React Hook Form with Zod validation

### Backend Architecture
- **RESTful API** - Standard HTTP methods and status codes
- **Middleware** - Authentication, error handling, CORS
- **Socket.io** - Real-time bid communication
- **Database Models** - Mongoose schemas with validation
- **Error Handling** - Centralized error management

### Data Flow
1. **User Authentication** - JWT tokens stored in localStorage
2. **Real-time Updates** - Socket.io connections for live bidding
3. **Image Uploads** - Direct to Cloudinary, URLs stored in MongoDB
4. **Form Persistence** - localStorage drafts for auction creation
5. **Bid Validation** - Server-side validation with real-time updates

## 🔧 Configuration

### Tailwind CSS Configuration
- Custom color scheme integration
- shadcn/ui component styling
- Responsive design utilities
- Animation support with tailwindcss-animate

### Vite Configuration
- React plugin
- Tailwind CSS plugin
- Path aliases (@/ -> ./src)
- Development server configuration

### Socket.io Configuration
- CORS enabled for development
- Room-based auction communication
- Real-time bid broadcasting
- Connection management

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test          # Run unit tests
npm run test:coverage  # Generate coverage report
```

### Backend Testing
```bash
cd server
npm test          # Run API tests
npm run test:watch  # Watch mode
```

### Manual Testing
1. **User Registration/Login** - Test authentication flow
2. **Auction Creation** - Admin auction management
3. **Live Bidding** - Real-time bid placement
4. **Image Upload** - Cloudinary integration
5. **Responsive Design** - Mobile and desktop layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 🎯 Roadmap

### Upcoming Features
- [ ] Watchlist functionality
- [ ] Advanced search and filtering
- [ ] User profiles and avatars
- [ ] Email notifications
- [ ] Mobile app development
- [ ] Analytics dashboard for admins
- [ ] Multi-language support
- [ ] Dark mode toggle

### Performance Improvements
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Database indexing
- [ ] Code splitting
- [ ] Service worker for PWA

---

**Built with ❤️ using React, Node.js, and modern web technologies**

```
