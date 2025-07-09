// Controllers/homeController.js
const Patient   = require('../models/patient');
const Detection = require('../models/detection');

exports.dashboard = async (req, res) => {
  const role = req.session.userData.role;

  if (role === 'Doctor') {
    const totalPatients    = await Patient.countDocuments();
    const recentPatients   = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt');
    const today            = new Date();
    const upcomingBirthdays = await Patient.aggregate([
      { $addFields: {
          monthDay: { $dateToString: { format: "%m-%d", date: "$dateOfBirth" } }
      }},
      { $match: {
          monthDay: {
            $in: Array.from({ length: 7 }, (_, i) => {
              const d = new Date(today);
              d.setDate(today.getDate() + i);
              return d.toISOString().slice(5,10);
            })
          }
      }},
      { $project: { firstName:1, lastName:1, dateOfBirth:1 } }
    ]);

    return res.render('index', {
      totalPatients, recentPatients, upcomingBirthdays
    });
  }

  // The patient's view
  const patientId   = req.session.userData.patient;
  const detections  = await Detection.find({ patient: patientId })
                      .sort({ createdAt: -1 });
  const totalScans  = detections.length;
  const lastScan    = totalScans > 0 ? detections[0].createdAt : null;
  const totalWarnings = detections.reduce(
    (sum, det) => sum + det.items.reduce(
      (s, item) => s + (item.warnings?.length||0), 0
    ), 0
  );

  res.render('index', {
    totalScans, lastScan, totalWarnings
  });
};
