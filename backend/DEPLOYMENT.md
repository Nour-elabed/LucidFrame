# Render Deployment Checklist

## Required Environment Variables
Set these in your Render dashboard:

1. **GEMINI_API_KEY** - Your Google Gemini API key
2. **MONGODB_URI** - Your MongoDB connection string
3. **JWT_SECRET** - A secure secret for JWT tokens
4. **NODE_ENV** - Set to `production`
5. **CLIENT_URL** - Your Vercel frontend URL
6. **AI_RATE_LIMIT** - Set to `5` (requests per day)

## Deployment Steps

1. **Push latest code to GitHub**
2. **Manual deploy on Render** (since autoDeploy: false)
3. **Verify environment variables are set**
4. **Test endpoints after deployment**

## Fixed Issues

✅ Upload path resolution for production
✅ Enhanced AI generation with fallback
✅ Proper error handling
✅ Production-ready directory structure

## Test These Endpoints After Deployment

- GET /api/health (should return status: ok)
- POST /api/posts (image upload)
- POST /api/ai/generate (AI generation)
