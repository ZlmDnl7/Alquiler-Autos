import Booking from "../models/BookingModel.js";
import Vehicle from "../models/vehicleModel.js";

/**
 * Validates and sanitizes date input
 * @param {any} date - Date to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Date} Validated Date object
 */
function validateAndSanitizeDate(date, fieldName) {
  if (!date) {
    throw new Error(`${fieldName} is required`);
  }

  // Convert to Date object if it's a string
  let dateObj;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    throw new Error(`${fieldName} must be a valid date`);
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return dateObj;
}

/**
 * Validates that pickup date is before drop-off date
 * @param {Date} pickupDate - Validated pickup date
 * @param {Date} dropOffDate - Validated drop-off date
 */
function validateDateRange(pickupDate, dropOffDate) {
  if (pickupDate >= dropOffDate) {
    throw new Error("Pickup date must be before drop-off date");
  }

  // Optional: Validate that dates are not too far in the past
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  if (pickupDate < oneDayAgo) {
    throw new Error("Pickup date cannot be more than 1 day in the past");
  }
}

/**
 * Returns vehicles that are available for booking in the selected date range
 * @param {Date} pickupDate - Start date for the booking
 * @param {Date} dropOffDate - End date for the booking
 * @returns {Promise<Array>} Array of available vehicles
 */
export async function availableAtDate(pickupDate, dropOffDate) {
  try {
    // Validate and sanitize input parameters
    const sanitizedPickupDate = validateAndSanitizeDate(pickupDate, "Pickup date");
    const sanitizedDropOffDate = validateAndSanitizeDate(dropOffDate, "Drop-off date");
    
    // Validate date range
    validateDateRange(sanitizedPickupDate, sanitizedDropOffDate);

    // Find existing bookings that overlap with the requested date range
    // Using explicit $eq, $lt, $gt operators to prevent injection
    const existingBookingsQuery = {
      status: { $eq: "booked" }, // Use $eq explicitly
      pickupDate: { $lt: sanitizedDropOffDate }, // Use validated date
      dropOffDate: { $gt: sanitizedPickupDate }, // Use validated date
    };

    const existingBookings = await Booking.find(
      existingBookingsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    // Extract unique vehicle IDs that are already booked
    const bookedVehicleIds = [...new Set(existingBookings.map(booking => booking.vehicleId))];

    // Find vehicles with completed/canceled trips during the specified date range
    // Using explicit operators to prevent NoSQL injection
    const completedTripsQuery = {
      status: { 
        $in: ["tripCompleted", "canceled", "notBooked"] // Explicit status values
      },
      pickupDate: { $lt: sanitizedDropOffDate }, // Use validated date
      dropOffDate: { $gt: sanitizedPickupDate }, // Use validated date
    };

    const availableFromCompletedTrips = await Booking.find(
      completedTripsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    const availableVehicleIds = availableFromCompletedTrips.map(booking => booking.vehicleId);

    // Find all available vehicles using explicit query structure
    const vehicleQuery = {
      isDeleted: { $ne: true }, // Exclude deleted vehicles
      $or: [
        { _id: { $nin: bookedVehicleIds } }, // Vehicles without active bookings
        { _id: { $in: availableVehicleIds } }, // Vehicles with completed/canceled trips
      ],
    };

    const availableVehicles = await Vehicle.find(vehicleQuery).lean();

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDate:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}

/**
 * Alternative version with even more explicit query construction
 * This version builds queries step by step for maximum security
 */
export async function availableAtDateSecure(pickupDate, dropOffDate) {
  try {
    // Validate and sanitize input parameters
    const sanitizedPickupDate = validateAndSanitizeDate(pickupDate, "Pickup date");
    const sanitizedDropOffDate = validateAndSanitizeDate(dropOffDate, "Drop-off date");
    
    // Validate date range
    validateDateRange(sanitizedPickupDate, sanitizedDropOffDate);

    // Build query objects explicitly to prevent injection
    const statusFilter = { $eq: "booked" };
    const pickupDateFilter = { $lt: sanitizedDropOffDate };
    const dropOffDateFilter = { $gt: sanitizedPickupDate };

    const existingBookingsQuery = {
      status: statusFilter,
      pickupDate: pickupDateFilter,
      dropOffDate: dropOffDateFilter,
    };

    const existingBookings = await Booking.find(
      existingBookingsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    // Extract unique vehicle IDs that are already booked
    const bookedVehicleIds = [...new Set(existingBookings.map(booking => booking.vehicleId))];

    // Build completed trips query explicitly
    const allowedStatuses = ["tripCompleted", "canceled", "notBooked"];
    const completedTripsQuery = {
      status: { $in: allowedStatuses },
      pickupDate: { $lt: sanitizedDropOffDate },
      dropOffDate: { $gt: sanitizedPickupDate },
    };

    const availableFromCompletedTrips = await Booking.find(
      completedTripsQuery,
      { vehicleId: 1, _id: 0 }
    ).lean();

    const availableVehicleIds = availableFromCompletedTrips.map(booking => booking.vehicleId);

    // Build vehicle query explicitly
    const isDeletedFilter = { $ne: true };
    const notBookedFilter = { $nin: bookedVehicleIds };
    const availableFilter = { $in: availableVehicleIds };

    const vehicleQuery = {
      isDeleted: isDeletedFilter,
      $or: [
        { _id: notBookedFilter },
        { _id: availableFilter },
      ],
    };

    const availableVehicles = await Vehicle.find(vehicleQuery).lean();

    return availableVehicles;

  } catch (error) {
    console.error('Error in availableAtDateSecure:', error.message);
    throw new Error(`Failed to fetch available vehicles: ${error.message}`);
  }
}