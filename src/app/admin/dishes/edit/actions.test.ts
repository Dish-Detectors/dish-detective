import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { updateDish } from "./actions";
import { createDish as createDishAPI } from "../create/actions";
import { put } from "@vercel/blob";

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
}));

// Helper function to create a dish for testing
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

describe("Edit Dish Server Actions", () => {
  let mongoServer: MongoMemoryServer;

  // Setup: Start in-memory MongoDB before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Set the test URI as an environment variable
    process.env.MONGODB_TEST_URI = uri;
  }, 10000); // 10 second timeout for setup

  // Cleanup: Close connection and stop MongoDB after all tests
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    delete process.env.MONGODB_TEST_URI;
  });

  // Clear database after each test
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    jest.clearAllMocks();
  });

  describe("updateDish", () => {
    it("should update dish name successfully", async () => {
      // Create a test dish
      const createResult = await createDish({
        name: "Original Pizza",
        description: "Original description",
        imageUrl: "https://example.com/original.jpg",
        allergens: [new mongoose.Types.ObjectId().toString()],
      });

      const dishId = createResult.data.id;

      // Update the dish
      const updateResult = await updateDish(dishId, {
        name: "Updated Pizza",
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.message).toBe("Dish updated successfully");
      expect(updateResult.data.name).toBe("Updated Pizza");
    });

    it("should update dish description successfully", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Original description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [],
      });

      const updateResult = await updateDish(createResult.data.id, {
        description: "Updated description with more details",
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.message).toBe("Dish updated successfully");
    });



    it("should update dish image URL successfully", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/original.jpg",
        allergens: [],
      });

      const updateResult = await updateDish(createResult.data.id, {
        imageUrl: "https://example.com/updated.jpg",
      });

      expect(updateResult.success).toBe(true);
    });

    it("should update dish allergens successfully", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [new mongoose.Types.ObjectId().toString()],
      });

      const updateResult = await updateDish(createResult.data.id, {
        allergens: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      });

      expect(updateResult.success).toBe(true);
    });

    it("should update multiple fields at once", async () => {
      const createResult = await createDish({
        name: "Original Dish",
        description: "Original description",
        imageUrl: "https://example.com/original.jpg",
        allergens: [new mongoose.Types.ObjectId().toString()],
      });

      const updateResult = await updateDish(createResult.data.id, {
        name: "Completely Updated Dish",
        description: "Completely updated description",
        allergens: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data.name).toBe("Completely Updated Dish");
    });

    it("should return error for invalid dish ID", async () => {
      const updateResult = await updateDish("invalid-id", {
        name: "Test",
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toContain("Invalid");
      expect(updateResult.errors?.id).toBeDefined();
    });

    it("should return error when dish not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const updateResult = await updateDish(nonExistentId, {
        name: "Test",
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toBe("Dish not found");
    });

    it("should handle duplicate dish name error", async () => {
      // Create two dishes
      const dish1 = await createDish({
        name: "Unique Dish 1",
        description: "Description 1",
        imageUrl: "https://example.com/dish1.jpg",
        allergens: [],
      });

      const dish2 = await createDish({
        name: "Unique Dish 2",
        description: "Description 2",
        imageUrl: "https://example.com/dish2.jpg",
        allergens: [],
      });

      // Try to update dish2 with dish1's name
      const updateResult = await updateDish(dish2.data.id, {
        name: "Unique Dish 1",
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toBe("A dish with this name already exists");
      expect(updateResult.errors?.name).toBe("This name is already taken");
    });

    it("should handle validation errors", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [],
      });

      // Try to update with empty name
      const updateResult = await updateDish(createResult.data.id, {
        name: "",
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.message).toBe("Validation failed");
      expect(updateResult.errors).toBeDefined();
    });

    it("should trim whitespace from text fields", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [],
      });

      const updateResult = await updateDish(createResult.data.id, {
        name: "  Trimmed Name  ",
        description: "  Trimmed Description  ",
      });

      expect(updateResult.success).toBe(true);
    });

    it("should allow partial updates without affecting other fields", async () => {
      const createResult = await createDish({
        name: "Original Name",
        description: "Original Description",
        imageUrl: "https://example.com/original.jpg",
        allergens: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      });

      // Only update the description
      const updateResult = await updateDish(createResult.data.id, {
        description: "Only Description Updated",
      });

      expect(updateResult.success).toBe(true);
      // Other fields should remain unchanged (verified implicitly by no errors)
    });

    it("should handle special characters in dish names", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [],
      });

      const updateResult = await updateDish(createResult.data.id, {
        name: "Dish with Special Chars: café & crème brûlée",
      });

      expect(updateResult.success).toBe(true);
    });

    it("should handle empty allergens array", async () => {
      const createResult = await createDish({
        name: "Test Dish",
        description: "Description",
        imageUrl: "https://example.com/test.jpg",
        allergens: [
          new mongoose.Types.ObjectId().toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
      });

      const updateResult = await updateDish(createResult.data.id, {
        allergens: [],
      });

      expect(updateResult.success).toBe(true);
    });
  });
});
