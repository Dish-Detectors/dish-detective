import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getAllRestaurants, deleteRestaurant } from "./actions";
import { createRestaurant } from "./create/actions";
import { updateRestaurant } from "./edit/actions";

describe("Restaurant Server Actions", () => {
  let mongoServer: MongoMemoryServer;
  const STANDARD_HOURS = [
    { day: 1, shifts: [{ start: "08:00", end: "20:00" }] },
  ];

  // Setup: Start in-memory MongoDB before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Set the test URI as an environment variable
    process.env.MONGODB_TEST_URI = uri;
  });

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
  });

  it("should create, modify, retrieve, and delete restaurants", async () => {
    // Step 1: Create multiple restaurants
    console.log("Step 1: Creating restaurants...");

    const restaurantsData = [
      {
        name: "Pizza Paradise",
        address: "123 Main St, New York, NY 10001",
        imageUrl: "https://example.com/pizza-paradise.jpg",
        workingHours: [
          { day: 1, shifts: [{ start: "11:00", end: "22:00" }] },
          { day: 2, shifts: [{ start: "11:00", end: "22:00" }] },
          { day: 3, shifts: [{ start: "11:00", end: "22:00" }] },
          { day: 4, shifts: [{ start: "11:00", end: "22:00" }] },
          { day: 5, shifts: [{ start: "11:00", end: "22:00" }] },
          { day: 6, shifts: [{ start: "12:00", end: "23:00" }] },
          { day: 0, shifts: [{ start: "12:00", end: "23:00" }] },
        ],
        location: {
          type: "Point" as const,
          coordinates: [-73.935242, 40.73061] as [number, number],
        },
      },
      {
        name: "Sushi House",
        address: "456 Oak Ave, Los Angeles, CA 90001",
        imageUrl: "https://example.com/sushi-house.jpg",
        workingHours: [
          { day: 1, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 2, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 3, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 4, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 5, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 6, shifts: [{ start: "12:00", end: "22:00" }] },
          { day: 0, shifts: [{ start: "12:00", end: "22:00" }] },
        ],
        location: {
          type: "Point" as const,
          coordinates: [-118.243683, 34.052235] as [number, number],
        },
      },
      {
        name: "Burger Joint",
        address: "789 Elm St, Chicago, IL 60601",
        imageUrl: "https://example.com/burger-joint.jpg",
        workingHours: [
          { day: 1, shifts: [{ start: "11:00", end: "21:00" }] },
          { day: 2, shifts: [{ start: "11:00", end: "21:00" }] },
          { day: 3, shifts: [{ start: "11:00", end: "21:00" }] },
          { day: 4, shifts: [{ start: "11:00", end: "21:00" }] },
          { day: 5, shifts: [{ start: "11:00", end: "23:00" }] },
          { day: 6, shifts: [{ start: "11:00", end: "23:00" }] },
          { day: 0, shifts: [{ start: "11:00", end: "23:00" }] },
        ],
        location: {
          type: "Point" as const,
          coordinates: [-87.629799, 41.878113] as [number, number],
        },
      },
      {
        name: "Taco Fiesta",
        address: "321 Pine St, Austin, TX 78701",
        imageUrl: "https://example.com/taco-fiesta.jpg",
        workingHours: [
          { day: 1, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 2, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 3, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 4, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 5, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 6, shifts: [{ start: "10:00", end: "22:00" }] },
          { day: 0, shifts: [{ start: "10:00", end: "22:00" }] },
        ],
        location: {
          type: "Point" as const,
          coordinates: [-97.743061, 30.267153] as [number, number],
        },
      },
      {
        name: "Pasta Palace",
        address: "654 Maple Dr, Miami, FL 33101",
        imageUrl: "https://example.com/pasta-palace.jpg",
        workingHours: [
          { day: 2, shifts: [{ start: "17:00", end: "23:00" }] },
          { day: 3, shifts: [{ start: "17:00", end: "23:00" }] },
          { day: 4, shifts: [{ start: "17:00", end: "23:00" }] },
          { day: 5, shifts: [{ start: "17:00", end: "23:00" }] },
          { day: 6, shifts: [{ start: "17:00", end: "23:00" }] },
          { day: 0, shifts: [{ start: "17:00", end: "23:00" }] },
        ],
        location: {
          type: "Point" as const,
          coordinates: [-80.191788, 25.761681] as [number, number],
        },
      },
    ];

    const createdRestaurantIds: string[] = [];

    for (const restaurantData of restaurantsData) {
      const result = await createRestaurant(restaurantData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      createdRestaurantIds.push(result.data.id);
      console.log(
        `Created restaurant: ${restaurantData.name} with ID: ${result.data.id}`,
      );
    }

    expect(createdRestaurantIds).toHaveLength(5);

    // Step 2: Modify some restaurants
    console.log("\nStep 2: Modifying restaurants...");

    // Update first restaurant (Pizza Paradise)
    const updateResult1 = await updateRestaurant(createdRestaurantIds[0], {
      address: "123 Main St, Suite 100, New York, NY 10001",
      workingHours: [{ day: 1, shifts: [{ start: "11:00", end: "23:00" }] }],
    });
    expect(updateResult1.success).toBe(true);

    // Update third restaurant (Burger Joint)
    const updateResult2 = await updateRestaurant(createdRestaurantIds[2], {
      name: "Burger Joint Premium",
      imageUrl: "https://example.com/burger-joint-premium.jpg",
      location: {
        type: "Point" as const,
        coordinates: [-87.63, 41.8782], // Slightly different location
      },
    });
    expect(updateResult2.success).toBe(true);

    // Update fifth restaurant (Pasta Palace)
    const updateResult3 = await updateRestaurant(createdRestaurantIds[4], {
      workingHours: [{ day: 1, shifts: [{ start: "17:00", end: "23:59" }] }],
    });
    expect(updateResult3.success).toBe(true);
    console.log(`Updated working hours for: Pasta Palace`);

    // Step 3: Retrieve all restaurants (should be sorted by name)
    console.log("\nStep 3: Retrieving all restaurants...");

    const getAllResult = await getAllRestaurants();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toBeDefined();
    expect(getAllResult.data).toHaveLength(5);

    console.log(
      `Retrieved ${getAllResult.data.length} restaurants (sorted by name):`,
    );
    getAllResult.data.forEach((restaurant: any, index: number) => {
      console.log(`${index + 1}. ${restaurant.name} - ${restaurant.address}`);
    });

    // Verify sorting by name
    const sortedNames = getAllResult.data.map((r: any) => r.name);
    const expectedOrder = [...sortedNames].sort();
    expect(sortedNames).toEqual(expectedOrder);

    // Verify updates were applied
    const pizzaParadise = getAllResult.data.find(
      (r: any) => r.name === "Pizza Paradise",
    );
    expect(pizzaParadise.address).toContain("Suite 100");
    expect(pizzaParadise.workingHours).toHaveLength(1);
    expect(pizzaParadise.workingHours[0].shifts[0].start).toBe("11:00");

    const burgerJoint = getAllResult.data.find(
      (r: any) => r.name === "Burger Joint Premium",
    );
    expect(burgerJoint).toBeDefined();
    expect(burgerJoint.imageUrl).toBe(
      "https://example.com/burger-joint-premium.jpg",
    );
    expect(burgerJoint.location.coordinates[0]).toBeCloseTo(-87.63);

    const pastaPalace = getAllResult.data.find(
      (r: any) => r.name === "Pasta Palace",
    );
    expect(pastaPalace.workingHours).toHaveLength(1);
    expect(pastaPalace.workingHours[0].shifts[0].end).toBe("23:59");

    // Verify GeoJSON structure
    getAllResult.data.forEach((restaurant: any) => {
      expect(restaurant.location.type).toBe("Point");
      expect(restaurant.location.coordinates).toHaveLength(2);
      expect(typeof restaurant.location.coordinates[0]).toBe("number");
      expect(typeof restaurant.location.coordinates[1]).toBe("number");
    });

    // Step 4: Delete all restaurants
    console.log("\nStep 4: Deleting restaurants...");

    for (const restaurantId of createdRestaurantIds) {
      const deleteResult = await deleteRestaurant(restaurantId);
      expect(deleteResult.success).toBe(true);
      console.log(`Deleted restaurant with ID: ${restaurantId}`);
    }

    // Verify all restaurants are deleted
    const finalGetAllResult = await getAllRestaurants();
    expect(finalGetAllResult.success).toBe(true);
    expect(finalGetAllResult.data).toHaveLength(0);
    console.log("\nAll restaurants successfully deleted!");
  });

  it("should handle errors correctly", async () => {
    // Test invalid restaurant ID for update
    const invalidUpdateResult = await updateRestaurant("invalid-id", {
      name: "Test Restaurant",
    });
    expect(invalidUpdateResult.success).toBe(false);
    expect(invalidUpdateResult.message).toContain("Invalid");

    // Test deleting non-existent restaurant
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const deleteResult = await deleteRestaurant(nonExistentId);
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.message).toContain("not found");

    // Test creating restaurant with missing required fields
    const invalidCreateResult = await createRestaurant({
      name: "",
      address: "Test Address",
      imageUrl: "test.jpg",
      workingHours: [],
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });
    expect(invalidCreateResult.success).toBe(false);
    expect(invalidCreateResult.errors).toBeDefined();
  });

  it("should handle geospatial queries correctly", async () => {
    // Create restaurants at different locations
    const restaurant1 = await createRestaurant({
      name: "Central Restaurant",
      address: "100 Center St",
      imageUrl: "https://example.com/central.jpg",
      workingHours: STANDARD_HOURS,
      location: {
        type: "Point",
        coordinates: [0, 0], // Origin point
      },
    });

    const restaurant2 = await createRestaurant({
      name: "Nearby Restaurant",
      address: "200 Near St",
      imageUrl: "https://example.com/nearby.jpg",
      workingHours: STANDARD_HOURS,
      location: {
        type: "Point",
        coordinates: [0.01, 0.01], // Close to origin
      },
    });

    expect(restaurant1.success).toBe(true);
    expect(restaurant2.success).toBe(true);

    // Retrieve all and verify locations are preserved correctly
    const allRestaurants = await getAllRestaurants();
    expect(allRestaurants.data).toHaveLength(2);

    const central = allRestaurants.data.find(
      (r: any) => r.name === "Central Restaurant",
    );
    expect(central.location.coordinates[0]).toBe(0);
    expect(central.location.coordinates[1]).toBe(0);
  });

  it("should handle partial updates without affecting other fields", async () => {
    // Create a restaurant
    const createResult = await createRestaurant({
      name: "Original Name",
      address: "Original Address",
      imageUrl: "https://example.com/original.jpg",
      workingHours: [
        { day: 1, shifts: [{ start: "09:00", end: "17:00" }] },
        { day: 6, shifts: [{ start: "10:00", end: "18:00" }] },
      ],
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    expect(createResult.success).toBe(true);
    const restaurantId = createResult.data.id;

    // Update only the name
    await updateRestaurant(restaurantId, {
      name: "Updated Name",
    });

    // Retrieve and verify only name changed
    const restaurants = await getAllRestaurants();
    const updated = restaurants.data.find((r: any) => r._id === restaurantId);

    expect(updated.name).toBe("Updated Name");
    expect(updated.address).toBe("Original Address");
    expect(updated.imageUrl).toBe("https://example.com/original.jpg");
    expect(updated.workingHours).toHaveLength(2);
    expect(updated.location.coordinates[0]).toBe(-73.935242);
  });

  it("should validate working hours array is not empty", async () => {
    const result = await createRestaurant({
      name: "Test Restaurant",
      address: "123 Test St",
      imageUrl: "https://example.com/test.jpg",
      workingHours: [], // Empty array
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors || result.message).toBeDefined();
  });

  it("should handle updating multiple restaurants independently", async () => {
    // Create two restaurants
    const restaurant1 = await createRestaurant({
      name: "Restaurant A",
      address: "Address A",
      imageUrl: "https://example.com/a.jpg",
      workingHours: [{ day: 1, shifts: [{ start: "09:00", end: "17:00" }] }],
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    const restaurant2 = await createRestaurant({
      name: "Restaurant B",
      address: "Address B",
      imageUrl: "https://example.com/b.jpg",
      workingHours: [{ day: 1, shifts: [{ start: "10:00", end: "22:00" }] }],
      location: {
        type: "Point",
        coordinates: [-74.006, 40.714],
      },
    });

    expect(restaurant1.success).toBe(true);
    expect(restaurant2.success).toBe(true);

    // Update restaurant 1
    await updateRestaurant(restaurant1.data.id, {
      name: "Restaurant A Updated",
    });

    // Update restaurant 2
    await updateRestaurant(restaurant2.data.id, {
      address: "Address B Updated",
    });

    // Verify both updates
    const allRestaurants = await getAllRestaurants();
    const updatedA = allRestaurants.data.find(
      (r: any) => r._id === restaurant1.data.id,
    );
    const updatedB = allRestaurants.data.find(
      (r: any) => r._id === restaurant2.data.id,
    );

    expect(updatedA.name).toBe("Restaurant A Updated");
    expect(updatedA.address).toBe("Address A"); // Unchanged

    expect(updatedB.name).toBe("Restaurant B"); // Unchanged
    expect(updatedB.address).toBe("Address B Updated");
  });

  it("should handle restaurants with special characters in names", async () => {
    const restaurantsWithSpecialChars = [
      "Joe's Pizza & Pasta",
      "Café François",
      "Sushi 寿司 House",
      "El Señor's Taquería",
      "O'Malley's Pub",
    ];

    for (const name of restaurantsWithSpecialChars) {
      const result = await createRestaurant({
        name,
        address: "123 Test St",
        imageUrl: "https://example.com/test.jpg",
        workingHours: STANDARD_HOURS,
        location: {
          type: "Point",
          coordinates: [-73.935242, 40.73061],
        },
      });

      expect(result.success).toBe(true);
    }

    const allRestaurants = await getAllRestaurants();
    expect(allRestaurants.data).toHaveLength(5);
  });

  it("should handle very long working hours arrays", async () => {
    const longWorkingHours = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      shifts: [
        { start: "08:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
        { start: "18:00", end: "22:00" },
      ],
    }));

    const result = await createRestaurant({
      name: "Detailed Hours Restaurant",
      address: "123 Test St",
      imageUrl: "https://example.com/test.jpg",
      workingHours: longWorkingHours,
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    expect(result.success).toBe(true);

    const restaurants = await getAllRestaurants();
    const created = restaurants.data.find(
      (r: any) => r.name === "Detailed Hours Restaurant",
    );
    expect(created.workingHours).toHaveLength(7);
  });

  it("should delete the correct restaurant and not affect others", async () => {
    // Create three restaurants
    const r1 = await createRestaurant({
      name: "Restaurant 1",
      address: "Address 1",
      imageUrl: "https://example.com/1.jpg",
      workingHours: STANDARD_HOURS,
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    const r2 = await createRestaurant({
      name: "Restaurant 2",
      address: "Address 2",
      imageUrl: "https://example.com/2.jpg",
      workingHours: STANDARD_HOURS,
      location: {
        type: "Point",
        coordinates: [-74.006, 40.714],
      },
    });

    const r3 = await createRestaurant({
      name: "Restaurant 3",
      address: "Address 3",
      imageUrl: "https://example.com/3.jpg",
      workingHours: STANDARD_HOURS,
      location: {
        type: "Point",
        coordinates: [-75.0, 41.0],
      },
    });

    // Delete the middle restaurant
    const deleteResult = await deleteRestaurant(r2.data.id);
    expect(deleteResult.success).toBe(true);

    // Verify only 2 restaurants remain
    const remaining = await getAllRestaurants();
    expect(remaining.data).toHaveLength(2);

    const names = remaining.data.map((r: any) => r.name);
    expect(names).toContain("Restaurant 1");
    expect(names).toContain("Restaurant 3");
    expect(names).not.toContain("Restaurant 2");
  });

  it("should handle concurrent operations", async () => {
    // Create multiple restaurants concurrently
    const createPromises = [
      createRestaurant({
        name: "Concurrent 1",
        address: "Address 1",
        imageUrl: "https://example.com/1.jpg",
        workingHours: STANDARD_HOURS,
        location: { type: "Point", coordinates: [-73.9, 40.7] },
      }),
      createRestaurant({
        name: "Concurrent 2",
        address: "Address 2",
        imageUrl: "https://example.com/2.jpg",
        workingHours: STANDARD_HOURS,
        location: { type: "Point", coordinates: [-73.8, 40.8] },
      }),
      createRestaurant({
        name: "Concurrent 3",
        address: "Address 3",
        imageUrl: "https://example.com/3.jpg",
        workingHours: STANDARD_HOURS,
        location: { type: "Point", coordinates: [-73.7, 40.9] },
      }),
    ];

    const results = await Promise.all(createPromises);

    // All should succeed
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });

    // Verify all were created
    const allRestaurants = await getAllRestaurants();
    expect(allRestaurants.data).toHaveLength(3);
  });

  it("should preserve data types after retrieval", async () => {
    const createResult = await createRestaurant({
      name: "Type Check Restaurant",
      address: "123 Type St",
      imageUrl: "https://example.com/type.jpg",
      workingHours: [
        { day: 1, shifts: [{ start: "09:00", end: "17:00" }] },
        { day: 0, shifts: [{ start: "10:00", end: "18:00" }] },
      ],
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.73061],
      },
    });

    expect(createResult.success).toBe(true);

    const restaurants = await getAllRestaurants();
    const restaurant = restaurants.data.find(
      (r: any) => r.name === "Type Check Restaurant",
    );

    // Check data types
    expect(typeof restaurant._id).toBe("string");
    expect(typeof restaurant.name).toBe("string");
    expect(typeof restaurant.address).toBe("string");
    expect(typeof restaurant.imageUrl).toBe("string");
    expect(Array.isArray(restaurant.workingHours)).toBe(true);
    expect(typeof restaurant.location).toBe("object");
    expect(restaurant.location.type).toBe("Point");
    expect(Array.isArray(restaurant.location.coordinates)).toBe(true);
    expect(typeof restaurant.location.coordinates[0]).toBe("number");
    expect(typeof restaurant.location.coordinates[1]).toBe("number");
    expect(typeof restaurant.createdAt).toBe("string"); // ISO string after serialization
    expect(typeof restaurant.updatedAt).toBe("string"); // ISO string after serialization
  });
});
