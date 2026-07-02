const express = require('express');
const router  = express.Router();

// Controllers
const vehiclesCtrl            = require('../controllers/vehiclesController');
const vehicleTypesCtrl        = require('../controllers/vehicleTypesController');
const usersCtrl               = require('../controllers/usersController');
const userTypesCtrl           = require('../controllers/userTypesController');
const bookingsCtrl            = require('../controllers/bookingsController');
const reviewsCtrl             = require('../controllers/reviewsController');
const workAssignmentsCtrl     = require('../controllers/workAssignmentsController');
const notificationsCtrl       = require('../controllers/notificationsController');
const licensesObtainedCtrl    = require('../controllers/licensesObtainedController');
const testsTakenCtrl          = require('../controllers/testsTakenController');
const vehicleCertificatesCtrl = require('../controllers/vehicleCertificatesController');
const certificatesCtrl        = require('../controllers/certificatesController');
const licensesCtrl            = require('../controllers/licensesController');
const testsCtrl                = require('../controllers/testsController');

// ── Vehicles ──────────────────────────────────────────────────────────────────
router.get   ('/vehicles',     vehiclesCtrl.getVehicles);
router.get   ('/vehicles/:id', vehiclesCtrl.getVehicleById);
router.post  ('/vehicles',     vehiclesCtrl.createVehicle);
router.put   ('/vehicles/:id', vehiclesCtrl.updateVehicle);
router.delete('/vehicles/:id', vehiclesCtrl.deleteVehicle);

// ── Vehicle Types (read-only – managed via DB) ────────────────────────────────
router.get('/vehicletypes',     vehicleTypesCtrl.getVehicleTypes);
router.get('/vehicletypes/:id', vehicleTypesCtrl.getVehicleTypeById);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get   ('/users',     usersCtrl.getUsers);
router.get   ('/users/:id', usersCtrl.getUserById);
router.post  ('/users',     usersCtrl.createUser);
router.put   ('/users/:id', usersCtrl.updateUser);
router.delete('/users/:id', usersCtrl.deleteUser);

// ── User Types (read-only) ────────────────────────────────────────────────────
router.get('/usertypes',     userTypesCtrl.getUserTypes);
router.get('/usertypes/:id', userTypesCtrl.getUserTypeById);

// ── Bookings ──────────────────────────────────────────────────────────────────
router.get   ('/bookings',     bookingsCtrl.getBookings);
router.get   ('/bookings/:id', bookingsCtrl.getBookingById);
router.post  ('/bookings',     bookingsCtrl.createBooking);
router.put   ('/bookings/:id', bookingsCtrl.updateBooking);
router.delete('/bookings/:id', bookingsCtrl.deleteBooking);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get   ('/reviews',     reviewsCtrl.getReviews);
router.get   ('/reviews/:id', reviewsCtrl.getReviewById);
router.post  ('/reviews',     reviewsCtrl.createReview);
router.put   ('/reviews/:id', reviewsCtrl.updateReview);
router.delete('/reviews/:id', reviewsCtrl.deleteReview);

// ── Work Assignments ──────────────────────────────────────────────────────────
// ?u_id=N → employee's assignments | ?available=true → unstaffed assignments
router.get   ('/workassignments',          workAssignmentsCtrl.getWorkAssignments);
router.post  ('/workassignments',          workAssignmentsCtrl.createWorkAssignment);
router.put   ('/workassignments/:b_id',    workAssignmentsCtrl.updateWorkAssignment);
router.delete('/workassignments/:b_id',    workAssignmentsCtrl.deleteWorkAssignment);

// ── Notifications ─────────────────────────────────────────────────────────────
// ?unread=true → unread only
router.get   ('/notifications',     notificationsCtrl.getNotifications);
router.get   ('/notifications/:id', notificationsCtrl.getNotificationById);
router.post  ('/notifications',     notificationsCtrl.createNotification);
router.put   ('/notifications/:id', notificationsCtrl.updateNotification);
router.delete('/notifications/:id', notificationsCtrl.deleteNotification);

// ── Licenses Obtained ─────────────────────────────────────────────────────────
// ?u_id=N → employee-scoped
router.get   ('/licensesobtained',                           licensesObtainedCtrl.getLicensesObtained);
router.post  ('/licensesobtained',                           licensesObtainedCtrl.createLicenseObtained);
router.delete('/licensesobtained/:u_id/:l_id/:expiryDate',   licensesObtainedCtrl.deleteLicenseObtained);

// ── Tests Taken ───────────────────────────────────────────────────────────────
// ?u_id=N → employee-scoped
router.get   ('/teststaken',                          testsTakenCtrl.getTestsTaken);
router.post  ('/teststaken',                          testsTakenCtrl.createTestTaken);
router.delete('/teststaken/:t_id/:u_id/:testDate',    testsTakenCtrl.deleteTestTaken);

// ── Vehicle Certificates ──────────────────────────────────────────────────────
// ?v_id=N → vehicle-scoped
router.get   ('/vehiclecertificates',                               vehicleCertificatesCtrl.getVehicleCertificates);
router.post  ('/vehiclecertificates',                               vehicleCertificatesCtrl.createVehicleCertificate);
router.delete('/vehiclecertificates/:c_id/:v_id/:dateObtained',     vehicleCertificatesCtrl.deleteVehicleCertificate);

// ── Certificates (lookup) ─────────────────────────────────────────────────────
router.get ('/certificates',     certificatesCtrl.getCertificates);
router.get ('/certificates/:id', certificatesCtrl.getCertificateById);
router.post('/certificates',     certificatesCtrl.createCertificate);

// ── Licenses (lookup) ─────────────────────────────────────────────────────────
router.get ('/licenses',     licensesCtrl.getLicenses);
router.get ('/licenses/:id', licensesCtrl.getLicenseById);
router.post('/licenses',     licensesCtrl.createLicense);

// ── Tests (lookup) ────────────────────────────────────────────────────────────
router.get ('/tests',     testsCtrl.getTests);
router.get ('/tests/:id', testsCtrl.getTestById);
router.post('/tests',     testsCtrl.createTest);

module.exports = router;
