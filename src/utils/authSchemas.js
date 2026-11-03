import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.");

const passwordSchema = z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password is too long.");

const phoneSchema = z
    .string()
    .trim()
    .regex(
        /^(\+?234|0)?[789][01]\d{8}$/,
        "Enter a valid Nigerian phone number.",
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
    .object({
        full_name: z
            .string()
            .trim()
            .min(2, "Enter your full name.")
            .max(120, "Name is too long."),
        email: emailSchema,
        phone: phoneSchema,
        password: passwordSchema,
        confirm_password: z.string().min(1, "Confirm your password."),
    })
    .refine(
        (data) => data.password === data.confirm_password,
        {
            message: "Passwords do not match.",
            path: ["confirm_password"],
        },
    );

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirm_password: z.string().min(1, "Confirm your password."),
    })
    .refine(
        (data) => data.password === data.confirm_password,
        {
            message: "Passwords do not match.",
            path: ["confirm_password"],
        },
    );

export const profileSchema = z.object({
    first_name: z.string().trim().min(1, "First name is required."),
    last_name: z.string().trim().min(1, "Last name is required."),
    email: emailSchema,
    phone: phoneSchema,
});

export const changePasswordSchema = z
    .object({
        current_password: z
            .string()
            .min(1, "Enter your current password."),
        new_password: passwordSchema,
        confirm_password: z.string().min(1, "Confirm your new password."),
    })
    .refine(
        (data) => data.new_password === data.confirm_password,
        {
            message: "New passwords do not match.",
            path: ["confirm_password"],
        },
    );


export const addressSchema = z.object({
    full_name: z.string().trim().min(2, "Enter the recipient's full name."),
    phone: phoneSchema,
    address_line_1: z.string().trim().min(5, "Enter a complete street address."),
    address_line_2: z.string().trim().optional(),
    city: z.string().trim().min(2, "Enter a city or town."),
    state: z.string().trim().min(1, "Select a state."),
    postcode: z.string().trim().optional(),
    country: z.string().default("Nigeria"),
    is_default: z.boolean().default(false),
});

export const deleteAccountSchema = z.object({
    current_password: z.string().min(1, "Enter your current password."),
    confirmation: z
        .string()
        .refine((value) => value === "DELETE", {
            message: 'Type DELETE to confirm account deletion.',
        }),
});