// =====================================================
// UTILIDADES DE VALIDACIÓN - RENT-A-RIDE
// =====================================================
// Archivo: client/src/utils/validation.js
// Descripción: Funciones de utilidad para validación del frontend
// =====================================================

// Función para validar email
export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

// Función para validar contraseña
export const validatePassword = (password) => {
  return Boolean(password && password.length >= 8);
};

// Función para validar número de teléfono
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Función para formatear precio
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// Función para calcular días entre fechas
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para validar fechas de reserva
export const validateBookingDates = (pickupDate, dropOffDate) => {
  if (!pickupDate || !dropOffDate) return false;
  const pickup = new Date(pickupDate);
  const dropOff = new Date(dropOffDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return pickup >= today && dropOff > pickup;
};

// Función para generar ID único
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Función para validar campos requeridos
export const validateRequiredFields = (fields, data) => {
  const missingFields = [];
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Función para manejar errores de validación
export const handleValidationError = (error, setError) => {
  if (setError && typeof setError === 'function') {
    setError(error.message || 'Error de validación');
  }
  console.error('Validation error:', error);
};

// Función para formatear fecha
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-CO');
};

// Función para validar marca de vehículo
export const validateBrand = (brand) => {
  const validBrands = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Suzuki', 'Mitsubishi'];
  return validBrands.includes(brand);
};

// Función para validar tipo de combustible
export const validateFuelType = (fuelType) => {
  const validTypes = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
  return validTypes.includes(fuelType);
};

// Función para validar transmisión
export const validateTransmission = (transmission) => {
  const validTypes = ['Manual', 'Automático'];
  return validTypes.includes(transmission);
};

// Función para validar número de asientos
export const validateSeats = (seats) => {
  const numSeats = parseInt(seats);
  return numSeats >= 2 && numSeats <= 8;
};

// Función para validar estado de reserva
export const validateBookingStatus = (status) => {
  const validStatuses = ['noReservado', 'reservado', 'cancelled', 'completed'];
  return validStatuses.includes(status);
};

// Función para validar estado de vehículo
export const validateVehicleStatus = (status) => {
  const validStatuses = ['pending', 'approved', 'rejected'];
  return validStatuses.includes(status);
};

// Función para validar ubicación
export const validateLocation = (location) => {
  return Boolean(location && location.trim().length > 0);
};

// Función para calcular precio total
export const calculateTotalPrice = (pricePerDay, days) => {
  if (!pricePerDay || !days || pricePerDay <= 0 || days <= 0) return 0;
  return pricePerDay * days;
};

// Función para verificar disponibilidad de vehículo
export const checkVehicleAvailability = (vehicle, bookingDate) => {
  if (!vehicle || !bookingDate) return false;
  return vehicle.status === 'approved' && vehicle.available !== false;
};

// Función para validar año de fabricación
export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const numYear = parseInt(year);
  return numYear >= 1990 && numYear <= currentYear + 1;
};

// Función para validar precio
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 10000000;
};

// Función para validar número de placa
export const validateLicensePlate = (plate) => {
  const plateRegex = /^[A-Z]{3}\d{3}$|^[A-Z]{3}\d{2}[A-Z]$/;
  return plateRegex.test(plate);
};

// Función para validar modelo de vehículo
export const validateVehicleModel = (model) => {
  return Boolean(model && model.trim().length >= 2 && model.trim().length <= 50);
};

// Función para validar color de vehículo
export const validateVehicleColor = (color) => {
  const validColors = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Marrón', 'Plateado'];
  return validColors.includes(color);
};

// Función para validar kilometraje
export const validateMileage = (mileage) => {
  const numMileage = parseInt(mileage);
  return !isNaN(numMileage) && numMileage >= 0 && numMileage <= 1000000;
};

// Función para validar descripción
export const validateDescription = (description) => {
  return Boolean(description && description.trim().length >= 10 && description.trim().length <= 500);
};
