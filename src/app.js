const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();

// Configure multer for file uploads
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', apiRoutes);

// Serve static frontend (HTML, CSS, JS, assets) from project root for same-origin dev
app.use(express.static('.', { index: false }));

// Add specific route for teacher dashboard
app.use('/teacher-dashboard', express.static(path.join(__dirname, '..', 'teacher-dashboard')));

// Clean route for /teacher/dashboard
app.get('/teacher/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'teacher-dashboard', 'teacher-dashboard.html'));
});

// Add specific route for student dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// Add specific route for login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login', 'login.html'));
});

// Add specific route for signup page
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login', 'signup.html'));
});

// Add specific route for verify-email page
app.get('/verify-email.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login', 'verify-email.html'));
});

app.get('/', (req, res) => res.sendFile('index.html', { root: '.' }));

module.exports = app;

