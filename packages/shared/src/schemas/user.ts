import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
});

export const UserResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
