const { z } = require("zod");

const createPostSchema = z
  .object({
    title: z.string().min(3).max(150),
    content: z.string().min(10),
    imageUrl: z.string().optional(),
    published: z.coerce.boolean().optional(),
  })
  .strict();

const updatePostSchema = z
  .object({
    title: z.string().min(3).max(150).optional(),
    content: z.string().min(10).optional(),
    published: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const getPostQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["latest", "oldest", "title"]).default("latest"),
});

module.exports = { createPostSchema, updatePostSchema, getPostQuerySchema };
