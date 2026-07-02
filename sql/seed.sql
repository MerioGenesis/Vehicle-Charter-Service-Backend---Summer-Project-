-- Vehicle Charter Service — Sample Data
-- Run after schema.sql on a fresh database. If you're working against the
-- existing `vehiclecharter` database exported from phpMyAdmin, you already
-- have real data and can skip this file.
--
-- All seeded users share the password "Password123!" (bcrypt-hashed below) so
-- you can log in and test the app immediately.

USE vehiclecharter;

INSERT INTO usertypes (ut_name) VALUES ('Customer'), ('Employee'), ('Admin');

INSERT INTO vehicle_types (vt_name) VALUES ('Car'), ('Coach'), ('Boat');

INSERT INTO users (u_f_name, u_l_name, u_gender, u_dob, u_address, u_city, u_postcode, u_email, u_phone, u_password, u_ut_id) VALUES
('Alice',   'Smith', 'Female', '1985-06-15', '123 Oak Rd',    'London',     'SW1A 0A', 'alice.s@example.co.uk',   '0770090001', '$2b$10$li4WYVZw/QDJzrhPE2HZGewjzVbryIj.x9xyAFrOit4DDrYV9jxSu', 1),
('Charlie', 'Brown', 'Other',  '2001-03-01', '789 Maple Ave', 'Birmingham', 'B1 1BB',  'charlie.b@example.co.uk', '0770090002', '$2b$10$li4WYVZw/QDJzrhPE2HZGewjzVbryIj.x9xyAFrOit4DDrYV9jxSu', 1),
('Alan',    'Baker', 'Male',   '1990-09-20', '4 Elm St',      'Leeds',      'LS1 1AA', 'alan.b@example.co.uk',    '0770090003', '$2b$10$li4WYVZw/QDJzrhPE2HZGewjzVbryIj.x9xyAFrOit4DDrYV9jxSu', 2),
('Sara',    'Scott', 'Female', '1988-12-05', '9 Pine Cl',     'Bristol',    'BS1 1AA', 'sara.s@example.co.uk',    '0770090004', '$2b$10$li4WYVZw/QDJzrhPE2HZGewjzVbryIj.x9xyAFrOit4DDrYV9jxSu', 2),
('Grace',   'Hall',  'Female', '1979-04-11', '2 Elgar Way',   'Kingston',   'KT1 1AA', 'grace.h@example.co.uk',   '0770090005', '$2b$10$li4WYVZw/QDJzrhPE2HZGewjzVbryIj.x9xyAFrOit4DDrYV9jxSu', 3);

INSERT INTO vehicles (v_name, v_brand, v_seatsNo, v_year, v_plate, v_vt_id) VALUES
('Fiesta',   'Ford',     5,  '2026-01-01', 'FI26 STA', 1),
('3 Series', 'BMW',      5,  '2017-01-01', 'BM17 KLM', 1),
('XC40',     'Volvo',    5,  '2021-01-01', 'VO21 XCF', 1),
('Tourismo', 'Mercedes', 45, '2019-01-01', 'ME19 TOU', 2),
('Princess', 'Sunseeker',12, '2015-01-01', 'SS15 PRI', 3);

INSERT INTO bookings (b_pickupLocation, b_destination, b_dateFrom, b_timeStart, b_u_id, b_v_id) VALUES
('London Victoria',  'Glasgow Central', '2026-11-11', '20:37:00', 1, 3),
('Birmingham New St', '',               '2026-08-01', '09:00:00', 2, 1);

-- Booking 1 has been staffed; booking 2 is still "available" (no matching row).
INSERT INTO work_assignments (wa_b_id, wa_u_id, wa_startTime) VALUES
(1, 3, '20:00:00');

INSERT INTO notifications (n_status, n_b_id) VALUES
(0, 1),
(0, 2);

INSERT INTO reviews (r_content, r_rating, r_u_id) VALUES
('Smooth trip, very comfortable vehicle.', 5, 1),
('Driver was a little late but overall fine.', 3, 2);

INSERT INTO certificates (c_name) VALUES ('MOT'), ('Insurance'), ('Roadworthiness');

INSERT INTO vehicle_certificates (vc_c_id, vc_v_id, vc_dateObtained) VALUES
(1, 1, '2026-01-10'),
(2, 1, '2026-01-10');

INSERT INTO licenses (l_name) VALUES ('Category B'), ('Category D'), ('Category D1');

INSERT INTO licenses_obtained (lo_u_id, lo_l_id, lo_expiryDate) VALUES
(3, 1, '2028-06-01'),
(4, 2, '2027-09-15');

INSERT INTO tests (t_name) VALUES ('Eyesight'), ('Medical');

INSERT INTO tests_taken (tt_t_id, tt_u_id, tt_testDate, tt_result) VALUES
(1, 3, '2026-05-01', 'Pass'),
(2, 4, '2026-05-02', 'Pass');
