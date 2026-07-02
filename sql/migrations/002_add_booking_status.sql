-- Adds an explicit pending/confirmed status to bookings. Previously "staffed"
-- vs "unstaffed" was only inferable from whether a work_assignments row
-- existed (see workAssignmentsController.js's AVAILABLE_SELECT). Run this
-- once via phpMyAdmin's SQL tab (or the equivalent script) on an existing
-- database that predates this column.
--
-- Backfill: bookings that already have a work_assignments row are marked
-- confirmed (they're already staffed); everything else defaults to pending.

USE vehiclecharter;

ALTER TABLE bookings
  ADD COLUMN b_status ENUM('pending','confirmed') NOT NULL DEFAULT 'pending' AFTER b_timeStart;

UPDATE bookings b
SET b_status = 'confirmed'
WHERE EXISTS (SELECT 1 FROM work_assignments wa WHERE wa.wa_b_id = b.b_id);
