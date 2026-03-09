import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  school: z.enum(["AMOS", "CMH", "EIDM", "ESDAC", "ENAAI"]).optional().nullable(),
  educationLevel: z.enum(["Bac+3", "Bac+4", "Bac+5"]).optional().nullable(),
  graduationYear: z
    .number()
    .int()
    .min(2020, "Année invalide")
    .max(2035, "Année invalide")
    .optional()
    .nullable(),
  specialization: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  })

export const preferencesSchema = z.object({
  newJobMatches: z.boolean(),
  applicationUpdates: z.boolean(),
  weeklyNewsletter: z.boolean(),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type PreferencesInput = z.infer<typeof preferencesSchema>
