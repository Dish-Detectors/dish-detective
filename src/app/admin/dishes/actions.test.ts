import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getAllDishes, deleteDish } from "./actions";
import { updateDish } from "./edit/actions";
import { createDish as createDishAPI } from "./create/actions";
import { put } from "@vercel/blob";
import Allergen from "../../../models/Allergen";

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Helper function to convert old createDish format to new FormData format
async function createDish(dishData: {
  name: string;
  description: string;
  imageUrl: string;
  allergens: string[];
}) {
  // Mock the blob upload to return the provided imageUrl
  (put as jest.Mock).mockResolvedValue({ url: dishData.imageUrl });

  const formData = new FormData();
  formData.append("name", dishData.name);
  formData.append("description", dishData.description);
  formData.append("allergens", dishData.allergens.join(","));

  // Create a mock file
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  formData.append("image", mockFile);

  return await createDishAPI(formData);
}

// Ovaj kod je bio napisan uz pomoć UI alata
describe("Dish Server Actions", () => {
  jest.setTimeout(30000);
  let mongoServer: MongoMemoryServer;

  // Setup: Start in-memory MongoDB before all tests
  beforeAll(async () => {
    jest.setTimeout(30000);
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Set the test URI as an environment variable
    process.env.MONGODB_TEST_URI = uri;

    // Connect to the in-memory database
    await mongoose.connect(uri);
  });

  // Cleanup: Close connection and stop MongoDB after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.MONGODB_TEST_URI;
    // Reset the global mongoose cache to prevent interference with other tests
    // @ts-ignore
    global.mongoose = { conn: null, promise: null };
  });

  // Clear database after each test
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  it("should create, modify, retrieve, and delete dishes", async () => {
    // Step 0: Create real allergens
    const gluten = await Allergen.create({ name: "gluten" });
    const dairy = await Allergen.create({ name: "dairy" });
    const eggs = await Allergen.create({ name: "eggs" });
    const basil = await Allergen.create({ name: "basil" });

    // Step 1: Create multiple dishes
    console.log("Step 1: Creating dishes...");

    const dishesData = [
      {
        name: "Margherita Pizza",
        description: "Classic Italian pizza",
        imageUrl: "https://example.com/margherita.jpg",
        allergens: [gluten._id.toString(), dairy._id.toString()],
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing",
        imageUrl: "https://example.com/caesar.jpg",
        allergens: [dairy._id.toString(), eggs._id.toString()],
      },
      {
        name: "Spaghetti Carbonara",
        description: "Pasta with eggs, cheese, and bacon",
        imageUrl: "https://example.com/carbonara.jpg",
        allergens: [
          gluten._id.toString(),
          dairy._id.toString(),
          eggs._id.toString(),
        ],
      },
      {
        name: "Grilled Chicken",
        description: "Tender grilled chicken breast",
        imageUrl: "https://example.com/chicken.jpg",
        allergens: [],
      },
      {
        name: "Tiramisu",
        description: "Italian coffee-flavored dessert",
        imageUrl: "https://example.com/tiramisu.jpg",
        allergens: [
          gluten._id.toString(),
          dairy._id.toString(),
          eggs._id.toString(),
        ],
      },
    ];

    const createdDishIds: string[] = [];

    for (const dishData of dishesData) {
      const result = await createDish(dishData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      createdDishIds.push(result.data.id);
      console.log(`Created dish: ${dishData.name} with ID: ${result.data.id}`);
    }

    expect(createdDishIds).toHaveLength(5);

    // Step 2: Modify some dishes
    console.log("\nStep 2: Modifying dishes...");

    // Update first dish (Margherita Pizza)
    const updateResult1 = await updateDish(createdDishIds[0], {
      description: "Updated: Classic Italian pizza with fresh basil",
      allergens: [
        gluten._id.toString(),
        dairy._id.toString(),
        basil._id.toString(),
      ],
    });
    expect(updateResult1.success).toBe(true);
    console.log(`Updated dish: ${updateResult1.data.name}`);

    // Update third dish (Spaghetti Carbonara)
    const updateResult2 = await updateDish(createdDishIds[2], {
      name: "Spaghetti Carbonara Deluxe",
    });
    expect(updateResult2.success).toBe(true);
    console.log(`Updated dish: ${updateResult2.data.name}`);

    // Update fifth dish (Tiramisu)
    const updateResult3 = await updateDish(createdDishIds[4], {
      imageUrl: "https://example.com/tiramisu-new.jpg",
    });
    expect(updateResult3.success).toBe(true);
    console.log(`Updated dish image: Tiramisu`);

    // Step 3: Retrieve all dishes (should be sorted by name)
    console.log("\nStep 3: Retrieving all dishes...");

    const getAllResult = await getAllDishes();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toBeDefined();
    expect(getAllResult.data).toHaveLength(5);

    console.log(
      `Retrieved ${getAllResult.data.length} dishes (sorted by name):`,
    );
    getAllResult.data.forEach((dish: any, index: number) => {
      console.log(`${index + 1}. ${dish.name}`);
    });

    // Verify sorting by name
    const sortedNames = getAllResult.data.map((d: any) => d.name);
    const expectedOrder = [...sortedNames].sort();
    expect(sortedNames).toEqual(expectedOrder);

    // Verify updates were applied
    const margherita = getAllResult.data.find(
      (d: any) => d.name === "Margherita Pizza",
    );
    expect(margherita.description).toContain("Updated:");

    // Expect length 3 now (gluten, dairy, basil)
    expect(margherita.allergens).toHaveLength(3);

    // Check if checks for 'basil' by name
    const allergenNames = margherita.allergens.map((a: any) => a.name);
    expect(allergenNames).toContain("basil");

    const carbonara = getAllResult.data.find(
      (d: any) => d.name === "Spaghetti Carbonara Deluxe",
    );
    expect(carbonara).toBeDefined();

    const tiramisu = getAllResult.data.find((d: any) => d.name === "Tiramisu");
    expect(tiramisu.imageUrl).toBe("https://example.com/tiramisu-new.jpg");

    // Step 4: Delete all dishes
    console.log("\nStep 4: Deleting dishes...");

    for (const dishId of createdDishIds) {
      const deleteResult = await deleteDish(dishId);
      expect(deleteResult.success).toBe(true);
      console.log(`Deleted dish with ID: ${dishId}`);
    }

    // Verify all dishes are deleted
    const finalGetAllResult = await getAllDishes();
    expect(finalGetAllResult.success).toBe(true);
    expect(finalGetAllResult.data).toHaveLength(0);
    console.log("\nAll dishes successfully deleted!");
  });

  it("should handle errors correctly", async () => {
    // Test invalid dish ID for update
    const invalidUpdateResult = await updateDish("invalid-id", {
      name: "Test",
    });
    expect(invalidUpdateResult.success).toBe(false);
    expect(invalidUpdateResult.message).toContain("Invalid");

    // Test deleting non-existent dish
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const deleteResult = await deleteDish(nonExistentId);
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.message).toContain("not found");

    // Test creating dish with missing required fields
    const invalidCreateResult = await createDish({
      name: "",
      description: "Test",
      imageUrl: "test.jpg",
      allergens: [],
    });
    expect(invalidCreateResult.success).toBe(false);
    expect(invalidCreateResult.errors).toBeDefined();
  });
});
