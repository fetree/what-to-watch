import { z } from "zod";
export const CreateUserRequestSchema = z.object({
    email: z.string().email(),
});
export const UserResponseSchema = z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
});
//# sourceMappingURL=user.js.map