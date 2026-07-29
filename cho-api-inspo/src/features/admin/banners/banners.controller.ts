import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { uploadToS3, deleteFromS3 } from "../../../utils/s3.js";
import { logAdminAction } from "../audit.service.js";

const serializeBanner = (b: {
  id: bigint;
  title: string;
  imageUrl: string;
  link: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: b.id.toString(),
  title: b.title,
  imageUrl: b.imageUrl,
  link: b.link,
  isActive: b.isActive,
  displayOrder: b.displayOrder,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

export const listBanners = asyncHandler(
  async (_req: AdminAuthRequest, res: Response) => {
    const banners = await prisma.banner.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    res.status(200).json({
      success: true,
      data: banners.map(serializeBanner),
    });
  },
);

export const getBanner = asyncHandler(
  async (req: AdminAuthRequest, res: Response) => {
    const id = req.params.id as string;
    const banner = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });

    if (!banner) {
      res.status(404).json({ success: false, message: "Banner not found." });
      return;
    }

    res.status(200).json({ success: true, data: serializeBanner(banner) });
  },
);

export const createBanner = asyncHandler(
  async (req: AdminAuthRequest, res: Response) => {
    const { title, link, isActive, displayOrder } = req.body as {
      title?: string;
      link?: string;
      isActive?: boolean;
      displayOrder?: number;
    };

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res
        .status(400)
        .json({ success: false, message: "title is required." });
      return;
    }

    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "image file is required." });
      return;
    }

    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      "banners",
    );

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        imageUrl,
        link: link?.trim() || null,
        isActive: isActive ?? true,
        displayOrder: displayOrder ?? 0,
      },
    });

    await logAdminAction({
      adminId: req.adminId!,
      action: "CREATE_BANNER",
      targetType: "banner",
      targetId: banner.id.toString(),
      meta: { title: banner.title },
    });

    res
      .status(201)
      .json({ success: true, data: serializeBanner(banner) });
  },
);

export const updateBanner = asyncHandler(
  async (req: AdminAuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { title, link, isActive, displayOrder } = req.body as {
      title?: string;
      link?: string | null;
      isActive?: boolean;
      displayOrder?: number;
    };

    const existing = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: "Banner not found." });
      return;
    }

    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        "banners",
      );
      await deleteFromS3(existing.imageUrl);
    }

    const updated = await prisma.banner.update({
      where: { id: BigInt(id) },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(link !== undefined && { link: link?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
        imageUrl,
      },
    });

    await logAdminAction({
      adminId: req.adminId!,
      action: "UPDATE_BANNER",
      targetType: "banner",
      targetId: id,
    });

    res.status(200).json({ success: true, data: serializeBanner(updated) });
  },
);

export const deleteBanner = asyncHandler(
  async (req: AdminAuthRequest, res: Response) => {
    const id = req.params.id as string;

    const existing = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: "Banner not found." });
      return;
    }

    await prisma.banner.delete({ where: { id: BigInt(id) } });
    await deleteFromS3(existing.imageUrl);

    await logAdminAction({
      adminId: req.adminId!,
      action: "DELETE_BANNER",
      targetType: "banner",
      targetId: id,
      meta: { title: existing.title },
    });

    res.status(200).json({ success: true, message: "Banner deleted." });
  },
);
