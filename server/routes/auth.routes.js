import express from 'express';
import { register, login, demoLogin, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

export default router;
