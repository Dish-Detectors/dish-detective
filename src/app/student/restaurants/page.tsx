import RestaurantList from "@/components/RestaurantList";
import StudentRestaurantsTitle from "@/components/StudentRestaurantsTitle";
import { Box, Divider } from "@mui/material";
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

export default async function StudentRestaurantsPage() {
  const restaurants = await fetchAllRestaurantsWithManagers();

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <StudentRestaurantsTitle />
      <Divider sx={{ mb: { xs: 1.5, sm: 3 } }} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <RestaurantList restaurants={restaurants as unknown as IRestaurant[]} />
      </Box>
    </Box>
  );
}
