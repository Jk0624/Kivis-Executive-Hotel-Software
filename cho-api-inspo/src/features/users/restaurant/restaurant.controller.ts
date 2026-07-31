import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { RestaurantStatus, VerificationStatus } from "../../../generated/prisma/enums.js";
import {
  AddRestaurantRequestBody,
  UpdateRestaurantRequestBody,
} from "./restaurant.types.js";
import { calculateHaversineDistance } from "../../../utils/distance.js";

const USER_MAX_DISTANCE_KM = parseInt(process.env.USER_MAX_DISTANCE_KM || "20", 10);

// 1. Add Restaurant
export const addRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      phone,
      email,
      addressLine,
      latitude,
      longitude,
      imageUrl,
      rating,
      status,
      isPopular,
    }: AddRestaurantRequestBody = req.body;

    // Validation
    if (
      !name ||
      !addressLine ||
      latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, addressLine, latitude, and longitude are required",
      });
      return;
    }

    // Validate coordinates
    const latNum =
      typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lngNum =
      typeof longitude === "string" ? parseFloat(longitude) : longitude;

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      res.status(400).json({
        success: false,
        message: "Latitude must be a number between -90 and 90",
      });
      return;
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      res.status(400).json({
        success: false,
        message: "Longitude must be a number between -180 and 180",
      });
      return;
    }

    // Validate rating if provided
    let ratingNum: number | undefined;
    if (rating !== undefined) {
      ratingNum = typeof rating === "string" ? parseFloat(rating) : rating;
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
        res.status(400).json({
          success: false,
          message: "Rating must be a number between 0 and 5",
        });
        return;
      }
    }

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description || null,
        phone: phone || null,
        email: email || null,
        addressLine,
        latitude: latNum,
        longitude: lngNum,
        imageUrl: imageUrl || null,
        rating: ratingNum || 0,
        status: (status as RestaurantStatus) || RestaurantStatus.PENDING,
        isPopular: isPopular !== undefined ? isPopular : false,
      },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert BigInt and Decimal to string for JSON serialization
    const restaurantResponse = {
      ...restaurant,
      id: restaurant.id.toString(),
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      rating: restaurant.rating?.toString() || null,
    };

    res.status(201).json({
      success: true,
      message: "Restaurant added successfully",
      data: restaurantResponse,
    });
  }
);

// 2. Get All Restaurants
export const getAllRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      status,
      isPopular,
      page,
      limit: limitParam,
      search,
      categoryId,
      latitude,
      longitude,
    } = req.query;

    // Parse user location for distance filtering
    const userLat = latitude ? parseFloat(latitude as string) : null;
    const userLng = longitude ? parseFloat(longitude as string) : null;
    const hasUserLocation = userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng);

    // Support both pagination (page) and simple limit
    let take: number;
    let skip: number = 0;
    let usePagination = false;

    if (page) {
      // Pagination mode
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt((limitParam as string) || "20", 10);
      take = limitNum;
      skip = (pageNum - 1) * limitNum;
      usePagination = true;
    } else if (limitParam) {
      // Simple limit mode (no pagination)
      take = parseInt(limitParam as string, 10);
      skip = 0;
    } else {
      // Default: no limit
      take = undefined as any;
    }

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

    // Build base filters — only show verified restaurants of active vendors
    const baseFilters: any = {
      verificationStatus: VerificationStatus.VERIFIED,
      status: { not: RestaurantStatus.PENDING },
      vendor: { isActive: true },
      ...(boundingBox ?? {}),
    };
    if (isPopular !== undefined) {
      baseFilters.isPopular = isPopular === "true";
    }
    // Filter by category if provided
    if (categoryId && typeof categoryId === "string" && categoryId !== "All") {
      baseFilters.foods = {
        some: {
          categoryId: BigInt(categoryId),
        },
      };
    }

    // Build where clause - combine base filters with search if provided
    const where: any = {};

    if (search && typeof search === "string" && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchCondition = {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            addressLine: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      };

      // Combine base filters with search using AND
      const andConditions: any[] = [];

      // Add base filters if any exist
      if (Object.keys(baseFilters).length > 0) {
        andConditions.push(baseFilters);
      }

      // Add search condition
      andConditions.push(searchCondition);

      // Use AND to combine everything
      where.AND = andConditions;
    } else {
      // No search, just use base filters
      Object.assign(where, baseFilters);
    }

    // Get restaurants - lightweight fields only
    const queryOptions: any = {
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        addressLine: true,
        latitude: true,
        longitude: true,
        rating: true,
        status: true,
        foods: {
          select: {
            price: true,
          },
          where: {
            isAvailable: true,
          },
        },
      },
    };

    if (take !== undefined) {
      queryOptions.take = take;
      queryOptions.skip = skip;
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany(queryOptions),
      prisma.restaurant.count({ where }),
    ]);

    // Calculate lowest food price and distance for each restaurant
    let restaurantsResponse = restaurants.map((restaurant: any) => {
      const prices = restaurant.foods.map((food: any) => Number(food.price));
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

      let distance: number | null = null;
      if (hasUserLocation) {
        distance = calculateHaversineDistance(
          userLat!,
          userLng!,
          Number(restaurant.latitude),
          Number(restaurant.longitude),
        );
      }

      return {
        id: restaurant.id.toString(),
        name: restaurant.name,
        rating: restaurant.rating?.toString() || null,
        imageUrl: restaurant.imageUrl,
        addressLine: restaurant.addressLine,
        status: restaurant.status,
        lowestPrice,
        distance: distance !== null ? Math.round(distance * 10) / 10 : null,
      };
    });

    // Filter by distance if user location is provided
    if (hasUserLocation) {
      restaurantsResponse = restaurantsResponse.filter(
        (r) => r.distance !== null && r.distance <= USER_MAX_DISTANCE_KM,
      );
      // Sort by distance (nearest first)
      restaurantsResponse.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    const filteredTotal = hasUserLocation ? restaurantsResponse.length : total;

    const response: any = {
      success: true,
      message: "Restaurants retrieved successfully",
      data: {
        restaurants: restaurantsResponse,
      },
    };

    // Include pagination only if page query param was provided
    if (usePagination) {
      response.data.pagination = {
        page: parseInt(page as string, 10),
        limit: take,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / take),
      };
    } else {
      response.data.total = filteredTotal;
    }

    res.status(200).json(response);
  }
);

// 3. Get Single Restaurant
export const getSingleRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { popularFoods } = req.query;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
      return;
    }

    // Build foods where clause
    const foodsWhere: any = {};
    if (popularFoods === "true") {
      foodsWhere.isPopular = true;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(id) },
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
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        foods: {
          where: foodsWhere,
          select: {
            id: true,
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
            isPopular: true,
          },
        },
        _count: {
          select: {
            foods: true,
          },
        },
      },
    });

    if (!restaurant || restaurant.verificationStatus !== VerificationStatus.VERIFIED) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Convert BigInt and Decimal to string for JSON serialization
    const restaurantResponse = {
      id: restaurant.id.toString(),
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone,
      email: restaurant.email,
      addressLine: restaurant.addressLine,
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      imageUrl: restaurant.imageUrl,
      rating: restaurant.rating?.toString() || null,
      status: restaurant.status,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      foods: restaurant.foods.map((food: any) => ({
        id: food.id.toString(),
        name: food.name,
        description: food.description,
        price: food.price.toString(),
        imageUrl: food.imageUrl,
        category: food.category
          ? {
              id: food.category.id.toString(),
              name: food.category.name,
              slug: food.category.slug,
            }
          : null,
        isAvailable: food.isAvailable,
        isPopular: food.isPopular,
      })),
      _count: restaurant._count,
    };

    res.status(200).json({
      success: true,
      message: "Restaurant retrieved successfully",
      data: restaurantResponse,
    });
  }
);

// 4. Update Restaurant
export const updateRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const {
      name,
      description,
      phone,
      email,
      addressLine,
      latitude,
      longitude,
      imageUrl,
      rating,
      status,
      isPopular,
    }: UpdateRestaurantRequestBody = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
      return;
    }

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRestaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (addressLine !== undefined) updateData.addressLine = addressLine;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (status !== undefined) updateData.status = status as RestaurantStatus;
    if (isPopular !== undefined) updateData.isPopular = isPopular;

    // Validate and update coordinates if provided
    if (latitude !== undefined) {
      const latNum =
        typeof latitude === "string" ? parseFloat(latitude) : latitude;
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        res.status(400).json({
          success: false,
          message: "Latitude must be a number between -90 and 90",
        });
        return;
      }
      updateData.latitude = latNum;
    }

    if (longitude !== undefined) {
      const lngNum =
        typeof longitude === "string" ? parseFloat(longitude) : longitude;
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        res.status(400).json({
          success: false,
          message: "Longitude must be a number between -180 and 180",
        });
        return;
      }
      updateData.longitude = lngNum;
    }

    // Validate and update rating if provided
    if (rating !== undefined) {
      const ratingNum =
        typeof rating === "string" ? parseFloat(rating) : rating;
      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
        res.status(400).json({
          success: false,
          message: "Rating must be a number between 0 and 5",
        });
        return;
      }
      updateData.rating = ratingNum;
    }

    // Update restaurant
    const restaurant = await prisma.restaurant.update({
      where: { id: BigInt(id) },
      data: updateData,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert BigInt and Decimal to string for JSON serialization
    const restaurantResponse = {
      ...restaurant,
      id: restaurant.id.toString(),
      latitude: restaurant.latitude.toString(),
      longitude: restaurant.longitude.toString(),
      rating: restaurant.rating?.toString() || null,
    };

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurantResponse,
    });
  }
);

// 5. Delete Restaurant
export const deleteRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
      return;
    }

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingRestaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    // Delete restaurant (cascade will delete associated foods)
    await prisma.restaurant.delete({
      where: { id: BigInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  }
);
