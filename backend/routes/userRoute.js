import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import Vehicle from "../models/vehicleModel.js";
import Booking from "../models/BookingModel.js";

// User controller imports
import { 
  updateUser, 
  deleteUser, 
  signOut 
} from "../controllers/userControllers/userController.js";

// Vehicle controller imports
import { 
  listAllVehicles, 
  showVehicleDetails 
} from "../controllers/userControllers/userAllVehiclesController.js";

// Profile controller imports
import { editUserProfile } from "../controllers/userControllers/userProfileController.js";

// Booking controller imports
import { 
  BookCar, 
  razorpayOrder, 
  getVehiclesWithoutBooking, 
  filterVehicles, 
  showOneofkind, 
  showAllVariants, 
  findBookingsOfUser, 
  sendBookingDetailsEamil, 
  latestbookings, 
  findBookingsForVendor, 
  findAllBookingsForAdmin, 
  updateExistingStatuses 
} from "../controllers/userControllers/userBookingController.js";

const router = express.Router();

// User management routes
router.post('/update/:id', updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/signout', signOut);
router.post('/editUserProfile/:id', editUserProfile);

// Vehicle listing routes
router.get('/listAllVehicles', listAllVehicles);
router.get('/debugVehicles', async (req, res) => {
  try {
    const allVehicles = await Vehicle.find({});
    const availableVehicles = await Vehicle.find({ 
      isDeleted: { $ne: true }
    });
    
    res.json({
      total: allVehicles.length,
      available: availableVehicles.length,
      allVehicles: allVehicles.map(v => ({
        id: v._id,
        name: v.name || v.car_title,
        isDeleted: v.isDeleted,
        isAdminApproved: v.isAdminApproved,
        isRejected: v.isRejected,
        company: v.company,
        model: v.model,
        price: v.price
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/createTestVehicles', async (req, res) => {
  try {
    const testVehicles = [
      {
        registeration_number: "ABC123",
        company: "Toyota",
        name: "Corolla",
        model: "2023",
        car_title: "Toyota Corolla 2023",
        car_description: "Vehículo confiable y eficiente",
        base_package: "Estándar",
        price: 50000,
        year_made: 2023,
        fuel_type: "petrol",
        seats: 5,
        transmition_type: "automatic",
        transmission: "automatic",
        car_type: "sedan",
        location: "Bogotá Centro",
        district: "Bogotá",
        isDeleted: false,
        isAdminApproved: true,
        isRejected: false,
        isAdminAdded: true,
        addedBy: "admin"
      },
      {
        registeration_number: "XYZ789",
        company: "Honda",
        name: "Civic",
        model: "2023",
        car_title: "Honda Civic 2023",
        car_description: "Deportivo y elegante",
        base_package: "Premium",
        price: 60000,
        year_made: 2023,
        fuel_type: "petrol",
        seats: 5,
        transmition_type: "manual",
        transmission: "manual",
        car_type: "sedan",
        location: "Medellín Centro",
        district: "Medellín",
        isDeleted: false,
        isAdminApproved: true,
        isRejected: false,
        isAdminAdded: true,
        addedBy: "admin"
      }
    ];

    const createdVehicles = await Vehicle.insertMany(testVehicles);
    
    res.json({
      message: "Vehículos de prueba creados exitosamente",
      count: createdVehicles.length,
      vehicles: createdVehicles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cleanupDeletedVehicles', async (req, res) => {
  try {
    // Find all vehicles marked as deleted
    const deletedVehicles = await Vehicle.find({ 
      $or: [
        { isDeleted: true },
        { isDeleted: 'true' }
      ]
    });
    
    console.log(`Found ${deletedVehicles.length} deleted vehicles to clean up`);
    
    if (deletedVehicles.length === 0) {
      return res.json({
        message: "No deleted vehicles found to clean up",
        count: 0
      });
    }
    
    // Get vehicle IDs
    const vehicleIds = deletedVehicles.map(v => v._id);
    
    // Delete all related bookings first
    const deletedBookings = await Booking.deleteMany({ 
      vehicleId: { $in: vehicleIds } 
    });
    console.log(`Deleted ${deletedBookings.deletedCount} related bookings`);
    
    // Delete the vehicles physically
    const deletedVehiclesResult = await Vehicle.deleteMany({ 
      $or: [
        { isDeleted: true },
        { isDeleted: 'true' }
      ]
    });
    
    res.json({
      message: "Deleted vehicles cleaned up successfully",
      deletedVehicles: deletedVehiclesResult.deletedCount,
      deletedBookings: deletedBookings.deletedCount,
      totalCleaned: deletedVehiclesResult.deletedCount + deletedBookings.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up deleted vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/showVehicleDetails', showVehicleDetails);
router.post('/filterVehicles', filterVehicles);

// Vehicle availability routes
router.post('/getVehiclesWithoutBooking', getVehiclesWithoutBooking, showAllVariants);
router.post('/showSingleofSameModel', getVehiclesWithoutBooking, showOneofkind);

// Booking management routes
router.post('/razorpay', verifyToken, razorpayOrder);
router.post('/bookCar', BookCar);
router.post('/findBookingsOfUser', findBookingsOfUser);
router.post('/findBookingsForVendor', findBookingsForVendor);
router.post('/findAllBookingsForAdmin', findAllBookingsForAdmin);
router.post('/updateExistingStatuses', updateExistingStatuses);
router.post('/latestbookings', latestbookings);
router.post('/sendBookingDetailsEamil', sendBookingDetailsEamil);

export default router;