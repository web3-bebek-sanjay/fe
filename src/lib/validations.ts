import { z } from 'zod';

// IP Registration Schema
export const ipRegistrationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),

  category: z.string().min(1, 'Category is required'),

  tag: z
    .string()
    .min(1, 'Tag is required')
    .max(50, 'Tag must not exceed 50 characters'),

  fileUpload: z
    .string()
    .min(1, 'File upload is required')
    .url('Invalid file URL'),

  licenseopt: z
    .number()
    .int()
    .min(0, 'Invalid license option')
    .max(4, 'Invalid license option'),

  basePrice: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Base price must be a valid positive number'),

  rentPrice: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Rent price must be a valid positive number'),

  royaltyPercentage: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Royalty percentage must be between 0 and 100'),
});

// Remix Registration Schema
export const remixRegistrationSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),

  category: z.string().min(1, 'Category is required'),

  fileUpload: z
    .string()
    .min(1, 'File upload is required')
    .url('Invalid file URL'),

  parentIPId: z.string().min(1, 'Parent IP selection is required'),
});

// License Purchase Schema
export const licensePurchaseSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),

  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a valid positive number'),
});

// Rental Schema
export const rentalSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),

  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a valid positive number'),

  duration: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
});

// Royalty Deposit Schema
export const royaltyDepositSchema = z.object({
  remixTokenId: z.string().min(1, 'Remix Token ID is required'),

  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Amount must be a valid positive number'),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query must not exceed 100 characters'),

  category: z.string().optional(),

  minPrice: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Minimum price must be a valid positive number'),

  maxPrice: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Maximum price must be a valid positive number'),
});

// Type exports
export type IPRegistrationInput = z.infer<typeof ipRegistrationSchema>;
export type RemixRegistrationInput = z.infer<typeof remixRegistrationSchema>;
export type LicensePurchaseInput = z.infer<typeof licensePurchaseSchema>;
export type RentalInput = z.infer<typeof rentalSchema>;
export type RoyaltyDepositInput = z.infer<typeof royaltyDepositSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
