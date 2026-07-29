import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AddFoodRequestBody, UpdateFoodRequestBody } from "./food.types.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { uploadToS3, deleteFromS3 } from "../../../utils/s3.js";
import { calculateHaversineDistance } from "../../../utils/distance.js";

const USER_MAX_DISTANCE_KM = parseInt(process.env.USER_MAX_DISTANCE_KM || "20", 10);

// 1. Add Food
export const addFood = asyncHandler(async (req: Request, res: Response) => {
  const {
    restaurantId,
    categoryId,
    name,
    description,
    price,
    isAvailable,
    isPopular,
    requiredAddonTags,
  }: AddFoodRequestBody = req.body;

  // Validation
  if (!restaurantId || !name || !price) {
    res.status(400).json({
      success: false,
      message:
        "Missing required fields: restaurantId, name, and price are required",
    });
    return;
  }

  // Validate price is a positive number
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum) || priceNum <= 0) {
    res.status(400).json({
      success: false,
      message: "Price must be a positive number",
    });
    return;
  }

  // Check if restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: BigInt(restaurantId) },
  });

  if (!restaurant) {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
    return;
  }

  // Check if category exists if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: BigInt(categoryId) },
    });
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }
  }

  // Validate requiredAddonTags if provided
  if (requiredAddonTags !== undefined) {
    if (!Array.isArray(requiredAddonTags)) {
      res.status(400).json({
        success: false,
        message: "requiredAddonTags must be an array",
      });
      return;
    }
    const validTags = ["main", "sauce", "sides", "packaging"];
    for (const tag of requiredAddonTags) {
      if (!validTags.includes(tag)) {
        res.status(400).json({
          success: false,
          message: `Invalid tag in requiredAddonTags: ${tag}. Must be one of: ${validTags.join(
            ", "
          )}`,
        });
        return;
      }
    }
  }

  // Handle image upload
  const finalImageUrl = req.file
    ? await uploadToS3(req.file.buffer, req.file.originalname, "food")
    : null;

  // Create food
  const food = await prisma.food.create({
    data: {
      restaurantId: BigInt(restaurantId),
      categoryId: categoryId ? BigInt(categoryId) : null,
      name,
      description: description || null,
      price: priceNum,
      imageUrl: finalImageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isPopular: isPopular !== undefined ? isPopular : false,
      requiredAddonTags: requiredAddonTags || [],
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Convert BigInt to string for JSON serialization
  const foodResponse = {
    ...food,
    id: food.id.toString(),
    restaurantId: food.restaurantId.toString(),
    categoryId: food.categoryId?.toString() || null,
    price: food.price.toString(),
    category: food.category
      ? {
          ...food.category,
          id: food.category.id.toString(),
        }
      : null,
  };

  res.status(201).json({
    success: true,
    message: "Food added successfully",
    data: foodResponse,
  });
});

// 2. Get All Food
export const getAllFood = asyncHandler(async (req: Request, res: Response) => {
  const {
    restaurantId,
    categoryId,
    isAvailable,
    isPopular,
    search,
    includeAddons = "false",
    includePacks = "false",
    userId,
    page,
    limit: limitParam,
    latitude,
    longitude,
  } = req.query;

  // Parse user location for distance filtering
  const userLat = latitude ? parseFloat(latitude as string) : null;
  const userLng = longitude ? parseFloat(longitude as string) : null;
  const hasUserLocation = userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng);

  // Bounding box pre-filter: narrow DB scan to ~20km square before Haversine
  // 1 degree lat ≈ 111km; lng degree shrinks with cos(lat)
  let boundingBox: { latitude: any; longitude: any } | null = null;
  if (hasUserLocation) {
    const latDelta = USER_MAX_DISTANCE_KM / 111;
    const lngDelta =
      USER_MAX_DISTANCE_KM /
      (111 * Math.cos((userLat! * Math.PI) / 180));
    boundingBox = {
      latitude: { gte: userLat! - latDelta, lte: userLat! + latDelta },
      longitude: { gte: userLng! - lngDelta, lte: userLng! + lngDelta },
    };
  }

  let take: number | undefined;
  let skip: number = 0;
  let usePagination = false;

  if (page) {
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt((limitParam as string) || "20", 10);
    take = limitNum;
    skip = (pageNum - 1) * limitNum;
    usePagination = true;
  } else if (limitParam) {
    take = parseInt(limitParam as string, 10);
  }

  const shouldIncludeAddons = includeAddons === "true";
  const shouldIncludePacks = includePacks === "true";

  // Vendors/admin querying a restaurant menu skip the public verification filter.
  const isPrivilegedRequest = !!(req as any).vendor || !!(req as any).adminId;

  // Build where clause — only show foods from verified restaurants (skip for vendors)
  const where: any = {
    AND: isPrivilegedRequest
      ? []
      : [
          { restaurant: { verificationStatus: VerificationStatus.VERIFIED } },
          { restaurant: { vendor: { isActive: true } } },
          ...(boundingBox ? [{ restaurant: boundingBox }] : []),
        ],
  };

  if (restaurantId) {
    where.AND.push({ restaurantId: BigInt(restaurantId as string) });
  }
  if (categoryId) {
    where.AND.push({ categoryId: BigInt(categoryId as string) });
  }
  if (isAvailable !== undefined) {
    where.AND.push({ isAvailable: isAvailable === "true" });
  }
  if (isPopular !== undefined) {
    where.AND.push({ isPopular: isPopular === "true" });
  }
  if (search && typeof search === "string" && search.trim().length > 0) {
    where.AND.push({
      name: {
        contains: search.trim(),
        mode: "insensitive",
      },
    });
  }

  // Fetch user's favorites if userId is provided
  let userFavoriteIds: Set<string> = new Set();
  if (userId) {
    const favorites = await prisma.favoriteFood.findMany({
      where: {
        userId: BigInt(userId as string),
      },
      select: {
        foodId: true,
      },
    });
    userFavoriteIds = new Set(favorites.map((fav) => fav.foodId.toString()));
  }

  // Get foods with pagination
  const [foods, total] = await Promise.all([
    prisma.food.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            status: true,
            latitude: true,
            longitude: true,
          },
        },
        addons: shouldIncludeAddons
          ? {
              where: {
                addon: {
                  isActive: true,
                },
              },
              select: {
                id: true,
                isRequired: true,
                maxQuantity: true,
                addon: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    tag: true,
                    frontendComponent: true,
                    step: true,
                    minPrice: true,
                    maxPrice: true,
                    isActive: true,
                  },
                },
              },
            }
          : false,
        packs: shouldIncludePacks
          ? ({
              where: {
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true,
                isActive: true,
              },
              orderBy: [{ isDefault: "desc" }, { price: "asc" }],
            } as any)
          : false,
      },
    }),
    prisma.food.count({ where }),
  ]);

  // Filter foods by restaurant distance if user location is provided
  let filteredFoods = foods;
  if (hasUserLocation) {
    filteredFoods = foods.filter((food: any) => {
      if (!food.restaurant?.latitude || !food.restaurant?.longitude) return false;
      const distance = calculateHaversineDistance(
        userLat!,
        userLng!,
        Number(food.restaurant.latitude),
        Number(food.restaurant.longitude),
      );
      return distance <= USER_MAX_DISTANCE_KM;
    });
  }

  // Convert BigInt to string for JSON serialization
  const foodsResponse = filteredFoods.map((food: any) => {
    const foodId = food.id.toString();
    const response: any = {
      id: foodId,
      restaurantId: food.restaurantId.toString(),
      categoryId: food.categoryId?.toString() || null,
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      imageUrl: food.imageUrl,
      isAvailable: food.isAvailable,
      isPopular: food.isPopular,
      isFavorite: userFavoriteIds.has(foodId),
      requiredAddonTags: food.requiredAddonTags || [],
      createdAt: food.createdAt,
      updatedAt: food.updatedAt,
      category: food.category
        ? {
            ...food.category,
            id: food.category.id.toString(),
          }
        : null,
      restaurantName: food.restaurant?.name || "",
      restaurantStatus: food.restaurant?.status || null,
    };

    if (shouldIncludeAddons && food.addons) {
      response.addons = food.addons.map((fa: any) => ({
        id: fa.id.toString(),
        isRequired: fa.isRequired,
        maxQuantity: fa.maxQuantity,
        addon: {
          ...fa.addon,
          id: fa.addon.id.toString(),
          price: fa.addon.price.toString(),
          tag: fa.addon.tag,
          frontendComponent: fa.addon.frontendComponent || "counter",
          step: fa.addon.step?.toString() || null,
          minPrice: fa.addon.minPrice?.toString() || null,
          maxPrice: fa.addon.maxPrice?.toString() || null,
        },
      }));
    }

    if (shouldIncludePacks && (food as any).packs) {
      response.packs = (food as any).packs.map((pack: any) => ({
        id: pack.id.toString(),
        name: pack.name,
        price: pack.price.toString(),
        isDefault: pack.isDefault,
        isActive: pack.isActive,
      }));
    }

    return response;
  });

  const filteredTotal = hasUserLocation ? foodsResponse.length : total;

  const response: any = {
    success: true,
    message: "Foods retrieved successfully",
    data: {
      foods: foodsResponse,
    },
  };

  if (usePagination) {
    response.data.pagination = {
      page: parseInt(page as string, 10),
      limit: take,
      total: filteredTotal,
      totalPages: Math.ceil(filteredTotal / (take || 20)),
    };
  } else {
    response.data.total = filteredTotal;
  }

  res.status(200).json(response);
});

// 3. Get Single Food
export const getSingleFood = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { userId } = req.query;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
      return;
    }

    // Check if food is favorited by user
    let isFavorite = false;
    if (userId) {
      const favorite = await prisma.favoriteFood.findUnique({
        where: {
          userId_foodId: {
            userId: BigInt(userId as string),
            foodId: BigInt(id),
          },
        },
      });
      isFavorite = !!favorite;
    }

    const food = await prisma.food.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            addressLine: true,
            latitude: true,
            longitude: true,
            rating: true,
            imageUrl: true,
            status: true,
            verificationStatus: true,
          },
        },
        addons: {
          where: {
            addon: {
              isActive: true,
            },
          },
          select: {
            id: true,
            isRequired: true,
            maxQuantity: true,
            addon: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                tag: true,
                frontendComponent: true,
                step: true,
                minPrice: true,
                maxPrice: true,
                isActive: true,
              },
            },
          },
        },
        packs: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            isDefault: true,
            isActive: true,
          },
          orderBy: [{ isDefault: "desc" }, { price: "asc" }],
        } as any,
      },
    });

    if (!food) {
      res.status(404).json({
        success: false,
        message: "Food not found",
      });
      return;
    }

    // Block foods from unverified restaurants unless requested by vendor/admin.
    const isPrivilegedRequest = !!(req as any).vendor || !!(req as any).adminId;
    if (!isPrivilegedRequest && food.restaurant?.verificationStatus !== VerificationStatus.VERIFIED) {
      res.status(404).json({
        success: false,
        message: "Food not found",
      });
      return;
    }

    // Convert BigInt to string for JSON serialization
    const foodResponse: any = {
      id: food.id.toString(),
      restaurantId: food.restaurantId.toString(),
      categoryId: food.categoryId?.toString() || null,
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      imageUrl: food.imageUrl,
      isAvailable: food.isAvailable,
      isPopular: food.isPopular,
      isFavorite: isFavorite,
      requiredAddonTags: food.requiredAddonTags || [],
      createdAt: food.createdAt,
      updatedAt: food.updatedAt,
      category: (food as any).category
        ? {
            ...(food as any).category,
            id: (food as any).category.id.toString(),
          }
        : null,
      restaurant: {
        ...(food as any).restaurant,
        id: (food as any).restaurant.id.toString(),
        latitude: (food as any).restaurant.latitude.toString(),
        longitude: (food as any).restaurant.longitude.toString(),
        rating: (food as any).restaurant.rating?.toString() || null,
      },
      addons:
        (food as any).addons?.map((fa: any) => ({
          id: fa.id.toString(),
          isRequired: fa.isRequired,
          maxQuantity: fa.maxQuantity,
          addon: {
            id: fa.addon.id.toString(),
            name: fa.addon.name,
            description: fa.addon.description,
            price: fa.addon.price.toString(),
            tag: fa.addon.tag,
            frontendComponent: fa.addon.frontendComponent || "counter",
            step: fa.addon.step?.toString() || null,
            minPrice: fa.addon.minPrice?.toString() || null,
            maxPrice: fa.addon.maxPrice?.toString() || null,
            isActive: fa.addon.isActive,
          },
        })) || [],
      packs:
        (food as any).packs?.map((pack: any) => ({
          id: pack.id.toString(),
          name: pack.name,
          price: pack.price.toString(),
          isDefault: pack.isDefault,
          isActive: pack.isActive,
        })) || [],
    };

    res.status(200).json({
      success: true,
      message: "Food retrieved successfully",
      data: foodResponse,
    });
  }
);

// 4. Update Food
export const updateFood = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const {
    categoryId,
    name,
    description,
    price,
    isAvailable,
    isPopular,
    requiredAddonTags,
  }: UpdateFoodRequestBody = req.body;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Food ID is required",
    });
    return;
  }

  // Check if food exists
  const existingFood = await prisma.food.findUnique({
    where: { id: BigInt(id) },
    include: {
      addons: {
        select: { id: true },
      },
      packs: {
        select: { id: true },
      } as any,
    },
  });

  if (!existingFood) {
    res.status(404).json({
      success: false,
      message: "Food not found",
    });
    return;
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) {
    const priceNum = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceNum) || priceNum <= 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
      return;
    }
    updateData.price = priceNum;
  }
  if (req.file) {
    const oldImageUrl = existingFood.imageUrl;
    updateData.imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, "food");
    if (oldImageUrl) await deleteFromS3(oldImageUrl);
  }
  if (categoryId !== undefined)
    updateData.categoryId = categoryId ? BigInt(categoryId) : null;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
  if (isPopular !== undefined) updateData.isPopular = isPopular;
  if (requiredAddonTags !== undefined) {
    if (!Array.isArray(requiredAddonTags)) {
      res.status(400).json({
        success: false,
        message: "requiredAddonTags must be an array",
      });
      return;
    }
    const validTags = ["main", "sauce", "sides", "packaging"];
    for (const tag of requiredAddonTags) {
      if (!validTags.includes(tag)) {
        res.status(400).json({
          success: false,
          message: `Invalid tag in requiredAddonTags: ${tag}. Must be one of: ${validTags.join(
            ", "
          )}`,
        });
        return;
      }
    }
    updateData.requiredAddonTags = requiredAddonTags;
  }

  // Update food
  const food = await prisma.food.update({
    where: { id: BigInt(id) },
    data: updateData,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Convert BigInt to string for JSON serialization
  const foodResponse = {
    ...food,
    id: food.id.toString(),
    restaurantId: food.restaurantId.toString(),
    categoryId: food.categoryId?.toString() || null,
    price: food.price.toString(),
    requiredAddonTags: food.requiredAddonTags || [],
    category: food.category
      ? {
          ...food.category,
          id: food.category.id.toString(),
        }
      : null,
  };

  res.status(200).json({
    success: true,
    message: "Food updated successfully",
    data: foodResponse,
  });
});

// 5. Delete Food
export const deleteFood = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Food ID is required",
    });
    return;
  }

  // Check if food exists
  const existingFood = await prisma.food.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existingFood) {
    res.status(404).json({
      success: false,
      message: "Food not found",
    });
    return;
  }

  const addonCount = (existingFood as any).addons?.length ?? 0;
  const packCount = (existingFood as any).packs?.length ?? 0;

  if (addonCount > 0 || packCount > 0) {
    res.status(400).json({
      success: false,
      message:
        "Remove all addons and packs under this food before deleting it.",
    });
    return;
  }

  // Delete image from S3 if it exists
  if (existingFood.imageUrl) await deleteFromS3(existingFood.imageUrl);

  // Delete food
  await prisma.food.delete({
    where: { id: BigInt(id) },
  });

  res.status(200).json({
    success: true,
    message: "Food deleted successfully",
  });
});

// 6. Toggle Favorite Food
export const toggleFavoriteFood = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if body exists
    if (!req.body) {
      res.status(400).json({
        success: false,
        message:
          "Request body is required. Make sure Content-Type is application/json",
      });
      return;
    }

    const { userId, foodId } = req.body;

    // Validation
    if (!userId || !foodId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: userId and foodId are required",
      });
      return;
    }

    // Convert to strings and validate they are valid numbers
    const userIdStr = String(userId);
    const foodIdStr = String(foodId);

    if (isNaN(Number(userIdStr)) || !/^\d+$/.test(userIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid userId format. userId must be a valid number",
      });
      return;
    }

    if (isNaN(Number(foodIdStr)) || !/^\d+$/.test(foodIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid foodId format. foodId must be a valid number",
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userIdStr) },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if food exists
    const food = await prisma.food.findUnique({
      where: { id: BigInt(foodIdStr) },
    });

    if (!food) {
      res.status(404).json({
        success: false,
        message: "Food not found",
      });
      return;
    }

    // Check if favorite already exists
    const existingFavorite = await prisma.favoriteFood.findUnique({
      where: {
        userId_foodId: {
          userId: BigInt(userIdStr),
          foodId: BigInt(foodIdStr),
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteFood.delete({
        where: {
          userId_foodId: {
            userId: BigInt(userIdStr),
            foodId: BigInt(foodIdStr),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Food removed from favorites successfully",
        data: {
          isFavorite: false,
          foodId: foodIdStr,
          userId: userIdStr,
        },
      });
    } else {
      // Add to favorites
      const favorite = await prisma.favoriteFood.create({
        data: {
          userId: BigInt(userIdStr),
          foodId: BigInt(foodIdStr),
        },
        select: {
          id: true,
          userId: true,
          foodId: true,
          createdAt: true,
        },
      });

      // Convert BigInt to string for JSON serialization
      const favoriteResponse = {
        id: favorite.id.toString(),
        userId: favorite.userId.toString(),
        foodId: favorite.foodId.toString(),
        createdAt: favorite.createdAt,
      };

      res.status(200).json({
        success: true,
        message: "Food added to favorites successfully",
        data: {
          isFavorite: true,
          favorite: favoriteResponse,
        },
      });
    }
  }
);

// 7. Get All User Favorite Foods (Detailed)
export const getUserFavoriteFoods = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, page = "1", limit = "20" } = req.query;

    // Validation
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId query parameter is required",
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId as string) },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Get favorite foods with detailed food information
    const [favorites, total] = await Promise.all([
      prisma.favoriteFood.findMany({
        where: {
          userId: BigInt(userId as string),
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          userId: true,
          foodId: true,
          createdAt: true,
          food: {
            select: {
              id: true,
              restaurantId: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              isAvailable: true,
              createdAt: true,
              updatedAt: true,
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  phone: true,
                  email: true,
                  addressLine: true,
                  latitude: true,
                  longitude: true,
                  imageUrl: true,
                  rating: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.favoriteFood.count({
        where: {
          userId: BigInt(userId as string),
        },
      }),
    ]);

    // Convert BigInt and Decimal to string for JSON serialization
    const favoritesResponse = favorites.map((favorite) => ({
      favoriteId: favorite.id.toString(),
      addedAt: favorite.createdAt,
      food: {
        id: favorite.food.id.toString(),
        restaurantId: favorite.food.restaurantId.toString(),
        name: favorite.food.name,
        description: favorite.food.description,
        price: favorite.food.price.toString(),
        imageUrl: favorite.food.imageUrl,
        isAvailable: favorite.food.isAvailable,
        createdAt: favorite.food.createdAt,
        updatedAt: favorite.food.updatedAt,
        category: favorite.food.category
          ? {
              id: (favorite.food.category as any).id.toString(),
              name: (favorite.food.category as any).name,
              slug: (favorite.food.category as any).slug,
            }
          : null,
        restaurant: {
          id: favorite.food.restaurant.id.toString(),
          name: favorite.food.restaurant.name,
          description: favorite.food.restaurant.description,
          phone: favorite.food.restaurant.phone,
          email: favorite.food.restaurant.email,
          addressLine: favorite.food.restaurant.addressLine,
          latitude: favorite.food.restaurant.latitude.toString(),
          longitude: favorite.food.restaurant.longitude.toString(),
          imageUrl: favorite.food.restaurant.imageUrl,
          rating: favorite.food.restaurant.rating?.toString() || null,
          status: favorite.food.restaurant.status,
        },
      },
    }));

    res.status(200).json({
      success: true,
      message: "User favorite foods retrieved successfully",
      data: {
        favorites: favoritesResponse,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  }
);

// 8. Add Addon to Food
export const addAddonToFood = asyncHandler(
  async (req: Request, res: Response) => {
    const foodId = req.params.foodId as string;

    // Check if body exists
    if (!req.body) {
      res.status(400).json({
        success: false,
        message:
          "Request body is required. Make sure Content-Type is application/json",
      });
      return;
    }

    const { addonId, isRequired, maxQuantity } = req.body;

    // Validation
    if (!foodId || !addonId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: foodId and addonId are required",
      });
      return;
    }

    // Validate IDs
    if (isNaN(Number(foodId)) || !/^\d+$/.test(foodId)) {
      res.status(400).json({
        success: false,
        message: "Invalid food ID format",
      });
      return;
    }

    const addonIdStr = String(addonId);
    if (isNaN(Number(addonIdStr)) || !/^\d+$/.test(addonIdStr)) {
      res.status(400).json({
        success: false,
        message: "Invalid addon ID format",
      });
      return;
    }

    // Check if food exists
    const food = await prisma.food.findUnique({
      where: { id: BigInt(foodId) },
      include: {
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

    // Validate that food doesn't have packs (mutually exclusive)
    if ((food as any).packs && (food as any).packs.length > 0) {
      res.status(400).json({
        success: false,
        message:
          "Food cannot have both packs and addons. Please remove packs first.",
      });
      return;
    }

    // Check if addon exists and get required fields
    const addon = await (prisma as any).addon.findUnique({
      where: { id: BigInt(addonIdStr) },
      select: {
        id: true,
        restaurantId: true,
        tag: true,
        step: true,
        minPrice: true,
        maxPrice: true,
      },
    });

    if (!addon) {
      res.status(404).json({
        success: false,
        message: "Addon not found",
      });
      return;
    }

    // Validate addon and food belong to the same restaurant
    if (addon.restaurantId.toString() !== food.restaurantId.toString()) {
      res.status(400).json({
        success: false,
        message: "Addon and food must belong to the same restaurant",
      });
      return;
    }

    // Validate maxQuantity if provided
    if (
      maxQuantity !== undefined &&
      (isNaN(Number(maxQuantity)) || Number(maxQuantity) <= 0)
    ) {
      res.status(400).json({
        success: false,
        message: "maxQuantity must be a positive number",
      });
      return;
    }

    // Check if relationship already exists
    const existingFoodAddon = await (prisma as any).foodAddon.findUnique({
      where: {
        foodId_addonId: {
          foodId: BigInt(foodId),
          addonId: BigInt(addonIdStr),
        },
      },
    });

    if (existingFoodAddon) {
      res.status(400).json({
        success: false,
        message: "Addon is already assigned to this food",
      });
      return;
    }

    // Create food-addon relationship
    const foodAddon = await (prisma as any).foodAddon.create({
      data: {
        foodId: BigInt(foodId),
        addonId: BigInt(addonIdStr),
        isRequired: isRequired !== undefined ? isRequired : false,
        maxQuantity: maxQuantity !== undefined ? Number(maxQuantity) : null,
      },
      select: {
        id: true,
        foodId: true,
        addonId: true,
        isRequired: true,
        maxQuantity: true,
        createdAt: true,
        updatedAt: true,
        addon: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            tag: true,
            step: true,
            minPrice: true,
            maxPrice: true,
            isActive: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const foodAddonResponse = {
      id: foodAddon.id.toString(),
      foodId: foodAddon.foodId.toString(),
      addonId: foodAddon.addonId.toString(),
      isRequired: foodAddon.isRequired,
      maxQuantity: foodAddon.maxQuantity,
      createdAt: foodAddon.createdAt,
      updatedAt: foodAddon.updatedAt,
      addon: {
        ...foodAddon.addon,
        id: foodAddon.addon.id.toString(),
        price: foodAddon.addon.price.toString(),
        tag: foodAddon.addon.tag,
        step: foodAddon.addon.step?.toString() || null,
        minPrice: foodAddon.addon.minPrice?.toString() || null,
        maxPrice: foodAddon.addon.maxPrice?.toString() || null,
      },
    };

    // Touch food updatedAt so "Recently Updated" filter reflects this change
    await (prisma as any).food.update({
      where: { id: BigInt(foodId) },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      message: "Addon added to food successfully",
      data: foodAddonResponse,
    });
  }
);

// 9. Remove Addon from Food
export const removeAddonFromFood = asyncHandler(
  async (req: Request, res: Response) => {
    const foodId = req.params.foodId as string;
    const addonId = req.params.addonId as string;

    // Validation
    if (!foodId || !addonId) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: foodId and addonId are required",
      });
      return;
    }

    // Validate IDs
    if (isNaN(Number(foodId)) || !/^\d+$/.test(foodId)) {
      res.status(400).json({
        success: false,
        message: "Invalid food ID format",
      });
      return;
    }

    if (isNaN(Number(addonId)) || !/^\d+$/.test(addonId)) {
      res.status(400).json({
        success: false,
        message: "Invalid addon ID format",
      });
      return;
    }

    // Check if relationship exists
    const foodAddon = await (prisma as any).foodAddon.findUnique({
      where: {
        foodId_addonId: {
          foodId: BigInt(foodId),
          addonId: BigInt(addonId),
        },
      },
    });

    if (!foodAddon) {
      res.status(404).json({
        success: false,
        message: "Addon is not assigned to this food",
      });
      return;
    }

    // Delete relationship
    await (prisma as any).foodAddon.delete({
      where: {
        foodId_addonId: {
          foodId: BigInt(foodId),
          addonId: BigInt(addonId),
        },
      },
    });

    // Touch food updatedAt so "Recently Updated" filter reflects this change
    await (prisma as any).food.update({
      where: { id: BigInt(foodId) },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: "Addon removed from food successfully",
    });
  }
);

// 10. Get Food Addons
export const getFoodAddons = asyncHandler(
  async (req: Request, res: Response) => {
    const foodId = req.params.foodId as string;
    const { isActive } = req.query;

    // Validation
    if (!foodId) {
      res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
      return;
    }

    // Validate ID
    if (isNaN(Number(foodId)) || !/^\d+$/.test(foodId)) {
      res.status(400).json({
        success: false,
        message: "Invalid food ID format",
      });
      return;
    }

    // Check if food exists
    const food = await prisma.food.findUnique({
      where: { id: BigInt(foodId) },
    });

    if (!food) {
      res.status(404).json({
        success: false,
        message: "Food not found",
      });
      return;
    }

    // Build where clause
    const where: any = {
      foodId: BigInt(foodId),
    };

    // Filter by isActive if provided
    if (isActive !== undefined) {
      where.addon = {
        isActive: isActive === "true",
      };
    } else {
      // Default to only active addons
      where.addon = {
        isActive: true,
      };
    }

    // Get food addons
    const foodAddons = await (prisma as any).foodAddon.findMany({
      where,
      select: {
        id: true,
        foodId: true,
        addonId: true,
        isRequired: true,
        maxQuantity: true,
        createdAt: true,
        updatedAt: true,
        addon: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            tag: true,
            frontendComponent: true,
            step: true,
            minPrice: true,
            maxPrice: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert BigInt to string for JSON serialization
    const foodAddonsResponse = foodAddons.map((fa: any) => ({
      id: fa.id.toString(),
      foodId: fa.foodId.toString(),
      addonId: fa.addonId.toString(),
      isRequired: fa.isRequired,
      maxQuantity: fa.maxQuantity,
      createdAt: fa.createdAt,
      updatedAt: fa.updatedAt,
      addon: {
        ...fa.addon,
        id: fa.addon.id.toString(),
        price: fa.addon.price.toString(),
        tag: fa.addon.tag,
        frontendComponent: fa.addon.frontendComponent || "counter",
        step: fa.addon.step?.toString() || null,
        minPrice: fa.addon.minPrice?.toString() || null,
        maxPrice: fa.addon.maxPrice?.toString() || null,
      },
    }));

    res.status(200).json({
      success: true,
      message: "Food addons retrieved successfully",
      data: {
        foodId: foodId,
        addons: foodAddonsResponse,
      },
    });
  }
);
