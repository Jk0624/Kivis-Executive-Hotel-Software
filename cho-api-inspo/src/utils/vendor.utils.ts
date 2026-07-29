import { prisma } from "../prisma.js";

export const checkVendorAvailability = async (params: {
  email?: string;
  phone?: string;
  excludeVendorId?: bigint;
}) => {
  const { email, phone, excludeVendorId } = params;

  if (email) {
    const existing = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existing && (!excludeVendorId || existing.id !== excludeVendorId)) {
      return {
        available: false,
        conflict: "email",
        message:
          "An account with this email already exists. Please try logging in instead.",
      };
    }
  }

  if (phone) {
    const existing = await prisma.vendor.findUnique({
      where: { phone },
    });

    if (existing && (!excludeVendorId || existing.id !== excludeVendorId)) {
      return {
        available: false,
        conflict: "phone",
        message:
          "An account with this phone number already exists. Please try logging in instead.",
      };
    }
  }

  return { available: true };
};
