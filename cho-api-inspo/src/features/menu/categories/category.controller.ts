import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildUniqueSlug(name: string, ignoreId?: bigint) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.category.findFirst({
      where: {
        slug,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function serializeCategory(category: {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    ...category,
    id: category.id.toString(),
  };
}

// 1. Get All Categories
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { isActive } = req.query;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
      },
    });

    // Convert BigInt to string for JSON serialization
    const categoriesResponse = categories.map((category) => ({
      ...category,
      id: category.id.toString(),
    }));

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories: categoriesResponse,
      },
    });
  },
);

// 3. Create Category
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, isActive } = req.body ?? {};
  const trimmedName = typeof name === "string" ? name.trim() : "";

  if (!trimmedName) {
    res.status(400).json({
      success: false,
      message: "Category name is required",
    });
    return;
  }

  const existing = await prisma.category.findUnique({
    where: { name: trimmedName },
    select: { id: true },
  });

  if (existing) {
    res.status(400).json({
      success: false,
      message: "Category with this name already exists",
    });
    return;
  }

  const category = await prisma.category.create({
    data: {
      name: trimmedName,
      slug: await buildUniqueSlug(trimmedName),
      description: typeof description === "string" && description.trim()
        ? description.trim()
        : null,
      isActive: typeof isActive === "boolean" ? isActive : true,
    },
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: serializeCategory(category),
  });
});

// 4. Update Category
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { name, description, isActive } = req.body ?? {};

  if (!id || isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid category ID format",
    });
    return;
  }

  const categoryId = BigInt(id);
  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    res.status(404).json({
      success: false,
      message: "Category not found",
    });
    return;
  }

  const updateData: any = {};

  if (name !== undefined) {
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    const nameConflict = await prisma.category.findFirst({
      where: {
        name: trimmedName,
        id: { not: categoryId },
      },
      select: { id: true },
    });

    if (nameConflict) {
      res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
      return;
    }

    updateData.name = trimmedName;
    if (trimmedName !== existing.name) {
      updateData.slug = await buildUniqueSlug(trimmedName, categoryId);
    }
  }

  if (description !== undefined) {
    updateData.description =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
  }

  if (isActive !== undefined) {
    updateData.isActive = Boolean(isActive);
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: serializeCategory(category),
  });
});

// 5. Delete Category
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id || isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid category ID format",
    });
    return;
  }

  const categoryId = BigInt(id);
  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true },
  });

  if (!existing) {
    res.status(404).json({
      success: false,
      message: "Category not found",
    });
    return;
  }

  const foodCount = await prisma.food.count({
    where: { categoryId },
  });

  if (foodCount > 0) {
    res.status(400).json({
      success: false,
      message: "Remove or reassign foods under this category before deleting it.",
    });
    return;
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

// 2. Get Single Category
export const getSingleCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        foods: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    // Convert BigInt and Decimal to string for JSON serialization
    const categoryResponse = {
      ...category,
      id: category.id.toString(),
      foods: category.foods.map((food) => ({
        ...food,
        id: food.id.toString(),
        price: food.price.toString(),
      })),
    };

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: categoryResponse,
    });
  },
);
