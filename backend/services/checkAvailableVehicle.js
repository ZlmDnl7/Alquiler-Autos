import Booking from "../models/BookingModel.js";
import Vehicle from "../models/vehicleModel.js";

/**
 * Returns vehicles that are available for booking in the selected date range
 * @param {Date} pickupDate - Start date for the booking
 * @param {Date} dropOffDate - End date for the booking
 * @returns {Promise<Array>} Array of available vehicles
 */
export async function availableAtDate(pickupDate, dropOffDate) {
  try {
    // Validate input parameters
    if (!pickupDate || !dropOffDate) {
      throw new Error("Both pickup and drop-off dates are required");
    }

    if (new Date(pickupDate) >= new Date(dropOffDate)) {
      throw new Error("Drop-off date must be after pickup date");
    }

    // Find existing bookings that overlap with the requested date range
    const existingBookings = await Booking.find({
      status: { $nin: ["tripCompleted", "canceled", "notBooked"] }, // Only active bookings
      $or: [
        { pickupDate: { $lt: dropOffDate }, dropOffDate: { $gt: pickupDate } }, // Overlap condition
        { pickupDate: { $gte: pickupDate, $lt: dropOffDate } }, // Start within range
        { dropOffDate: { $gt: pickupDate, $lte: dropOffDate } }, // End within range
        {
          pickupDate: { $lte: pickupDate },
          dropOffDate: { $gte: dropOffDate },
        }, // Booking includes the entire time range
      ],
    });

    // Extract unique vehicle IDs that are already booked
    const bookedVehicleIds = [...new Set(existingBookings.map(booking => booking.vehicleId))];

    // Find vehicles with completed/canceled trips during the specified date range
    const availableFromCompletedTrips = await Booking.find(
      {
        status: { $in: ["tripCompleted", "canceled", "notBooked"] },
        pickupDate: { $lt: dropOffDate },
        dropOffDate: { $gt: pickupDate },
      },
      { vehicleId: 1, _id: 0 }
    );

    const availableVehicleIds = availableFromCompletedTrips.map(booking => booking.vehicleId);

    // Find all available vehicles
    const availableVehicles = await Vehicle.find({
      isDeleted: { $ne: true }, // Exclude deleted vehicles
      $or: [
        { _id: { $nin: bookedVehicleIds } }, // Vehicles without active bookings
        { _id: { $in: availableVehicleIds } }, // Vehicles with completed/canceled trips
      ],
    }).lean(); // Use lean() for better performance

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDate:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}