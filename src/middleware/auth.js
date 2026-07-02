const jwt  = require('jsonwebtoken');
const pool = require('../db/pool');

// "Authorization: Bearer <token>" -> req.user = { u_id, u_ut_id, ut_name }; else 401.
const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { u_id: payload.u_id, u_ut_id: payload.u_ut_id, ut_name: payload.ut_name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Populates req.user if a valid token is present; never rejects. Used where a
// route must behave differently for anonymous vs authenticated callers (e.g.
// registration) rather than requiring a token outright.
const optionalAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { u_id: payload.u_id, u_ut_id: payload.u_ut_id, ut_name: payload.ut_name };
    } catch (err) {
      // Invalid/expired token on an optional route: proceed as anonymous.
    }
  }
  next();
};

// Must run after requireAuth. 403 unless req.user's role is in the allow-list.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.ut_name)) {
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  }
  next();
};

// Must run after requireAuth. Allows the request if req.user is the resource
// identified by req.params[paramName], or has one of the given roles.
const requireSelfOrRole = (paramName, ...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.u_id === parseInt(req.params[paramName], 10)) return next();
  if (roles.includes(req.user.ut_name)) return next();
  return res.status(403).json({ error: 'Forbidden: not your account' });
};

// Must run after requireAuth. Looks up the booking's owner and allows the
// request if req.user owns it or is an Admin; attaches req.booking either way
// so the controller doesn't need a second lookup.
const requireBookingOwnerOrAdmin = (paramName = 'id') => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const [rows] = await pool.query(
      'SELECT b_id, b_u_id FROM Bookings WHERE b_id = ?',
      [req.params[paramName]]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    if (req.user.ut_name === 'Admin' || rows[0].b_u_id === req.user.u_id) {
      req.booking = rows[0];
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: not your booking' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireAuth, optionalAuth, requireRole, requireSelfOrRole, requireBookingOwnerOrAdmin };
