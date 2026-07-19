import { z } from 'zod';

export const odRequestSchema = z
  .object({
    dateType: z.enum(['SINGLE', 'MULTIPLE']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z
      .string()
      .min(10, 'Please provide a detailed description (min 10 characters)')
      .max(500, 'Description cannot exceed 500 characters'),
    facultyInCharge: z
      .string()
      .min(3, 'Faculty in charge name is required (min 3 characters)'),
    odType: z.enum([
      'Applied Lab',
      'Individual',
      'Symposium',
      'Sports',
      'Workshop',
      'Industrial Visit',
      'Other',
    ]),
    proofDocumentUrl: z
      .string()
      .url('Must be a valid URL link (e.g. Google Drive link)')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.dateType === 'MULTIPLE') {
        return !!data.endDate && new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date for multiple days OD',
      path: ['endDate'],
    }
  );

export type ODRequestFormData = z.infer<typeof odRequestSchema>;

export const rejectionReasonSchema = z.object({
  reason: z
    .string()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(300, 'Reason cannot exceed 300 characters'),
});

export type RejectionReasonFormData = z.infer<typeof rejectionReasonSchema>;

export const userManagementSchema = z.object({
  role: z.enum([
    'STUDENT',
    'MENTOR',
    'HOD',
    'PRINCIPAL',
    'ACADEMIC_COORDINATOR',
    'SUPER_ADMIN',
  ]),
  department: z.enum(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI_DS']),
  mentorUid: z.string().optional(),
});

export type UserManagementFormData = z.infer<typeof userManagementSchema>;
