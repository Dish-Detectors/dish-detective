import RestaurantMap from "@/components/RestaurantMap";
import { Box } from "@mui/material";
import Restaurant, { IRestaurant } from "@/models/Restaurant";
import dbConnect from "@/utils/dbConnect";
import { clerkClient } from "@clerk/nextjs/server";

async function fetchAllRestaurantsWithManagers(): Promise<IRestaurant[]> {
  try {
    await dbConnect();

    const restaurants = await Restaurant.find({})
      .sort({ name: 1 })
      .lean()
      .exec();

    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 499 });

    const managerMap = new Map<string, string>();
    users.data.forEach((user) => {
      const restaurantId = user.publicMetadata.restaurantId as string;
      const role = user.publicMetadata.role as string;
      if (restaurantId && role === "manager") {
        const name = user.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : user.username || "Unknown";
        managerMap.set(restaurantId, name);
      }
    });

    return JSON.parse(JSON.stringify(restaurants)).map((r: any) => ({
      ...r,
      manager: managerMap.get(r._id) || null,
    }));
  } catch (error) {
    console.error("Error retrieving restaurants:", error);
    return [];
  }
}

export default async function StudentMapPage() {
  const restaurants = await fetchAllRestaurantsWithManagers();

  return (
    <Box
      sx={{
        p: 3,
        height: "100%", // Fill parent (which is already calc(100vh - header))
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden", // Prevent scroll
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          borderRadius: 4,
          overflow: "hidden",
          minHeight: 0, // Critical for flex scrolling/containment
        }}
      >
        <RestaurantMap restaurants={restaurants} />
      </Box>
    </Box>
  );
}
