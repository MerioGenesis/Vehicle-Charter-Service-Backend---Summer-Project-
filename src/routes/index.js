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
const authCtrl                 = require('../controllers/authController');
const {
  requireAuth, optionalAuth, requireRole, requireSelfOrRole, requireBookingOwnerOrAdmin,
} = require('../middleware/auth');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/login',         authCtrl.login);
router.post('/auth/context-login', authCtrl.contextLogin);

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
// GET /users uses optionalAuth (not requireAuth): the login screen's "pick who
// you are" dropdown calls this before the caller has a token — see the
// PUBLIC_USER_SELECT projection in usersController.getUsers.
router.get   ('/users',     optionalAuth,                                 usersCtrl.getUsers);
router.get   ('/users/:id', requireAuth, requireSelfOrRole('id', 'Admin'), usersCtrl.getUserById);
router.post  ('/users',     optionalAuth,                                 usersCtrl.createUser);
router.put   ('/users/:id', requireAuth, requireSelfOrRole('id', 'Admin'), usersCtrl.updateUser);
router.delete('/users/:id', requireAuth, requireRole('Admin'),            usersCtrl.deleteUser);

// ── User Types (read-only) ────────────────────────────────────────────────────
router.get('/usertypes',     userTypesCtrl.getUserTypes);
router.get('/usertypes/:id', userTypesCtrl.getUserTypeById);

// ── Bookings (no guest access — always requires a token) ─────────────────────
router.get   ('/bookings',     requireAuth,                                   bookingsCtrl.getBookings);
router.get   ('/bookings/:id', requireAuth, requireBookingOwnerOrAdmin('id'), bookingsCtrl.getBookingById);
router.post  ('/bookings',     requireAuth,                                   bookingsCtrl.createBooking);
router.put   ('/bookings/:id', requireAuth, requireBookingOwnerOrAdmin('id'), bookingsCtrl.updateBooking);
router.delete('/bookings/:id', requireAuth, requireBookingOwnerOrAdmin('id'), bookingsCtrl.deleteBooking);

// ── Reviews ───────────────────────────────────────────────────────────────────
// GET stays PUBLIC — guests can browse reviews (see landing page / sitemap).
// Only creating/editing a review requires being signed in.
router.get   ('/reviews',     reviewsCtrl.getReviews);
router.get   ('/reviews/:id', reviewsCtrl.getReviewById);
router.post  ('/reviews',     requireAuth,                       reviewsCtrl.createReview);
router.put   ('/reviews/:id', requireAuth, requireRole('Admin'), reviewsCtrl.updateReview);
router.delete('/reviews/:id', requireAuth, requireRole('Admin'), reviewsCtrl.deleteReview);

// ── Work Assignments ──────────────────────────────────────────────────────────
// ?u_id=N → employee's assignments | ?available=true → unstaffed assignments
router.get   ('/workassignments',          workAssignmentsCtrl.getWorkAssignments);
router.post  ('/workassignments',          workAssignmentsCtrl.createWorkAssignment);
router.put   ('/workassignments/:b_id',    workAssignmentsCtrl.updateWorkAssignment);
router.delete('/workassignments/:b_id',    workAssignmentsCtrl.deleteWorkAssignment);

// ── Notifications (no guest access — always requires a token) ────────────────
// ?unread=true, ?u_id=N → "my notifications"
router.get   ('/notifications',     requireAuth,                                  notificationsCtrl.getNotifications);
router.get   ('/notifications/:id', requireAuth,                                  notificationsCtrl.getNotificationById);
router.post  ('/notifications',     requireAuth, requireRole('Employee', 'Admin'), notificationsCtrl.createNotification);
router.put   ('/notifications/:id', requireAuth,                                  notificationsCtrl.updateNotification);
router.delete('/notifications/:id', requireAuth, requireRole('Admin'),            notificationsCtrl.deleteNotification);

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
