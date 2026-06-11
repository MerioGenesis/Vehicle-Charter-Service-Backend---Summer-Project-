# Vehicle Charter Service – Backend API

Node.js + Express REST API connecting to a MySQL database (XAMPP / phpMyAdmin).

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your XAMPP credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          ← leave blank if no password set in XAMPP
DB_NAME=vcharter
DB_PORT=3306
PORT=5000
```

### 3. Start the server
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
