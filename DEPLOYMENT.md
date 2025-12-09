# Deployment Guide - Saylani Microfinance App

## 🚀 Production Deployment Steps

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Part A: Deploy Backend to Railway

1. **Prepare Backend for Deployment**
   - Ensure all dependencies are in `package.json`
   - Verify `.gitignore` includes `node_modules` and `.env`

2. **Push to GitHub**
   ```powershell
   cd "e:\saylani app try"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=<your-mongodb-atlas-uri>
     JWT_SECRET=<strong-secret-key>
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=<your-email>
     EMAIL_PASSWORD=<your-app-password>
     FRONTEND_URL=<your-vercel-url>
     OFFICE_LOCATION=Saylani Welfare Office, Karachi
     PORT=5000
     ```
   - Deploy!
   - Note your Railway URL (e.g., `https://your-app.railway.app`)

4. **Setup MongoDB Atlas** (IMPORTANT!)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (M0)
   - Create database user with strong password
   - **Network Access**: Whitelist all IPs (0.0.0.0/0) for production
   - Click "Connect" → "Connect your application"
   - Copy connection string (should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority`)
   - Replace `<password>` with your actual database user password
   - Replace `dbname` with your database name (e.g., `saylani_microfinance`)
   - Use complete connection string in Railway's MONGODB_URI
   
   **Common Issues:**
   - Make sure IP whitelist includes 0.0.0.0/0
   - Ensure password doesn't contain special characters that need URL encoding
   - Verify cluster is active and not paused

#### Part B: Deploy Frontend to Vercel

1. **Update Frontend API URL**
   - Create production env file or configure in Vercel
   - Set `VITE_API_URL` to your Railway backend URL

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-app.railway.app/api
     ```
   - Deploy!

3. **Update Backend CORS**
   - Add your Vercel URL to `FRONTEND_URL` in Railway

### Option 2: Render (Full Stack)

#### Deploy Backend

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Configure:
     - Name: saylani-backend
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Root Directory: `backend`
   
3. **Add Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=<mongodb-atlas-uri>
   JWT_SECRET=<secret-key>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<email>
   EMAIL_PASSWORD=<app-password>
   FRONTEND_URL=<render-frontend-url>
   OFFICE_LOCATION=Saylani Welfare Office, Karachi
   ```

4. **Deploy Backend**

#### Deploy Frontend

1. **Create Static Site**
   - New → Static Site
   - Connect repository
   - Configure:
     - Name: saylani-frontend
     - Build Command: `npm install && npm run build`
     - Publish Directory: `frontend/dist`
     - Root Directory: `frontend`

2. **Add Environment Variable**
   ```
   VITE_API_URL=<your-render-backend-url>/api
   ```

3. **Deploy Frontend**

### Option 3: AWS (Advanced)

#### Backend on EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t2.micro (free tier)
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect and Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install Git
   sudo apt install -y git
   
   # Clone repository
   git clone <your-repo-url>
   cd saylani-microfinance/backend
   
   # Install dependencies
   npm install
   
   # Setup environment
   nano .env
   # Add your environment variables
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start application
   pm2 start src/server.js --name saylani-backend
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx**
   ```bash
   sudo apt install -y nginx
   
   # Configure Nginx
   sudo nano /etc/nginx/sites-available/saylani
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/saylani /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Upload `dist` folder contents
   - Set bucket policy for public read

3. **Setup CloudFront**
   - Create distribution
   - Point to S3 bucket
   - Configure custom domain (optional)

### Post-Deployment Checklist

- [ ] Test user registration
- [ ] Verify email functionality
- [ ] Test loan calculation
- [ ] Test complete application flow
- [ ] Verify admin panel access
- [ ] Test slip generation and download
- [ ] Check all API endpoints
- [ ] Verify CORS configuration
- [ ] Test on mobile devices
- [ ] Check console for errors
- [ ] Monitor backend logs
- [ ] Setup monitoring (optional)
- [ ] Configure backup for database
- [ ] Setup SSL certificate
- [ ] Configure domain name
- [ ] Test password reset flow

### Environment Variables Summary

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saylani-microfinance
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
FRONTEND_URL=https://your-frontend-domain.com
OFFICE_LOCATION=Saylani Welfare Office, Karachi
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### SSL/HTTPS Setup

#### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring & Maintenance

#### Setup Logging
```javascript
// Add to backend
const morgan = require('morgan');
app.use(morgan('combined'));
```

#### Setup Error Tracking
- Consider using Sentry.io
- Configure error reporting
- Monitor application health

#### Database Backups
```bash
# Automated MongoDB backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Setup cron job for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Optimize images
   - Code splitting
   - Lazy loading
   - CDN for static assets

2. **Backend**
   - Enable MongoDB indexes
   - Implement caching (Redis)
   - Rate limiting
   - Compression middleware

### Security Hardening

```javascript
// Add to backend
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Scaling Considerations

- Use load balancer for multiple instances
- Separate read/write database connections
- Implement caching layer
- Use CDN for static assets
- Consider serverless functions for specific tasks

### Cost Estimates

**Free Tier Options:**
- Vercel: Free for frontend
- Railway: $5/month (500MB RAM)
- MongoDB Atlas: Free (512MB)
- **Total: ~$5/month**

**Production Setup:**
- Vercel Pro: $20/month
- Railway: $20/month (2GB RAM)
- MongoDB Atlas M10: $57/month
- **Total: ~$97/month**

### Support & Troubleshooting

Common deployment issues:
1. **CORS errors**: Check FRONTEND_URL matches exactly
2. **Database connection**: Verify MongoDB URI and network access
3. **Email not sending**: Check Gmail app password
4. **Build fails**: Verify all dependencies in package.json
5. **API not responding**: Check environment variables

### Rollback Strategy

```bash
# Railway/Render - revert to previous deployment
# Vercel - rollback from dashboard

# Manual rollback
git revert HEAD
git push origin main
```

---

## 📞 Need Help?

- Check logs in deployment platform
- Review environment variables
- Test locally first
- Consult platform documentation

**Deployment complete! Your app is now live! 🎉**
