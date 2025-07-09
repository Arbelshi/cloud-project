const User    = require('../models/user');
const Patient = require('../models/patient');

// Displays the login form
exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

// POST /login logic
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.checkPassword(password)) {
    return res.render('login', { error: 'Invalid credentials' });
  }

  // If this is a patient user without a profile, create an empty profile.
  if (user.role === 'Patient' && !user.patient) {
    const patient = await Patient.create({
      user:        user._id,
      firstName:   '',
      lastName:    '',
      gender:      'Other',
      dateOfBirth: new Date(),
      email:       user.email,
      phone:       ''
    });
    user.patient = patient._id;
    await user.save();
  }

  // Save session
  req.session.userId   = user._id.toString();
  req.session.userData = {
    id:      user._id.toString(),
    role:    user.role,
    patient: user.patient ? user.patient.toString() : null
  };

  // Routing by role
  if (user.role === 'Patient') {
    return res.redirect(`/patients/${user.patient}/edit`);
  }
  res.redirect('/');
};

// Displays the registration form
exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

// POST /register logic
exports.postRegister = async (req, res) => {
  try {
    const {
      email, password, role,
      firstName, lastName, gender,
      dateOfBirth, phone
    } = req.body;

    // Create a user
    const user = new User({ email, password, role });
    await user.save();

    // If a patient is registered, create a Patient record for them
    if (role === 'Patient') {
      const patient = await Patient.create({
        user:        user._id,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        email,
        phone
      });
      user.patient = patient._id;
      await user.save();
    }

    res.redirect('/login');
  } catch (err) {
    res.status(400).render('register', { error: err.message });
  }
};

// Logging out 
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
