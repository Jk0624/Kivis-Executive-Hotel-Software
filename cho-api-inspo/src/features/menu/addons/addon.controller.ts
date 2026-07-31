import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AddAddonRequestBody, UpdateAddonRequestBody } from "./addon.types.js";

// 1. Add Addon
export const addAddon = asyncHandler(async (req: Request, res: Response) => {
  // Check if body exists
  if (!req.body) {
    res.status(400).json({
      success: false,
      message: "Request body is required. Make sure Content-Type is application/json",
    });
    return;
  }

  const { restaurantId, name, description, price, tag, frontendComponent, step, minPrice, maxPrice, isActive }: AddAddonRequestBody = req.body;

  // Validation
  if (!restaurantId || !name || price === undefined || !tag) {
    res.status(400).json({
      success: false,
      message: "Missing required fields: restaurantId, name, price, and tag are required",
    });
    return;
  }

  // Validate tag is a valid enum value
  const validTags = ["main", "sauce", "sides", "packaging"];
  if (!validTags.includes(tag)) {
    res.status(400).json({
      success: false,
      message: `Invalid tag. Must be one of: ${validTags.join(", ")}`,
    });
    return;
  }

  // Validate frontendComponent if provided
  if (frontendComponent !== undefined) {
    const validComponents = ["checkbox", "slider", "counter"];
    if (!validComponents.includes(frontendComponent)) {
      res.status(400).json({
        success: false,
        message: `Invalid frontendComponent. Must be one of: ${validComponents.join(", ")}`,
      });
      return;
    }
  }

  // Validate price is non-negative
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum) || priceNum < 0) {
    res.status(400).json({
      success: false,
      message: "Price must be a non-negative number",
    });
    return;
  }

  // Validate range pricing fields if provided (optional for all tags)
  if (step !== undefined && minPrice !== undefined && maxPrice !== undefined) {
    const stepNum = typeof step === "string" ? parseFloat(step) : step;
    const minPriceNum = typeof minPrice === "string" ? parseFloat(minPrice) : minPrice;
    const maxPriceNum = typeof maxPrice === "string" ? parseFloat(maxPrice) : maxPrice;

    if (isNaN(stepNum) || stepNum <= 0) {
      res.status(400).json({
        success: false,
        message: "Step must be a positive number",
      });
      return;
    }

    if (isNaN(minPriceNum) || minPriceNum < 0) {
      res.status(400).json({
        success: false,
        message: "minPrice must be a non-negative number",
      });
      return;
    }

    if (isNaN(maxPriceNum) || maxPriceNum <= minPriceNum) {
      res.status(400).json({
        success: false,
        message: "maxPrice must be greater than minPrice",
      });
      return;
    }

    // Validate step divides evenly into (maxPrice - minPrice)
    const priceRange = maxPriceNum - minPriceNum;
    if (Math.abs(Math.round(priceRange / stepNum) * stepNum - priceRange) > 1e-9) {
      res.status(400).json({
        success: false,
        message: `Step (${stepNum}) must divide evenly into the price range (${priceRange})`,
      });
      return;
    }
  }

  // Check if restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: BigInt(restaurantId) },
    select: { id: true, vendorId: true },
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  // Ownership check (vendor routes only)
  if ((req as any).vendorId && restaurant.vendorId?.toString() !== (req as any).vendorId) {
    res.status(403).json({
      success: false,
      message: "You do not have permission to add addons to this restaurant",
    });
    return;
  }

  // Prepare addon data
  const addonData: any = {
    restaurantId: BigInt(restaurantId),
    name,
    description: description || null,
    price: priceNum,
    tag: tag,
    frontendComponent: frontendComponent || "counter",
    isActive: isActive !== undefined ? isActive : true,
  };

  // Add range pricing fields if provided
  if (step !== undefined && minPrice !== undefined && maxPrice !== undefined) {
    addonData.step = typeof step === "string" ? parseFloat(step) : step;
    addonData.minPrice = typeof minPrice === "string" ? parseFloat(minPrice) : minPrice;
    addonData.maxPrice = typeof maxPrice === "string" ? parseFloat(maxPrice) : maxPrice;
  }

  // Create addon
  const addon = await (prisma as any).addon.create({
    data: addonData,
    select: {
      id: true,
      restaurantId: true,
      name: true,
      description: true,
      price: true,
      tag: true,
      frontendComponent: true,
      step: true,
      minPrice: true,
      maxPrice: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Convert BigInt to string for JSON serialization
  const addonResponse = {
    ...addon,
    id: addon.id.toString(),
    restaurantId: addon.restaurantId.toString(),
    price: addon.price.toString(),
  };

  res.status(201).json({
    success: true,
    message: "Addon added successfully",
    data: addonResponse,
  });
});

// 2. Get All Addons
export const getAllAddons = asyncHandler(async (req: Request, res: Response) => {
  const { restaurantId, isActive, tag, page = "1", limit = "20" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};
  if (restaurantId) {
    where.restaurantId = BigInt(restaurantId as string);
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }
  if (tag) {
    const validTags = ["main", "sauce", "sides", "packaging"];
    if (validTags.includes(tag as string)) {
      where.tag = tag;
    }
  }

  // Get addons with pagination
  const [addons, total] = await Promise.all([
    (prisma as any).addon.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        description: true,
        price: true,
        tag: true,
        frontendComponent: true,
        step: true,
        minPrice: true,
        maxPrice: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    (prisma as any).addon.count({ where }),
  ]);

  // Convert BigInt to string for JSON serialization
  const addonsResponse = addons.map((addon: any) => ({
    ...addon,
    id: addon.id.toString(),
    restaurantId: addon.restaurantId.toString(),
    price: addon.price.toString(),
    step: addon.step?.toString() || null,
    minPrice: addon.minPrice?.toString() || null,
    maxPrice: addon.maxPrice?.toString() || null,
  }));

  res.status(200).json({
    success: true,
    message: "Addons retrieved successfully",
    data: {
      addons: addonsResponse,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

// 3. Get Single Addon
export const getSingleAddon = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Addon ID is required",
    });
    return;
  }

  // Validate that id is a valid number
  if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid addon ID format. ID must be a number",
    });
    return;
  }

  const addon = await (prisma as any).addon.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      restaurantId: true,
      name: true,
      description: true,
      price: true,
      tag: true,
      frontendComponent: true,
      step: true,
      minPrice: true,
      maxPrice: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!addon) {
    res.status(404).json({
      success: false,
      message: "Addon not found",
    });
    return;
  }

  // Convert BigInt to string for JSON serialization
  const addonResponse = {
    ...addon,
    id: addon.id.toString(),
    restaurantId: addon.restaurantId.toString(),
    price: addon.price.toString(),
    step: addon.step?.toString() || null,
    minPrice: addon.minPrice?.toString() || null,
    maxPrice: addon.maxPrice?.toString() || null,
    restaurant: {
      ...addon.restaurant,
      id: addon.restaurant.id.toString(),
    },
  };

  res.status(200).json({
    success: true,
    message: "Addon retrieved successfully",
    data: addonResponse,
  });
});

// 4. Update Addon
export const updateAddon = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  // Check if body exists
  if (!req.body) {
    res.status(400).json({
      success: false,
      message: "Request body is required. Make sure Content-Type is application/json",
    });
    return;
  }

  const { name, description, price, tag, frontendComponent, step, minPrice, maxPrice, isActive }: UpdateAddonRequestBody = req.body;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Addon ID is required",
    });
    return;
  }

  if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid addon ID format. ID must be a number",
    });
    return;
  }

  // Check if addon exists
  const existingAddon = await (prisma as any).addon.findUnique({
    where: { id: BigInt(id) },
    include: { restaurant: { select: { vendorId: true } } },
  });

  if (!existingAddon) {
    res.status(404).json({
      success: false,
      message: "Addon not found",
    });
    return;
  }

  // Ownership check (vendor routes only)
  if ((req as any).vendorId && existingAddon.restaurant.vendorId?.toString() !== (req as any).vendorId) {
    res.status(403).json({
      success: false,
      message: "You do not have permission to update this addon",
    });
    return;
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) {
    const priceNum = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
      });
      return;
    }
    updateData.price = priceNum;
  }
  if (tag !== undefined) {
    const validTags = ["main", "sauce", "sides", "packaging"];
    if (!validTags.includes(tag)) {
      res.status(400).json({
        success: false,
        message: `Invalid tag. Must be one of: ${validTags.join(", ")}`,
      });
      return;
    }
    updateData.tag = tag;
  }
  if (frontendComponent !== undefined) {
    const validComponents = ["checkbox", "slider", "counter"];
    if (!validComponents.includes(frontendComponent)) {
      res.status(400).json({
        success: false,
        message: `Invalid frontendComponent. Must be one of: ${validComponents.join(", ")}`,
      });
      return;
    }
    updateData.frontendComponent = frontendComponent;
  }

  // Validate range pricing fields if provided
  // Resolve final values: use incoming values if provided, else fall back to existing
  const stepToValidate = step !== undefined ? step : existingAddon.step;
  const minPriceToValidate = minPrice !== undefined ? minPrice : existingAddon.minPrice;
  const maxPriceToValidate = maxPrice !== undefined ? maxPrice : existingAddon.maxPrice;

  // If all three range fields are present (either from request or existing), validate them
  if (stepToValidate !== null && stepToValidate !== undefined &&
      minPriceToValidate !== null && minPriceToValidate !== undefined &&
      maxPriceToValidate !== null && maxPriceToValidate !== undefined) {
    const stepNum = typeof stepToValidate === "string" ? parseFloat(stepToValidate) : Number(stepToValidate);
    const minPriceNum = typeof minPriceToValidate === "string" ? parseFloat(minPriceToValidate) : Number(minPriceToValidate);
    const maxPriceNum = typeof maxPriceToValidate === "string" ? parseFloat(maxPriceToValidate) : Number(maxPriceToValidate);

    if (isNaN(stepNum) || stepNum <= 0) {
      res.status(400).json({
        success: false,
        message: "Step must be a positive number",
      });
      return;
    }

    if (isNaN(minPriceNum) || minPriceNum < 0) {
      res.status(400).json({
        success: false,
        message: "minPrice must be a non-negative number",
      });
      return;
    }

    if (isNaN(maxPriceNum) || maxPriceNum <= minPriceNum) {
      res.status(400).json({
        success: false,
        message: "maxPrice must be greater than minPrice",
      });
      return;
    }

    // Validate step divides evenly into (maxPrice - minPrice)
    const priceRange = maxPriceNum - minPriceNum;
    if (Math.abs(Math.round(priceRange / stepNum) * stepNum - priceRange) > 1e-9) {
      res.status(400).json({
        success: false,
        message: `Step (${stepNum}) must divide evenly into the price range (${priceRange})`,
      });
      return;
    }
  }

  // Update range pricing fields if provided
  if (step !== undefined) {
    updateData.step = step === null ? null : (typeof step === "string" ? parseFloat(step) : step);
  }
  if (minPrice !== undefined) {
    updateData.minPrice = minPrice === null ? null : (typeof minPrice === "string" ? parseFloat(minPrice) : minPrice);
  }
  if (maxPrice !== undefined) {
    updateData.maxPrice = maxPrice === null ? null : (typeof maxPrice === "string" ? parseFloat(maxPrice) : maxPrice);
  }

  if (isActive !== undefined) updateData.isActive = isActive;

  // Update addon
  const addon = await (prisma as any).addon.update({
    where: { id: BigInt(id) },
    data: updateData,
    select: {
      id: true,
      restaurantId: true,
      name: true,
      description: true,
      price: true,
      tag: true,
      frontendComponent: true,
      step: true,
      minPrice: true,
      maxPrice: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Convert BigInt to string for JSON serialization
  const addonResponse = {
    ...addon,
    id: addon.id.toString(),
    restaurantId: addon.restaurantId.toString(),
    price: addon.price.toString(),
    step: addon.step?.toString() || null,
    minPrice: addon.minPrice?.toString() || null,
    maxPrice: addon.maxPrice?.toString() || null,
  };

  res.status(200).json({
    success: true,
    message: "Addon updated successfully",
    data: addonResponse,
  });
});

// 5. Delete Addon
export const deleteAddon = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Addon ID is required",
    });
    return;
  }

  if (isNaN(Number(id)) || !/^\d+$/.test(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid addon ID format. ID must be a number",
    });
    return;
  }

  // Check if addon exists
  const existingAddon = await (prisma as any).addon.findUnique({
    where: { id: BigInt(id) },
    include: {
      foodAddons: true,
      restaurant: { select: { vendorId: true } },
    },
  });

  if (!existingAddon) {
    res.status(404).json({
      success: false,
      message: "Addon not found",
    });
    return;
  }

  // Ownership check (vendor routes only)
  if ((req as any).vendorId && existingAddon.restaurant.vendorId?.toString() !== (req as any).vendorId) {
    res.status(403).json({
      success: false,
      message: "You do not have permission to delete this addon",
    });
    return;
  }

  // Check if addon is assigned to any foods
  if (existingAddon.foodAddons.length > 0) {
    res.status(400).json({
      success: false,
      message: "Cannot delete addon. It is currently assigned to one or more foods. Please remove it from foods first or use soft delete by setting isActive to false.",
    });
    return;
  }

  // Delete addon
  await (prisma as any).addon.delete({
    where: { id: BigInt(id) },
  });

  res.status(200).json({
    success: true,
    message: "Addon deleted successfully",
  });
});

