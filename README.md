# Styl Wardrobe Assistant

A React Native app with AI-powered fashion recommendations and outfit management.

## 🚀 Features

- **AI Fashion Assistant** - Get personalized outfit suggestions using Gemini AI
- **AI Outfit Maker** - Smart outfit recommendations using Hugging Face embeddings
- **User Authentication** - Secure login/signup with JWT
- **Outfit Management** - Save and organize your outfits
- **Profile Management** - Track your fashion preferences

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- React Native development environment
- Expo CLI

## 🔧 Environment Setup

### 1. API Server Setup

1. **Navigate to API directory:**
   ```bash
   cd api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   GEMINI_API_KEY=your_gemini_api_key
   API_BASE_URL=http://your_ip:3000
   ```

4. **Start the API server:**
   ```bash
   npm start
   ```

### 2. React Native App Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Edit `config/env.js` to match your API server URL
   - Update `API_BASE_URL` for your development environment

3. **Start the app:**
   ```bash
   npx expo start
   ```

## 🔑 API Keys Required

### Hugging Face API
- Get your API key from [Hugging Face](https://huggingface.co/settings/tokens)
- Enable "Make calls to Inference Providers" permission
- Used for semantic outfit search

### Gemini API
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Used for AI fashion assistant conversations

### MongoDB
- Use MongoDB Atlas or local MongoDB
- Update connection string in `.env` file

## 📱 Usage

1. **Sign up/Login** with your credentials
2. **Home Screen** - View your weekly outfit planner
3. **AI Outfit Maker** - Get smart outfit recommendations
4. **AI Assistant** - Chat with AI for fashion advice
5. **Profile** - Manage your saved outfits

## 🛠️ Development

### Project Structure
```
├── api/                 # Backend API server
│   ├── models/         # MongoDB models
│   ├── .env           # Environment variables
│   └── index.js       # Main server file
├── screens/           # React Native screens
├── store/            # State management
├── config/           # Environment configuration
└── navigation/       # Navigation setup
```

### Key Technologies
- **Frontend**: React Native, Expo, NativeWind
- **Backend**: Node.js, Express, MongoDB
- **AI**: Hugging Face, Google Gemini
- **Authentication**: JWT

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Keep API keys secure and rotate regularly
- Use HTTPS in production environments

## 📄 License

This project is licensed under the MIT License.
