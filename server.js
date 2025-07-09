require('dotenv').config();
const express        = require('express');
const mongoose       = require('mongoose');
const fs             = require('fs');
const path           = require('path');
const session        = require('express-session');
const methodOverride = require('method-override');
const multer         = require('multer');

const { hasFace }       = require('./utils/faceDetection');
const { detectFood }    = require('./utils/foodDetection');
const { searchFood,
        getFoodDetails } = require('./utils/usda');
const { getWarningsForProfile } = require('./utils/conditionWarnings');

const Patient   = require('./models/patient');
const User      = require('./models/user');
const Detection = require('./models/detection');

const app      = express();
const PORT     = process.env.PORT || 3000;
const MONGO_URI= process.env.MONGO_URI;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename:    (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Global Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body._method === 'string') {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
  if (req.query && typeof req.query._method === 'string') {
    const method = req.query._method;
    delete req.query._method;
    return method;
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Make currentUser available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userData || null;
  next();
});

// Auth helpers
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (req.session.userData && req.session.userData.role === role) {
      return next();
    }
    res.status(403).send('Forbidden');
  };
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// require('dotenv').config();
console.log('IMMAGA key:', process.env.IMAGGA_API_KEY ? 'OK' : 'MISSING');
console.log('USDA key:   ', process.env.USDA_API_KEY   ? 'OK' : 'MISSING');

// אחרי ההגדרה של view engine, middleware וכד'
const authRoutes    = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const foodRoutes    = require('./routes/foodRoutes');
const indexRoutes = require('./routes/indexRoutes');

// כל הנתיבים דרך ה־Router
app.use('/', authRoutes);
app.use('/', patientRoutes);
app.use('/', foodRoutes);
app.use('/', indexRoutes);

