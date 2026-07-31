import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";

export const listActiveBanners = asyncHandler(
  async (_req: Request, res: Response) => {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        imageUrl: true,
        link: true,
      },
    });

    res.status(200).json({
      success: true,
      data: banners.map((b) => ({
        id: b.id.toString(),
        imageUrl: b.imageUrl,
        link: b.link,
      })),
    });
  },
);
