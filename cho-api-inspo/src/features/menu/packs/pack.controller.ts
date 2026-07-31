import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AddPackRequestBody, UpdatePackRequestBody } from "./pack.types.js";

// 1. Add Pack
export const addPack = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).json({
      success: false,
      message:
        "Request body is required. Make sure Content-Type is application/json",
    });
    return;
  }

  const { foodId, name, price, isDefault, isActive }: AddPackRequestBody = req.body;

  // Validation
  if (!foodId || !name || price === undefined) {
    res.status(400).json({
      success: false,
      message: "Missing required fields: foodId, name, and price are required",
    });
    return;
  }

  // Validate foodId
  const foodIdStr = String(foodId);
  if (isNaN(Number(foodIdStr)) || !/^\d+$/.test(foodIdStr)) {
    res.status(400).json({
      success: false,
      message: "Invalid food ID format",
    });
    return;
  }

  // Validate price
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum) || priceNum <= 0) {
    res.status(400).json({
      success: false,
      message: "Price must be a positive number",
    });
    return;
  }

  // Check if food exists
  const food = await prisma.food.findUnique({
    where: { id: BigInt(foodIdStr) },
    include: {
      addons: true,
      packs: true as any,
    },
  });

  if (!food) {
    res.status(404).json({
      success: false,
      message: "Food not found",
    });
    return;
  }

  // Validate that food doesn't have addons (mutually exclusive)
  if (food.addons && food.addons.length > 0) {
    res.status(400).json({
      success: false,
      message: "Food cannot have both packs and addons. Please remove addons first.",
    });
    return;
  }

  // Check if pack name already exists for this food
  const existingPack = await (prisma as any).foodPack.findFirst({
    where: {
      foodId: BigInt(foodIdStr),
      name: name.trim(),
    },
  });

  if (existingPack) {
    res.status(400).json({
      success: false,
      message: "Pack with this name already exists for this food",
    });
    return;
  }

  // If isDefault is true, unset other default packs
  if (isDefault === true) {
    await (prisma as any).foodPack.updateMany({
      where: {
        foodId: BigInt(foodIdStr),
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Create pack
  const pack = await (prisma as any).foodPack.create({
    data: {
      foodId: BigInt(foodIdStr),
      name: name.trim(),
      price: priceNum,
      isDefault: isDefault !== undefined ? isDefault : false,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  // Touch food updatedAt so "Recently Updated" filter reflects this change
  await (prisma as any).food.update({
    where: { id: BigInt(foodIdStr) },
    data: { updatedAt: new Date() },
  });

  // Convert BigInt to string for JSON serialization
  const packResponse = {
    id: pack.id.toString(),
    foodId: pack.foodId.toString(),
    name: pack.name,
    price: pack.price.toString(),
    isDefault: pack.isDefault,
    isActive: pack.isActive,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
  };

  res.status(201).json({
    success: true,
    message: "Pack created successfully",
    data: packResponse,
  });
});

// 2. Get All Packs
export const getAllPacks = asyncHandler(async (req: Request, res: Response) => {
  const { foodId, isActive, page = "1", limit = "20" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};
  if (foodId) {
    const foodIdStr = String(foodId);
    if (isNaN(Number(foodIdStr)) || !/^\d+$/.test(foodIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid foodId format",
      });
      return;
    }
    where.foodId = BigInt(foodIdStr);
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  } else {
    // Default to only active packs
    where.isActive = true;
  }

  // Get packs with pagination
  const [packs, total] = await Promise.all([
    (prisma as any).foodPack.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [
        { isDefault: "desc" },
        { price: "asc" },
      ],
      include: {
        food: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    }),
    (prisma as any).foodPack.count({ where }),
  ]);

  // Convert BigInt to string for JSON serialization
  const packsResponse = packs.map((pack: any) => ({
    id: pack.id.toString(),
    foodId: pack.foodId.toString(),
    name: pack.name,
    price: pack.price.toString(),
    isDefault: pack.isDefault,
    isActive: pack.isActive,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
    food: pack.food
      ? {
          id: pack.food.id.toString(),
          name: pack.food.name,
          price: pack.food.price.toString(),
        }
      : undefined,
  }));

  res.status(200).json({
    success: true,
    message: "Packs retrieved successfully",
    data: {
      packs: packsResponse,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

// 3. Get Single Pack
export const getSinglePack = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Pack ID is required",
      });
      return;
    }

    // Validate ID
    if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid pack ID format",
      });
      return;
    }

    const pack = await (prisma as any).foodPack.findUnique({
      where: { id: BigInt(id) },
      include: {
        food: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    if (!pack) {
      res.status(404).json({
        success: false,
        message: "Pack not found",
      });
      return;
    }

    // Convert BigInt to string for JSON serialization
    const packResponse = {
      id: pack.id.toString(),
      foodId: pack.foodId.toString(),
      name: pack.name,
      price: pack.price.toString(),
      isDefault: pack.isDefault,
      isActive: pack.isActive,
      createdAt: pack.createdAt,
      updatedAt: pack.updatedAt,
      food: pack.food
        ? {
            id: pack.food.id.toString(),
            name: pack.food.name,
            price: pack.food.price.toString(),
          }
        : undefined,
    };

    res.status(200).json({
      success: true,
      message: "Pack retrieved successfully",
      data: packResponse,
    });
  }
);

// 4. Update Pack
export const updatePack = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!req.body) {
    res.status(400).json({
      success: false,
      message:
        "Request body is required. Make sure Content-Type is application/json",
    });
    return;
  }

  const { name, price, isDefault, isActive }: UpdatePackRequestBody = req.body;

  // Validation
  if (!id) {
    res.status(400).json({
      success: false,
      message: "Pack ID is required",
    });
    return;
  }

  // Validate ID
  if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid pack ID format",
    });
    return;
  }

  // Check if pack exists
  const existingPack = await (prisma as any).foodPack.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existingPack) {
    res.status(404).json({
      success: false,
      message: "Pack not found",
    });
    return;
  }

  // Validate price if provided
  let priceNum: number | undefined;
  if (price !== undefined) {
    priceNum = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceNum) || priceNum <= 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
      return;
    }
  }

  // Check if new name conflicts with existing pack
  if (name !== undefined && name.trim() !== existingPack.name) {
    const nameConflict = await (prisma as any).foodPack.findFirst({
      where: {
        foodId: existingPack.foodId,
        name: name.trim(),
        id: {
          not: BigInt(id),
        },
      },
    });

    if (nameConflict) {
      res.status(400).json({
        success: false,
        message: "Pack with this name already exists for this food",
      });
      return;
    }
  }

  // If isDefault is true, unset other default packs for the same food
  if (isDefault === true) {
    await (prisma as any).foodPack.updateMany({
      where: {
        foodId: existingPack.foodId,
        isDefault: true,
        id: {
          not: BigInt(id),
        },
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name.trim();
  if (priceNum !== undefined) updateData.price = priceNum;
  if (isDefault !== undefined) updateData.isDefault = isDefault;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Update pack
  const pack = await (prisma as any).foodPack.update({
    where: { id: BigInt(id) },
    data: updateData,
  });

  // Convert BigInt to string for JSON serialization
  const packResponse = {
    id: pack.id.toString(),
    foodId: pack.foodId.toString(),
    name: pack.name,
    price: pack.price.toString(),
    isDefault: pack.isDefault,
    isActive: pack.isActive,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
  };

  res.status(200).json({
    success: true,
    message: "Pack updated successfully",
    data: packResponse,
  });
});

// 5. Delete Pack
export const deletePack = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  // Validation
  if (!id) {
    res.status(400).json({
      success: false,
      message: "Pack ID is required",
    });
    return;
  }

  // Validate ID
  if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid pack ID format",
    });
    return;
  }

  // Check if pack exists
  const pack = await (prisma as any).foodPack.findUnique({
    where: { id: BigInt(id) },
  });

  if (!pack) {
    res.status(404).json({
      success: false,
      message: "Pack not found",
    });
    return;
  }

  // Delete pack
  await (prisma as any).foodPack.delete({
    where: { id: BigInt(id) },
  });

  // Touch food updatedAt so "Recently Updated" filter reflects this change
  await (prisma as any).food.update({
    where: { id: pack.foodId },
    data: { updatedAt: new Date() },
  });

  res.status(200).json({
    success: true,
    message: "Pack deleted successfully",
  });
});



