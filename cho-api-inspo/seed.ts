import "dotenv/config";
import { prisma } from "./src/prisma.js";

async function main() {
  console.log("Seeding 10 demo foods...");

  // Existing Categories from user:
  // 1: Local
  // 3: Drinks
  // 4: Breakfast
  // 5: Pastries
  // 6: Rice

  const foodsData = [
    {
      name: "Jollof Rice & Chicken",
      description: "Authentic Ghanaian Jollof rice with spicy grilled chicken.",
      price: 25.0,
      imageUrl: "jollof.png",
      restaurantId: 1,
      categoryId: 1, // Local
      isPopular: true,
    },
    {
      name: "Beef Burger Delight",
      description: "Juicy beef patty with fresh toppings and special sauce.",
      price: 35.0,
      imageUrl: "sweet-schawarma.png",
      restaurantId: 2,
      categoryId: 5, // Pastries (closest match)
      isPopular: true,
    },
    {
      name: "Pepperoni Pizza",
      description: "Cheesy pizza topped with premium pepperoni slices.",
      price: 45.0,
      imageUrl: "pizza.png",
      restaurantId: 3,
      categoryId: 5, // Pastries
      isPopular: true,
    },
    {
      name: "Crispy Fried Chicken",
      description: "Golden brown crispy fried chicken pieces.",
      price: 20.0,
      imageUrl: "jollof-chicken1.png",
      restaurantId: 4,
      categoryId: 1, // Local
      isPopular: false,
    },
    {
      name: "Breakfast Club Sandwich",
      description: "Stacked sandwich with egg, ham, and fresh lettuce.",
      price: 18.0,
      imageUrl: "sweet-schawarma.png",
      restaurantId: 5,
      categoryId: 4, // Breakfast
      isPopular: true,
    },
    {
      name: "Assorted Fried Rice",
      description: "Rich fried rice mixed with beef, chicken, and sausages.",
      price: 30.0,
      imageUrl: "jollof.png",
      restaurantId: 6,
      categoryId: 6, // Rice
      isPopular: true,
    },
    {
      name: "Spicy Meat Pie",
      description: "Flaky pastry filled with seasoned minced meat.",
      price: 12.0,
      imageUrl: "pizza.png",
      restaurantId: 1,
      categoryId: 5, // Pastries
      isPopular: false,
    },
    {
      name: "Fried Yam & Fish",
      description: "Crispy fried yam sticks served with fried fish and shito.",
      price: 22.0,
      imageUrl: "fried-yam.png",
      restaurantId: 2,
      categoryId: 1, // Local
      isPopular: false,
    },
    {
      name: "Chilled Fruit Juice",
      description: "Refreshing natural fruit juice blend.",
      price: 10.0,
      imageUrl: "jollof-chicken1.png",
      restaurantId: 3,
      categoryId: 3, // Drinks
      isPopular: true,
    },
    {
      name: "Jollof rice with egg",
      description: "Classic jollof rice served with a boiled egg.",
      price: 15.0,
      imageUrl: "jollof.png",
      restaurantId: 4,
      categoryId: 1, // Local
      isPopular: false,
    },
  ];

  for (const f of foodsData) {
    await prisma.food.create({
      data: {
        name: f.name,
        description: f.description,
        price: f.price,
        imageUrl: f.imageUrl,
        restaurantId: BigInt(f.restaurantId),
        categoryId: BigInt(f.categoryId),
        isPopular: f.isPopular,
        isAvailable: true,
      },
    });
    console.log(`Food "${f.name}" created for Restaurant ${f.restaurantId}.`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
