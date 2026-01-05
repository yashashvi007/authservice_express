import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    trim: true,
    notEmpty: true,
    errorMessage: 'First name is required',
  },
  lastName: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Last name is required',
  },
  email: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Email is required',
    isEmail: {
      errorMessage: 'Invalid email address',
    },
  },
  role: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Role is required',
  },
});
