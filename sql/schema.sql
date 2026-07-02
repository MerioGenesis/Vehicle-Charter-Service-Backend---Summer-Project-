-- Vehicle Charter Service — Database Schema
-- Mirrors the live phpMyAdmin export of the `vehiclecharter` database
-- (structure only — no data; see sql/seed.sql for sample rows).
--
-- Table/column names, sizes and cascade rules here match what is already
-- running in XAMPP/phpMyAdmin, which takes precedence over the Data Model
-- Specification appendix where the two differ. Known differences from the
-- appendix, carried over deliberately from the live database:
--   - Table names are lower_snake_case (bookings, usertypes, vehicle_types, ...)
--     rather than the PascalCase/underscore mix shown in the diagrams. MySQL on
--     Windows (XAMPP) treats table names case-insensitively, so this does not
--     require any changes to the existing controllers.
--   - Bookings includes b_pickupLocation/b_destination as VARCHAR(100) NOT NULL
--     (empty string allowed), matching production data.
--   - users.u_dob and vehicles.v_year are DATETIME, not DATE.
--   - Most foreign keys cascade on delete/update (e.g. deleting a user deletes
--     their bookings/reviews/licenses), which lines up with the "right to
--     erasure" requirement in section 6 (Data Protection) of the Data Model doc.
--   - vehicle_types.vt_name has no UNIQUE constraint in production, unlike the
--     appendix.
--   - work_assignments keeps its composite PRIMARY KEY (wa_b_id, wa_u_id), both
--     NOT NULL — a booking only gets a row here once an employee is actually
--     assigned. "Unstaffed" bookings are therefore bookings with NO matching
--     work_assignments row (see workAssignmentsController.js), not a row with
--     a NULL wa_u_id.
--   - users.u_password was added after the appendix was written, to support
--     login (see authController.js / usersController.js). On the live database
--     it was added via sql/migrations/001_add_user_password.sql as NULLable,
--     since existing rows predate authentication; here, for fresh installs, it
--     is declared NOT NULL since every new registration must set one.

CREATE DATABASE IF NOT EXISTS vehiclecharter
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE vehiclecharter;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS tests_taken;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS licenses_obtained;
DROP TABLE IF EXISTS licenses;
DROP TABLE IF EXISTS vehicle_certificates;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS work_assignments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS vehicle_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS usertypes;

SET FOREIGN_KEY_CHECKS = 1;

-- ── usertypes ────────────────────────────────────────────────────────────────
CREATE TABLE usertypes (
  ut_id   INT(1) NOT NULL AUTO_INCREMENT,
  ut_name VARCHAR(15) NOT NULL,
  PRIMARY KEY (ut_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  u_id       INT(6) NOT NULL AUTO_INCREMENT,
  u_f_name   VARCHAR(30) NOT NULL,
  u_l_name   VARCHAR(30) NOT NULL,
  u_gender   ENUM('Male','Female','Other') NOT NULL,
  u_dob      DATETIME NOT NULL,
  u_address  VARCHAR(50) NOT NULL,
  u_city     VARCHAR(20) NOT NULL,
  u_postcode VARCHAR(7) NOT NULL,
  u_email    VARCHAR(50) NOT NULL,
  u_phone    VARCHAR(10) NOT NULL,
  u_password VARCHAR(255) NOT NULL,
  u_ut_id    INT(1) NOT NULL,
  PRIMARY KEY (u_id),
  UNIQUE KEY c_email (u_email),
  KEY ut_userTypeId (u_ut_id),
  CONSTRAINT users_ibfk_1 FOREIGN KEY (u_ut_id) REFERENCES usertypes (ut_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── vehicle_types ────────────────────────────────────────────────────────────
CREATE TABLE vehicle_types (
  vt_id   INT(6) NOT NULL AUTO_INCREMENT,
  vt_name VARCHAR(10) NOT NULL,
  PRIMARY KEY (vt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── vehicles ─────────────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  v_id       INT(6) NOT NULL AUTO_INCREMENT,
  v_name     VARCHAR(20) NOT NULL,
  v_brand    VARCHAR(15) NOT NULL,
  v_seatsNo  INT(3) NOT NULL,
  v_year     DATETIME NOT NULL,
  v_plate    VARCHAR(10) NOT NULL,
  v_imageURL VARCHAR(250) NOT NULL DEFAULT 'https://img.freepik.com/free-vector/students-bus-retro-icon_24877-83822.jpg',
  v_vt_id    INT(6) NOT NULL,
  PRIMARY KEY (v_id),
  KEY vehicles_ibfk_1 (v_vt_id),
  CONSTRAINT vehicles_ibfk_1 FOREIGN KEY (v_vt_id) REFERENCES vehicle_types (vt_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  b_id               INT(6) NOT NULL AUTO_INCREMENT,
  b_pickupLocation   VARCHAR(100) NOT NULL,
  b_destination      VARCHAR(100) NOT NULL,
  b_dateFrom         DATE NOT NULL,
  b_timeStart        TIME NOT NULL,
  b_bookingTimestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  b_u_id             INT(6) NOT NULL,
  b_v_id             INT(6) NOT NULL,
  PRIMARY KEY (b_id),
  KEY b_u_id (b_u_id),
  KEY b_v_id (b_v_id),
  CONSTRAINT bookings_ibfk_1 FOREIGN KEY (b_u_id) REFERENCES users (u_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT bookings_ibfk_2 FOREIGN KEY (b_v_id) REFERENCES vehicles (v_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── work_assignments ─────────────────────────────────────────────────────────
-- A booking only gets a row here once an employee is assigned (see header note).
CREATE TABLE work_assignments (
  wa_b_id      INT(6) NOT NULL,
  wa_u_id      INT(6) NOT NULL,
  wa_startTime TIME NOT NULL,
  PRIMARY KEY (wa_b_id, wa_u_id),
  KEY wa_u_id (wa_u_id),
  CONSTRAINT work_assignments_ibfk_1 FOREIGN KEY (wa_u_id) REFERENCES users (u_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT work_assignments_ibfk_2 FOREIGN KEY (wa_b_id) REFERENCES bookings (b_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── notifications ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  n_id        INT(6) NOT NULL AUTO_INCREMENT,
  n_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  n_status    TINYINT(1) NOT NULL,
  n_b_id      INT(6) NOT NULL,
  PRIMARY KEY (n_id),
  KEY n_u_id (n_b_id),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (n_b_id) REFERENCES bookings (b_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  r_id        INT(6) NOT NULL AUTO_INCREMENT,
  r_content   VARCHAR(1000) NOT NULL,
  r_rating    TINYINT(3) UNSIGNED NOT NULL CHECK (r_rating BETWEEN 1 AND 5),
  r_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  r_u_id      INT(6) NOT NULL,
  PRIMARY KEY (r_id),
  KEY r_u_id (r_u_id),
  CONSTRAINT reviews_ibfk_1 FOREIGN KEY (r_u_id) REFERENCES users (u_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── certificates ─────────────────────────────────────────────────────────────
CREATE TABLE certificates (
  c_id   INT(6) NOT NULL AUTO_INCREMENT,
  c_name VARCHAR(20) NOT NULL,
  PRIMARY KEY (c_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── vehicle_certificates ─────────────────────────────────────────────────────
CREATE TABLE vehicle_certificates (
  vc_c_id         INT(6) NOT NULL,
  vc_v_id         INT(6) NOT NULL,
  vc_dateObtained DATE NOT NULL,
  PRIMARY KEY (vc_c_id, vc_v_id, vc_dateObtained),
  KEY vc_v_id (vc_v_id),
  CONSTRAINT vehicle_certificates_ibfk_1 FOREIGN KEY (vc_v_id) REFERENCES vehicles (v_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT vehicle_certificates_ibfk_2 FOREIGN KEY (vc_c_id) REFERENCES certificates (c_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── licenses ─────────────────────────────────────────────────────────────────
CREATE TABLE licenses (
  l_id   INT(6) NOT NULL AUTO_INCREMENT,
  l_name VARCHAR(20) NOT NULL,
  PRIMARY KEY (l_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── licenses_obtained ────────────────────────────────────────────────────────
CREATE TABLE licenses_obtained (
  lo_u_id       INT(6) NOT NULL,
  lo_l_id       INT(6) NOT NULL,
  lo_expiryDate DATE NOT NULL,
  PRIMARY KEY (lo_u_id, lo_l_id, lo_expiryDate),
  KEY lo_l_id (lo_l_id),
  CONSTRAINT licenses_obtained_ibfk_1 FOREIGN KEY (lo_u_id) REFERENCES users (u_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT licenses_obtained_ibfk_2 FOREIGN KEY (lo_l_id) REFERENCES licenses (l_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── tests ────────────────────────────────────────────────────────────────────
CREATE TABLE tests (
  t_id   INT(6) NOT NULL AUTO_INCREMENT,
  t_name VARCHAR(20) NOT NULL,
  PRIMARY KEY (t_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── tests_taken ──────────────────────────────────────────────────────────────
CREATE TABLE tests_taken (
  tt_t_id     INT(6) NOT NULL,
  tt_u_id     INT(6) NOT NULL,
  tt_testDate DATE NOT NULL,
  tt_result   VARCHAR(10) NOT NULL,
  PRIMARY KEY (tt_t_id, tt_u_id, tt_testDate),
  KEY tt_u_id (tt_u_id),
  CONSTRAINT tests_taken_ibfk_1 FOREIGN KEY (tt_u_id) REFERENCES users (u_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT tests_taken_ibfk_2 FOREIGN KEY (tt_t_id) REFERENCES tests (t_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
