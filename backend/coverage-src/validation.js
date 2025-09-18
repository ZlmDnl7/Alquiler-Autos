
// Utilidades de validación para coverage
const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

const validateString = (str) => {
  return str && typeof str === 'string' && str.length > 0;
};

const validatePassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password) && 
         /[!@#$%^&*]/.test(password);
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
};

const validatePrice = (price) => {
  return price > 0 && typeof price === 'number';
};

const validateSeats = (seats) => {
  return seats >= 2 && seats <= 9 && Number.isInteger(seats);
};

const validateFuelType = (fuelType) => {
  const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
  return validFuelTypes.includes(fuelType);
};

const validateTransmission = (transmission) => {
  const validTransmissions = ['manual', 'automatic'];
  return validTransmissions.includes(transmission);
};

const validateBookingStatus = (status) => {
  const validStatuses = ['noReservado', 'reservado', 'enViaje', 'viajeCompletado', 'cancelado'];
  return validStatuses.includes(status);
};

const validateVehicleStatus = (status) => {
  const validVehicleStatuses = ['pending', 'approved', 'rejected', 'available', 'maintenance'];
  return validVehicleStatuses.includes(status);
};

const calculateTotalPrice = (pricePerDay, days) => {
  if (pricePerDay < 0 || days < 0) {
    throw new Error('Los valores no pueden ser negativos');
  }
  return pricePerDay * days;
};

const checkVehicleAvailability = (vehicle, startDate, endDate) => {
  if (!vehicle || !startDate || !endDate) {
    return false;
  }
  return vehicle.available && 
         vehicle.status === 'disponible' && 
         new Date(startDate) > new Date();
};

const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const validateBookingDates = (pickupDate, dropOffDate) => {
  const pickup = new Date(pickupDate);
  const dropOff = new Date(dropOffDate);
  const today = new Date();
  
  return pickup > today && dropOff > pickup;
};

const calculateDays = (pickupDate, dropOffDate) => {
  const pickup = new Date(pickupDate);
  const dropOff = new Date(dropOffDate);
  const diffTime = dropOff - pickup;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const validateLocation = (location) => {
  const validLocations = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'];
  return validLocations.includes(location);
};

const validateBrand = (brand) => {
  const validBrands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai'];
  return validBrands.includes(brand);
};

const handleValidationError = (message, res, next) => {
  res.status(400).json({ message });
};

const errorHandler = (error, req, res, next) => {
  res.status(500).json({ message: error.message });
};

module.exports = {
  validateEmail,
  validateString,
  validatePassword,
  validatePhoneNumber,
  validateYear,
  validatePrice,
  validateSeats,
  validateFuelType,
  validateTransmission,
  validateBookingStatus,
  validateVehicleStatus,
  calculateTotalPrice,
  checkVehicleAvailability,
  validateRequiredFields,
  formatDate,
  generateId,
  validateBookingDates,
  calculateDays,
  validateLocation,
  validateBrand,
  handleValidationError,
  errorHandler
};
