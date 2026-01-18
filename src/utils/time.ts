import { IWorkingDay } from "@/models/Restaurant";

export type RestaurantStatus = "open" | "closed" | "opening_soon" | "closing_soon";

interface StatusResult {
    status: RestaurantStatus;
    message: string; // e.g., "Otvoreno do 22:00", "Zatvoreno, otvara se u 08:00", "Zatvara se za 15 min"
    nextOpenTime?: string;
    isToday: boolean;
}

export function getRestaurantStatus(workingHours: IWorkingDay[]): StatusResult {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) - 6 (Saturday)
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Find today's shifts
    const todaySchedule = workingHours.find((day) => day.day === currentDay);

    if (!todaySchedule || !todaySchedule.shifts || todaySchedule.shifts.length === 0) {
        return getNextOpenStatus(workingHours, currentDay, currentTime);
    }

    // Check if currently open
    for (const shift of todaySchedule.shifts) {
        const [startH, startM] = shift.start.split(":").map(Number);
        const [endH, endM] = shift.end.split(":").map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;

        // Handle Closing Soon (within 60 mins)
        if (currentTime >= startTime && currentTime < endTime) {
            const remainingMinutes = endTime - currentTime;
            if (remainingMinutes <= 60) {
                return {
                    status: "closing_soon",
                    message: `Zatvara se uskoro (${shift.end})`,
                    isToday: true
                };
            }
            return {
                status: "open",
                message: `Otvoreno do ${shift.end}`,
                isToday: true
            };
        }

        // Handle Opening Soon (within 60 mins before start)
        if (currentTime < startTime) {
            const minutesUntilOpen = startTime - currentTime;
            if (minutesUntilOpen <= 60) {
                return {
                    status: "opening_soon",
                    message: `Otvara se uskoro (${shift.start})`,
                    nextOpenTime: shift.start,
                    isToday: true
                };
            }
            // Future shift today
            return {
                status: "closed",
                message: `Otvara se u ${shift.start}`,
                nextOpenTime: shift.start,
                isToday: true
            };
        }
    }

    // If we are here, it means we are past all shifts for today
    return getNextOpenStatus(workingHours, currentDay, currentTime);
}

function getNextOpenStatus(workingHours: IWorkingDay[], currentDay: number, currentTime: number): StatusResult {
    // Logic to find next working day
    // Check remaining shifts today first? (Already done in main loop, if we are here we missed them)
    // Actually the main loop iterates all shifts. If we are 'before' a shift we return.
    // So if we exit the loop, we are after ALL shifts or there are no shifts.

    // Simple cyclical check for next 7 days
    for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDaySchedule = workingHours.find(d => d.day === nextDayIndex);

        if (nextDaySchedule && nextDaySchedule.shifts.length > 0) {
            // Sort shifts just in case
            const firstShift = nextDaySchedule.shifts.sort((a, b) => a.start.localeCompare(b.start))[0];

            const daysMap = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
            const dayName = i === 1 ? "Sutra" : daysMap[nextDayIndex];

            return {
                status: "closed",
                message: `Zatvoreno. Otvara se ${dayName.toLowerCase()} u ${firstShift.start}`,
                nextOpenTime: firstShift.start,
                isToday: false
            };
        }
    }

    return {
        status: "closed",
        message: "Trajno zatvoreno",
        isToday: false
    };
}

export function getWorkingHoursString(workingHours: IWorkingDay[]): string {
    const now = new Date();
    const currentDay = now.getDay();
    const todaySchedule = workingHours.find((day) => day.day === currentDay);

    if (!todaySchedule || !todaySchedule.shifts || todaySchedule.shifts.length === 0) {
        return "Zatvoreno danas";
    }

    return todaySchedule.shifts.map(s => `${s.start} - ${s.end}`).join(", ");
}
