import Booking from '../../models/BookingModel.js';
import Vehicle from '../../models/vehicleModel.js';
import { errorHandler } from '../../utils/error.js';
import { validateMongoId } from '../../utils/validation.js';

export const vendorBookings = async (req, res, next) => {
  try {
    // Remove unused variable - vendorVehicles was extracted but never used
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
        },
      },
    ]);

    // Check if array is empty instead of falsy
    if (bookings.length === 0) {
      return next(errorHandler(404, "No bookings found"));
    }

    res.status(200).json({
      message: "Vendor bookings retrieved successfully",
      data: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Error in vendorBookings:', error.message);
    next(errorHandler(500, "Error retrieving vendor bookings"));
  }
};

// Nuevo endpoint para mostrar reservas del vendor específico
export const showVendorBookings = async (req, res, next) => {
  try {
    const { _id } = req.body;
    
    // Validar y sanitizar el ID del usuario
    const sanitizedUserId = validateMongoId(_id, 'User ID');

    // Obtener vehículos del vendor usando ID sanitizado
    const vendorVehicles = await Vehicle.find({
      addedBy: sanitizedUserId,
      isAdminAdded: false
    });

    const vehicleIds = vendorVehicles.map(v => v._id);

    // Obtener reservas de esos vehículos
    const bookings = await Booking.aggregate([
      {
        $match: {
          vehicleId: { $in: vehicleIds }
        }
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: {
          path: "$vehicleDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $project: {
          _id: 1,
          pickupDate: 1,
          dropOffDate: 1,
          pickUpLocation: 1,
          dropOffLocation: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          vehicle_name: "$vehicleDetails.name",
          user_name: "$userDetails.name",
          user_email: "$userDetails.email"
        }
      }
    ]);

    res.status(200).json(bookings);

  } catch (error) {
    // Manejar errores de validación
    if (error.message.includes('is required') || 
        error.message.includes('must be') || 
        error.message.includes('cannot be')) {
      return next(errorHandler(400, error.message));
    }
    
    next(errorHandler(500, "Error retrieving vendor bookings"));
  }
};