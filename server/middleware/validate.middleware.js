import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Claims Adjuster', 'Medical Auditor', 'Administrator']).optional(),
  organization: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Verified', 'Flagged', 'Rejected']),
  reviewNotes: z.string().optional(),
});

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Malformed request payload',
    });
  }
};
