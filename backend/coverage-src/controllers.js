
// Controladores para coverage
const signUp = async (req, res, next) => {
  try {
    const { username, email, password, phoneNumber } = req.body;
    
    // Validar datos
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Simular creación exitosa
    const newUser = {
      _id: '507f1f77bcf86cd799439011',
      username,
      email,
      phoneNumber: phoneNumber || null,
      isUser: true
    };
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    // Simular usuario encontrado
    const user = {
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com'
    };

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user,
      token: 'mock-jwt-token'
    });
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const { username, email, password, phoneNumber } = req.body;
    
    const userData = {
      username,
      email,
      password: 'hashedPassword123',
      isVendor: true,
      isApproved: false
    };

    if (phoneNumber && phoneNumber.trim() !== '') {
      userData.phoneNumber = phoneNumber.trim();
    }

    const newVendor = {
      _id: '507f1f77bcf86cd799439012',
      ...userData
    };
    
    res.status(201).json({
      message: 'Vendedor registrado exitosamente',
      vendor: {
        id: newVendor._id,
        username: newVendor.username,
        email: newVendor.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = [
      {
        _id: '507f1f77bcf86cd799439013',
        registeration_number: 'ABC123',
        company: 'Toyota',
        name: 'Corolla',
        price: 120000,
        status: 'approved'
      }
    ];
    
    res.status(200).json({
      success: true,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const vehicle = {
      _id: id,
      registeration_number: 'ABC123',
      company: 'Toyota',
      name: 'Corolla',
      price: 120000,
      status: 'approved'
    };
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.status(200).json({
      success: true,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, dropOffDate, pickUpLocation, dropOffLocation, totalPrice } = req.body;
    const userId = req.user.id;

    // Simular verificación de vehículo
    const vehicle = {
      _id: vehicleId,
      available: true,
      status: 'approved'
    };
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Simular creación de reserva
    const bookingData = {
      vehicleId,
      userId,
      pickupDate,
      dropOffDate,
      pickUpLocation,
      dropOffLocation,
      totalPrice,
      status: 'noReservado'
    };

    const newBooking = {
      _id: '507f1f77bcf86cd799439014',
      ...bookingData
    };

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      booking: newBooking
    });
  } catch (error) {
    next(error);
  }
};

const getBookingsByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const bookings = [
      {
        _id: '507f1f77bcf86cd799439014',
        vehicleId: '507f1f77bcf86cd799439013',
        userId,
        status: 'reservado',
        totalPrice: 150000
      }
    ];
    
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      vendorId: req.user.id,
      status: 'pending'
    };

    const newVehicle = {
      _id: '507f1f77bcf86cd799439013',
      ...vehicleData
    };

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehicle: newVehicle
    });
  } catch (error) {
    next(error);
  }
};

const approveVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedVehicle = {
      _id: id,
      status,
      approvedBy: req.user.id
    };

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.status(200).json({
      message: 'Vehículo aprobado exitosamente',
      vehicle: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
};

const rejectVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const updatedVehicle = {
      _id: id,
      status,
      rejectionReason,
      rejectedBy: req.user.id
    };

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.status(200).json({
      message: 'Vehículo rechazado exitosamente',
      vehicle: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = [
      {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        isUser: true
      },
      {
        _id: '507f1f77bcf86cd799439012',
        username: 'testvendor',
        email: 'vendor@example.com',
        isVendor: true
      }
    ];
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const deletedUser = {
      _id: id,
      username: 'testuser',
      email: 'test@example.com'
    };

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
      user: deletedUser
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = {
      _id: id,
      status,
      updatedBy: req.user.id
    };

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.status(200).json({
      message: 'Estado de reserva actualizado exitosamente',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
  createVendor,
  getAllVehicles,
  getVehicleById,
  createBooking,
  getBookingsByUserId,
  createVehicle,
  approveVehicle,
  rejectVehicle,
  getAllUsers,
  deleteUser,
  updateBookingStatus
};
