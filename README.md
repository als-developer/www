# AILifeSolution Platform

Enterprise Business Systems Platform with Admin Dashboard, AI Chat, and Content Management.

## Features

- **Modern Landing Page** - Professional business systems showcase
- **Admin Dashboard** - Full content management system
- **Posts Management** - Create, edit, delete posts with images
- **Contact System** - User messages with reply functionality
- **AI Chat** - Powered by DeepSeek API
- **Analytics** - Visitor tracking and statistics
- **Responsive Design** - Works on all devices

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: Firebase Realtime Database
- **Frontend**: HTML, CSS, JavaScript
- **AI**: DeepSeek API
- **Authentication**: JWT

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Copy `firebase-config.json.example` to `firebase-config.json` and fill in your Firebase config
5. Start the server: `npm start`

## Routes

- `/home` - Main landing page
- `/admin` - Admin dashboard (login required)
- `/api/*` - API endpoints

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post (admin)
- `PUT /api/posts/:id` - Update a post (admin)
- `DELETE /api/posts/:id` - Delete a post (admin)
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/view` - Record a post view
- `GET /api/admin/contacts` - Get contact messages (admin)
- `POST /api/contact` - Submit a contact message
- `PUT /api/contact/:id` - Update contact status (admin)
- `POST /api/ai/chat` - Send AI chat message
- `GET /api/analytics/visitors` - Get visitor statistics (admin)

## Default Admin Credentials

- Username: `admin`
- Password: `admin` (change in .env)

## Analytics Features

The admin dashboard tracks:
- Total visitors to the website
- Today's visitors
- Page views per page
- Post views (when users click on posts)
- Contact messages

## License

MIT
