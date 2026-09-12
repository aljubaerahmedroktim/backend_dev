const prisma = require("../lib/prisma.js");
const AppError = require("../utils/appError.js");

const createPost = async ({ body, userId, file }) => {
  const data = {
    title: body.title,
    content: body.content,
    published: body.published ?? false,
    authorId: userId,
  };

  if (file) {
    data.imageUrl = `/uploads/images/${file.filename}`;
  }

  const post = await prisma.post.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return post;
};

const getPosts = async (query) => {
  const { page, limit, search, sort } = query;

  const skip = (page - 1) * limit;

  const where = {
    published: true,
  };

  // Searching
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Sorting
  let orderBy;

  if (sort === "oldest") {
    orderBy = {
      createdAt: "asc",
    };
  } else if (sort === "title") {
    orderBy = {
      title: "asc",
    };
  } else {
    orderBy = {
      createdAt: "desc",
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.post.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getPostById = async (postId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,

      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return post;
};

const updatePost = async (postId, userId, data) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== userId) {
    throw new AppError("You are not allowed to update this post.", 403);
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data,
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      updatedAt: true,
    },
  });

  return result;
};

const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== userId) {
    throw new AppError("You are not allowed to delete this post", 403);
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return true;
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
