import { z } from 'zod';

export const CURRENCIES = ['EUR', 'USD', 'TRY', 'GBP'];

export const EXPENSE_CATEGORIES = [
  'Transportation',
  'Entertainment',
  'Activities',
  'Insurance',
  'Tips & Gratuities',
  'Equipment Rental',
  'Photography',
  'Shopping',
  'Communication',
  'Other',
];

export const extraExpenseSchema = z.object({
  supplier_id: z.number().int().positive().optional(),
  expense_name: z
    .string()
    .min(2, 'Expense name must be at least 2 characters')
    .max(255, 'Expense name is too long'),
  expense_category: z.string().max(100, 'Category is too long').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase()
    .optional()
    .default('EUR'),
  description: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type ExtraExpenseFormData = z.infer<typeof extraExpenseSchema>;

export const defaultExtraExpenseValues: Partial<ExtraExpenseFormData> = {
  expense_name: '',
  expense_category: '',
  description: '',
  currency: 'EUR',
  notes: '',
  is_active: true,
};
