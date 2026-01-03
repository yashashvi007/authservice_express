import { checkSchema } from 'express-validator';

export default checkSchema(
  {
    q: {
      trim: true,
      customSanitizer: {
        options: (value) => {
          return value ? (value as string) : '';
        },
      },
    },
    role: {
      customSanitizer: {
        options: (value) => {
          return value ? (value as string) : '';
        },
      },
    },
    currentPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },
    perPage: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value);
          return isNaN(parsedValue) ? 6 : parsedValue;
        },
      },
    },
  },
  ['query'],
);
