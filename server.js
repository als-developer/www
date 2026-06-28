const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// ===== DATA STORE (In Memory) =====
// =============================================
let posts = [];
let contacts = [];
let aiSessions = [];
let visitors = [];
let postIdCounter = 1;

// =============================================
// ===== LOGIN =====
// =============================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log(' Login attempt:', { username });
  
  if (username === 'admin' && password === 'ailifesolution.lexurer') {
    const token = jwt.sign(
      { username: 'admin', role: 'admin' },
      'ailifesolution_super_secret_key_2026',
      { expiresIn: '24h' }
    );
    console.log(' Login successful');
    return res.json({ success: true, token });
  }
  
  console.log(' Login failed');
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// =============================================
// ===== VERIFY TOKEN =====
// =============================================
app.get('/api/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false });
    jwt.verify(token, 'ailifesolution_super_secret_key_2026');
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

// =============================================
// ===== LOGOUT =====
// =============================================
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// =============================================
// ===== POSTS API =====
// =============================================

app.get('/api/posts', (req, res) => {
  console.log(' GET /api/posts - Returning ' + posts.length + ' posts');
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  try {
    console.log(' POST /api/posts');
    console.log(' Body:', req.body);
    
    const { title, content, type, image, caption, featured } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const newPost = {
      id: 'post_' + (postIdCounter++),
      title: title,
      content: content,
      type: type || 'text',
      image: image || '',
      caption: caption || '',
      featured: featured || false,
      author: 'Admin',
      timestamp: new Date().toISOString(),
      views: 0,
      likes: 0
    };
    
    posts.unshift(newPost);
    console.log(' Post created successfully:', newPost.id);
    console.log(' Total posts now:', posts.length);
    res.status(201).json(newPost);
  } catch (error) {
    console.error(' Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', (req, res) => {
  try {
    const { title, content, type, image, caption, featured } = req.body;
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    posts[index] = {
      ...posts[index],
      title: title || posts[index].title,
      content: content || posts[index].content,
      type: type || posts[index].type,
      image: image !== undefined ? image : posts[index].image,
      caption: caption !== undefined ? caption : posts[index].caption,
      featured: featured !== undefined ? featured : posts[index].featured
    };
    res.json(posts[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  try {
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    posts.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.post('/api/posts/:id/view', (req, res) => {
  try {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.views = (post.views || 0) + 1;
    res.json({ success: true, views: post.views });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// =============================================
// ===== CONTACT API =====
// =============================================

app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }
    const newContact = {
      id: 'contact_' + Date.now(),
      name: name,
      email: email || '',
      phone: phone || '',
      message: message,
      type: type || 'contact',
      status: 'unread',
      timestamp: new Date().toISOString()
    };
    contacts.unshift(newContact);
    res.status(201).json({ success: true, id: newContact.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

app.get('/api/admin/contacts', (req, res) => {
  try {
    const { status } = req.query;
    let result = contacts;
    if (status && status !== 'all') {
      result = contacts.filter(c => c.status === status);
    }
    res.json({ contacts: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

app.put('/api/contact/:id', (req, res) => {
  try {
    const { status, reply } = req.body;
    const contact = contacts.find(c => c.id === req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (status) contact.status = status;
    if (reply) contact.reply = reply;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.delete('/api/admin/contacts/batch', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No contact IDs provided' });
    }
    contacts = contacts.filter(c => !ids.includes(c.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contacts' });
  }
});

// =============================================
// ===== ADMIN STATS =====
// =============================================

app.get('/api/admin/stats', (req, res) => {
  try {
    let totalViews = 0;
    posts.forEach(p => totalViews += (p.views || 0));
    res.json({
      totalPosts: posts.length,
      totalContacts: contacts.length,
      unreadContacts: contacts.filter(c => c.status === 'unread').length,
      totalAISessions: aiSessions.length,
      totalVisitors: visitors.length,
      todayVisitors: visitors.filter(v => {
        const today = new Date().toISOString().split('T')[0];
        return v.date === today;
      }).length,
      totalViews: totalViews,
      recentContacts: contacts.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// =============================================
// ===== AI CHAT API =====
// =============================================

app.post('/api/ai/chat', (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Simple AI responses
    const responses = [
      'That is a great question! Let me help you with that.',
      'I understand your concern. Here is what I can suggest.',
      'Thank you for reaching out. Our team can definitely assist with this.',
      'I appreciate your inquiry. Let me provide some detailed information.',
      'Great question! Here are the key points you should know.',
      'I am here to help. Let me explain how this works.',
      'That is an excellent point. Here is our approach.',
      'Thank you for asking. Let me break this down for you.'
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    let newSessionId = sessionId;
    if (!sessionId) {
      newSessionId = 'session_' + Date.now();
      aiSessions.push({
        id: newSessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const session = aiSessions.find(s => s.id === newSessionId);
    if (session) {
      session.messages.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() }
      );
      session.updatedAt = new Date().toISOString();
      session.messageCount = session.messages.length;
    }
    
    res.json({
      success: true,
      response: response,
      sessionId: newSessionId
    });
  } catch (error) {
    console.error(' AI chat error:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

app.get('/api/ai/sessions', (req, res) => {
  try {
    res.json(aiSessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

app.delete('/api/ai/chat/:sessionId', (req, res) => {
  try {
    aiSessions = aiSessions.filter(s => s.id !== req.params.sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// =============================================
// ===== ANALYTICS =====
// =============================================

app.get('/api/analytics/visitors', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let total = visitors.length;
    let todayCount = visitors.filter(v => v.date === today).length;
    const pageViews = {};
    visitors.forEach(v => {
      if (v.page) {
        pageViews[v.page] = (pageViews[v.page] || 0) + 1;
      }
    });
    res.json({ total: total, today: todayCount, pageViews: pageViews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get visitors' });
  }
});

app.post('/api/analytics/visitor', (req, res) => {
  try {
    const { page } = req.body;
    visitors.push({
      page: page || 'home',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record visitor' });
  }
});

// =============================================
// ===== FRONTEND ROUTES =====
// =============================================

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/404', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('*', (req, res) => {
  const requestedPath = req.path;
  const publicPath = path.join(__dirname, 'public', requestedPath);
  
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return res.sendFile(publicPath);
  }
  
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// =============================================
// ===== START SERVER =====
// =============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log(' AILifeSolution Server');
  console.log('========================================');
  console.log(' Server running on port ' + PORT);
  console.log(' Home: http://localhost:' + PORT + '/home');
  console.log(' Admin: http://localhost:' + PORT + '/admin');
  console.log('----------------------------------------');
  console.log(' Username: admin');
  console.log(' Password: ailifesolution.lexurer');
  console.log('========================================');
});
