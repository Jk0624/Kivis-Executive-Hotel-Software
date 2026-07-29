import { prisma } from "../prisma.js";

export const checkRiderAvailability = async (params: {
  email?: string;
  phone?: string;
  excludeRiderId?: bigint;
}) => {
  const { email, phone, excludeRiderId } = params;

  if (email) {
    const existing = await prisma.rider.findUnique({
      where: { email },
    });

    if (existing && (!excludeRiderId || existing.id !== excludeRiderId)) {
      return {
        available: false,
        conflict: "email",
        message:
          "An account with this email already exists. Please try logging in instead.",
      };
    }
  }

  if (phone) {
    const existing = await prisma.rider.findUnique({
      where: { phone },
    });

    if (existing && (!excludeRiderId || existing.id !== excludeRiderId)) {
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
