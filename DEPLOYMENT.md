# Live Bidding App - Production Deployment Guide

## Environment Variables

### Server Environment Variables (.env)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/live-bidding
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://username:password@redis-host:6379
```

### Client Environment Variables (.env)
```bash
VITE_API_URL=https://your-app-name.onrender.com
VITE_SOCKET_URL=https://your-app-name.onrender.com
```

## Render Deployment Setup

### 1. Backend Service (Node.js)
- **Name**: live-bidding-api
- **Runtime**: Node
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Instance Type**: Starter (Free) or Pro

### 2. Frontend Service (Static)
- **Name**: live-bidding-app
- **Runtime**: Static
- **Build Command**: `cd client && npm run build`
- **Publish Directory**: `client/dist`
- **Add Redirect**: Rewrite `/api/*` to `https://live-bidding-api.onrender.com/api/$1`

### 3. Database Services
- **MongoDB Atlas**: Free tier cluster
- **Redis Cloud**: Free tier instance

## Deployment Steps

### 1. Prepare for Production
```bash
# Update package.json scripts
cd server
npm install --production

cd ../client
npm run build
```

### 2. Create Render Services
1. Connect GitHub repository to Render
2. Create backend service first
3. Create frontend service second
4. Add environment variables to both services

### 3. Configure CORS
Update server.js for production:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-app-name.onrender.com', 'https://live-bidding-app.onrender.com'],
  credentials: true
}));
```

### 4. Test Deployment
- Backend health check: `https://your-api.onrender.com/api/health`
- Frontend: `https://your-app-name.onrender.com`
- Test login/registration flow
- Test auction creation and bidding

## Post-Deployment Checklist

### Security
- [ ] Change default JWT secret
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up rate limiting
- [ ] Validate all inputs

### Performance
- [ ] Configure Redis caching
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Monitor resource usage

### Monitoring
- [ ] Set up error logging
- [ ] Monitor database connections
- [ ] Track API response times
- [ ] Set up alerts for downtime

## Scaling Considerations

### When to Upgrade
- **Backend**: High CPU usage or memory pressure
- **Database**: Slow queries or connection limits
- **Redis**: Memory usage approaching limits

### Scaling Options
- **Render Pro**: More RAM/CPU, background workers
- **Database**: Upgrade to paid tier for more connections
- **CDN**: Cloudflare for static assets
- **Load Balancing**: Multiple backend instances

## Troubleshooting

### Common Issues
1. **CORS errors**: Update allowed origins
2. **Database connection**: Check URI string
3. **Socket.io issues**: Verify WebSocket support
4. **Build failures**: Check Node.js version compatibility

### Debug Commands
```bash
# Check logs
render logs

# Restart service
render restart

# Check environment variables
render env
```

## Backup Strategy
- **Database**: Daily automated backups
- **Code**: Version control with Git
- **Assets**: Cloud storage with redundancy

## Domain Setup (Optional)
1. Purchase domain from registrar
2. Update DNS to point to Render
3. Configure SSL certificates (automatic)
4. Update CORS origins
