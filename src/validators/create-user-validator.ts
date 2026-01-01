import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    errorMessage: 'First name is required',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'Last name is required',
    notEmpty: true,
    trim: true,
  },
  email: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Email is required',
    isEmail: {
      errorMessage: 'Invalid email address',
    },
  },
  password: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Password is required',
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
  },
  role: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Role is required',
  },
});
