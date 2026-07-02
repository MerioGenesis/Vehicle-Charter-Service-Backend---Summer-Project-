# Vehicle Charter Service – Backend API

Node.js + Express REST API connecting to a MySQL database (XAMPP / phpMyAdmin).

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create the database
If you already have the `vehiclecharter` database set up in phpMyAdmin (with
real data), skip this step — the app will connect to it directly.

Otherwise, with XAMPP's Apache and MySQL modules running, open phpMyAdmin
(`http://localhost/phpmyadmin`) and import the schema:

- **Import** tab → choose `sql/schema.sql` → Go. This creates the
  `vehiclecharter` database and all 14 tables, matching the live schema.
- Optionally import `sql/seed.sql` afterwards for sample data that exercises
  every endpoint below.

### 3. Configure environment
Copy `.env.example` to `.env` and fill in your XAMPP credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          ← leave blank if no password set in XAMPP
DB_NAME=vehiclecharter
DB_PORT=3306
PORT=5000
```

### 4. Start the server
```bash
npm start          # production
npm run dev        # with nodemon (auto-restart on file changes)
```
Install nodemon if needed: `npm install -g nodemon`

---

## Base URL
```
http://localhost:5000/api/vcharter
```

---

## Endpoint Reference

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | All vehicles (supports `?limit=N&page=N&vt_id=N`) |
| GET | `/vehicles/:id` | Single vehicle |
| POST | `/vehicles` | Create vehicle |
| PUT | `/vehicles/:id` | Update vehicle (partial) |
| DELETE | `/vehicles/:id` | Delete vehicle |

**Response shape (with FK resolved):**
```json
{ "v_id", "v_name", "v_brand", "v_seatsNo", "v_year", "v_plate", "v_imageURL", "v_vt_id", "vehicleType" }
```

---

### Vehicle Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicletypes` | All vehicle types |
| GET | `/vehicletypes/:id` | Single vehicle type |

---

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | All users (supports `?limit=N&page=N`) |
| GET | `/users/:id` | Single user |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user (partial) |
| DELETE | `/users/:id` | Delete user |

**Response shape (with FK resolved):**
```json
{ "u_id", "u_f_name", "u_l_name", "u_gender", "u_dob", "u_address", "u_city", "u_postcode", "u_email", "u_phone", "u_ut_id", "userType" }
```

---

### User Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/usertypes` | All user types |
| GET | `/usertypes/:id` | Single user type |

---

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | All bookings; add `?u_id=N` for customer-scoped |
| GET | `/bookings/:id` | Single booking |
| POST | `/bookings` | Create booking |
| PUT | `/bookings/:id` | Update booking (partial) |
| DELETE | `/bookings/:id` | Delete booking |

**Response shape (multi-join):**
```json
{ "b_id", "b_pickUpLocation", "b_destination", "b_dateFrom", "b_timeStart", "b_bookingTimestamp", "u_f_name", "u_l_name", "v_name", "v_brand", "vt_name" }
```

---

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews` | All reviews (supports `?limit=N&page=N`) |
| GET | `/reviews/:id` | Single review |
| POST | `/reviews` | Create review |
| PUT | `/reviews/:id` | Update review |
| DELETE | `/reviews/:id` | Delete review |

---

### Work Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workassignments` | All; `?u_id=N` employee-scoped, `?available=true` unstaffed |
| POST | `/workassignments` | Create assignment |
| PUT | `/workassignments/:b_id` | Assign employee / update start time |
| DELETE | `/workassignments/:b_id` | Remove assignment |

---

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | All; `?unread=true` for unread only |
| GET | `/notifications/:id` | Single notification |
| POST | `/notifications` | Create notification |
| PUT | `/notifications/:id` | Mark read/unread (`n_status`) |
| DELETE | `/notifications/:id` | Delete notification |

---

### Licenses Obtained (employee licenses)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/licensesobtained` | All; `?u_id=N` employee-scoped |
| POST | `/licensesobtained` | Add license record |
| DELETE | `/licensesobtained/:u_id/:l_id/:expiryDate` | Remove license record |

---

### Tests Taken (employee health tests)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teststaken` | All; `?u_id=N` employee-scoped |
| POST | `/teststaken` | Record test result |
| DELETE | `/teststaken/:t_id/:u_id/:testDate` | Remove test record |

---

### Vehicle Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehiclecertificates` | All; `?v_id=N` vehicle-scoped |
| POST | `/vehiclecertificates` | Add certificate |
| DELETE | `/vehiclecertificates/:c_id/:v_id/:dateObtained` | Remove certificate |

---

### Certificates, Licenses, Tests (lookup/reference tables)
These back the `Vehicle_Certificates`, `Licenses_Obtained` and `Tests_Taken`
join tables above (e.g. so an admin can add a new certificate/license/test
type before assigning it to a vehicle or employee).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/certificates` | All certificate types |
| GET | `/certificates/:id` | Single certificate type |
| POST | `/certificates` | Add certificate type |
| GET | `/licenses` | All license types |
| GET | `/licenses/:id` | Single license type |
| POST | `/licenses` | Add license type |
| GET | `/tests` | All test types |
| GET | `/tests/:id` | Single test type |
| POST | `/tests` | Add test type |

---

## Pagination
Supported on: `/vehicles`, `/users`, `/bookings`, `/reviews`
```
GET /api/vcharter/vehicles?limit=10&page=2
```

## Filtering
- `/vehicles?vt_id=1` — cars only
- `/bookings?u_id=25` — bookings for a specific customer
- `/workassignments?available=true` — unstaffed assignments
- `/notifications?unread=true` — unread notifications

---

## Deviations from the Data Model Specification Document

`sql/schema.sql` matches Appendix A/B exactly, with two documented exceptions:

1. **`Bookings.b_destination`** is included even though Appendix B's data
   dictionary omits it. The Endpoint Specification's validation tests
   (Appendix A, Figure A.1) both send and return this field, and the existing
   `bookingsController.js` already relies on it — so it was kept rather than
   stripped, to avoid breaking working code.
2. **`Work_Assignments`** uses `wa_b_id` as the sole `PRIMARY KEY`, rather
   than the documented composite `(wa_b_id, wa_u_id)`. MySQL does not allow a
   `NULL` value inside a primary key, but the "unstaffed assignment" feature
   (`GET /workassignments?available=true`, Appendix C Figure C.6) depends on
   `wa_u_id` being `NULL` until an employee is assigned. `wa_u_id` is kept as
   a nullable, indexed foreign key instead.

Worth noting in the write-up if asked to justify the implementation against
the design documents.
