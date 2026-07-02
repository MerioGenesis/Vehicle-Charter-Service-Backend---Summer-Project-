-- Adds password storage to the existing live `vehiclecharter` database so
-- users can authenticate. Run this once via phpMyAdmin's SQL tab.
--
-- Nullable rather than NOT NULL: the ~98 existing user rows have no password
-- (they predate authentication). They simply cannot log in until an admin
-- sets one or they re-register; new registrations always provide one
-- (enforced in usersController.js, not at the database level).

USE vehiclecharter;

ALTER TABLE users
  ADD COLUMN u_password VARCHAR(255) NULL AFTER u_phone;
