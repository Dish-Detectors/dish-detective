import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createDish } from "./actions";
import { put } from "@vercel/blob";
import Allergen from "../../../../models/Allergen";

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
}));

describe("Create Dish Server Actions", () => {
  jest.setTimeout(30000);
  let mongoServer: MongoMemoryServer;

  // Setup: Start in-memory MongoDB before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Set the test URI as an environment variable
    process.env.MONGODB_TEST_URI = uri;

    // Ensure indexes are built for the duplicates test
    const conn = await mongoose.connect(uri);
    // @ts-ignore
    await conn.model("Dish").init();
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
    jest.clearAllMocks();
  });

  it("should create a dish with image upload", async () => {
    const gluten = await Allergen.create({ name: "gluten" });
    const dairy = await Allergen.create({ name: "dairy" });

    // Mock the Vercel Blob upload
    const mockBlobUrl = "https://blob.vercel-storage.com/test-image.jpg";
    (put as jest.Mock).mockResolvedValue({ url: mockBlobUrl });

    // Create FormData
    const formData = new FormData();
    formData.append("name", "Test Pizza");
    formData.append("description", "Delicious test pizza");
    // Ensure no spaces or validation
    formData.append("allergens", `${gluten._id},${dairy._id}`);

    // Create a mock file
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("image", mockFile);

    const result = await createDish(formData);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.imageUrl).toBe(mockBlobUrl);
    expect(put).toHaveBeenCalledWith(
      expect.stringContaining("dishes/"),
      expect.objectContaining({ name: "test.jpg" }),
      { access: "public" },
    );
  });

  it("should create a dish with small image file", async () => {
    // Mock successful upload
    const mockBlobUrl = "https://blob.vercel-storage.com/small-image.jpg";
    (put as jest.Mock).mockResolvedValue({ url: mockBlobUrl });

    const formData = new FormData();
    formData.append("name", "Simple Salad");
    formData.append("description", "Fresh green salad");
    formData.append("allergens", "");

    // Provide a small image with content
    const mockFile = new File(["small content"], "small.jpg", {
      type: "image/jpeg",
    });
    formData.append("image", mockFile);

    const result = await createDish(formData);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.imageUrl).toBe(mockBlobUrl);
    expect(put).toHaveBeenCalledWith(
      expect.stringContaining("dishes/"),
      expect.objectContaining({ name: "small.jpg" }),
      { access: "public" },
    );
  });

  it("should handle allergens correctly", async () => {
    const peanuts = await Allergen.create({ name: "peanuts" });
    const gluten = await Allergen.create({ name: "gluten" });
    const soy = await Allergen.create({ name: "soy" });

    const mockBlobUrl = "https://blob.vercel-storage.com/peanut-sandwich.jpg";
    (put as jest.Mock).mockResolvedValue({ url: mockBlobUrl });

    const formData = new FormData();
    formData.append("name", "Peanut Butter Sandwich");
    formData.append("description", "Classic PB sandwich");
    formData.append("allergens", `${peanuts._id},${gluten._id},${soy._id}`);

    const mockFile = new File(["test"], "sandwich.jpg", { type: "image/jpeg" });
    formData.append("image", mockFile);

    const result = await createDish(formData);

    expect(result.success).toBe(true);

    // Verify allergens were parsed correctly
    const conn = await mongoose.connection;
    const DishModel = conn.model("Dish");
    // Populate to check names
    const dish = await DishModel.findById(result.data.id).populate("allergens");

    expect(dish.allergens).toHaveLength(3);
    const names = dish.allergens.map((a: any) => a.name);
    expect(names).toContain("peanuts");
    expect(names).toContain("gluten");
    expect(names).toContain("soy");
  });

  it("should fail with missing required fields", async () => {
    const formData = new FormData();
    formData.append("name", "Incomplete Dish");
    // Missing description
    // Missing image

    const result = await createDish(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Missing required fields");
    expect(result.errors).toBeDefined();
    expect(result.errors?.description).toBeDefined();
  });

  it("should handle duplicate dish names", async () => {
    const mockBlobUrl = "https://blob.vercel-storage.com/pizza.jpg";
    (put as jest.Mock).mockResolvedValue({ url: mockBlobUrl });

    // Create first dish
    const formData1 = new FormData();
    formData1.append("name", "Unique Pizza");
    formData1.append("description", "First pizza");
    const mockFile1 = new File(["test"], "pizza1.jpg", { type: "image/jpeg" });
    formData1.append("image", mockFile1);

    const result1 = await createDish(formData1);
    expect(result1.success).toBe(true);

    // Try to create duplicate
    const formData2 = new FormData();
    formData2.append("name", "Unique Pizza");
    formData2.append("description", "Second pizza");
    const mockFile2 = new File(["test"], "pizza2.jpg", { type: "image/jpeg" });
    formData2.append("image", mockFile2);

    const result2 = await createDish(formData2);

    expect(result2.success).toBe(false);
    expect(result2.message).toBe("A dish with this name already exists");
    expect(result2.errors?.name).toBe("This name is already taken");
  });

  it("should handle image upload failure", async () => {
    // Mock failed upload
    (put as jest.Mock).mockRejectedValue(new Error("Upload failed"));

    const formData = new FormData();
    formData.append("name", "Test Dish");
    formData.append("description", "Test description");

    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("image", mockFile);

    const result = await createDish(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to upload image");
    expect(result.errors?.image).toBe("Image upload failed");
  });

  it("should trim whitespace from inputs", async () => {
    const dairy = await Allergen.create({ name: "dairy" });
    const gluten = await Allergen.create({ name: "gluten" });
    const eggs = await Allergen.create({ name: "eggs" });

    const mockBlobUrl = "https://blob.vercel-storage.com/spaced-pizza.jpg";
    (put as jest.Mock).mockResolvedValue({ url: mockBlobUrl });

    const formData = new FormData();
    formData.append("name", "  Spaced Pizza  ");
    formData.append("description", "  Spaced description  ");
    // Use IDs, comma separated.
    formData.append("allergens", `${dairy._id},${gluten._id},${eggs._id}`);
    const mockFile = new File(["test"], "pizza.jpg", { type: "image/jpeg" });
    formData.append("image", mockFile);

    const result = await createDish(formData);

    expect(result.success).toBe(true);

    const conn = await mongoose.connection;
    const DishModel = conn.model("Dish");
    // No populate, check IDs
    const dish = await DishModel.findById(result.data.id);

    expect(dish.name).toBe("Spaced Pizza");
    expect(dish.description).toBe("Spaced description");

    const storedIds = dish.allergens.map((id: any) => id.toString());
    expect(storedIds).toContain(dairy._id.toString());
    expect(storedIds).toContain(gluten._id.toString());
    expect(storedIds).toContain(eggs._id.toString());
  });
});
