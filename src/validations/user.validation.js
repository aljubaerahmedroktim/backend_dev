const { z } = require("zod");

const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at lear 2 characters!")
      .max(50, "Name cannot exceed 50 characters!")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

module.exports = { updateProfileSchema };
