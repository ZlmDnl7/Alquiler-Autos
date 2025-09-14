import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registeration_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  car_title: {
    type: String,
    required: false,
    trim: true
  },
  car_description: {
    type: String,
    required: false,
    trim: true
  },
  remark: {
    type: String,
    required: false,
    trim: true
  },
  company: {
    type: String,
    required: false,
    trim: true
  },
  name: {
    type: String,
    required: false,
    trim: true
  },
  model: {
    type: String,
    required: false,
    trim: true
  },
  year_made: {
    type: Number,
    required: false,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  fuel_type: {
    type: String,
    enum: ["petrol", "diesel", "electric", "hybrid"], // Fixed typo: "electirc" -> "electric"
    required: false
  },
  rented_by: {
    type: String,
    required: false,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false // Fixed typo: "requrired" -> "required"
  },
  seats: {
    type: Number,
    required: false,
    min: 1,
    max: 50
  },
  transmission: { // Fixed typo: "transmition" -> "transmission"
    type: String,
    enum: ["manual", "automatic"],
    required: false
  },
  image: {
    type: [String], // More specific than Array
    required: false,
    validate: {
      validator: function(arr) {
        return arr.every(url => typeof url === 'string');
      },
      message: 'All images must be valid URLs'
    }
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  price: {
    type: Number,
    required: false,
    min: 0
  },
  base_package: {
    type: String,
    required: false,
    trim: true
  },
  with_or_without_fuel: {
    type: Boolean,
    required: false,
    default: false
  },
  insurance_end: {
    type: Date,
    required: false
  },
  registeration_end: {
    type: Date,
    required: false
  },
  pollution_end: {
    type: Date,
    required: false
  },
  certificates: {
    fitness: {
      type: String,
      required: false,
      trim: true
    },
    registration: {
      type: String,
      required: false,
      trim: true
    },
    rc: {
      type: String,
      required: false,
      trim: true
    },
    pollution: {
      type: String,
      required: false,
      trim: true
    }
  },
  car_type: {
    type: String,
    required: false,
    trim: true
  },
  isDeleted: {
    type: Boolean, // Fixed: Should be Boolean, not String
    default: false,
    required: false
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  isAdminAdded: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: String,
    default: 'admin',
    trim: true
  },
  isAdminApproved: {
    type: Boolean,
    default: true
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes for better query performance
vehicleSchema.index({ location: 1, district: 1 });
vehicleSchema.index({ company: 1, model: 1 });
vehicleSchema.index({ isDeleted: 1, isBooked: 1 });
vehicleSchema.index({ vendorId: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.company} ${this.name} ${this.model}`.trim();
});

// Pre-save middleware for data validation
vehicleSchema.pre('save', function(next) {
  // Ensure registration number is always uppercase
  if (this.registeration_number) {
    this.registeration_number = this.registeration_number.toUpperCase();
  }
  
  // Validate that required certificates exist if vehicle is approved
  if (this.isAdminApproved && this.certificates) {
    const requiredCerts = ['registration', 'pollution'];
    const missingCerts = requiredCerts.filter(cert => !this.certificates[cert]);
    
    if (missingCerts.length > 0) {
      return next(new Error(`Missing required certificates: ${missingCerts.join(', ')}`));
    }
  }
  
  next();
});

// Instance methods
vehicleSchema.methods.isAvailable = function() {
  return !this.isDeleted && !this.isBooked && this.isAdminApproved && !this.isRejected;
};

vehicleSchema.methods.getMainImage = function() {
  return this.image && this.image.length > 0 ? this.image[0] : null;
};

// Static methods
vehicleSchema.statics.findAvailable = function(location, district) {
  return this.find({
    location,
    district,
    isDeleted: false,
    isBooked: false,
    isAdminApproved: true,
    isRejected: false
  });
};

vehicleSchema.statics.findByVendor = function(vendorId) {
  return this.find({
    vendorId,
    isDeleted: false
  });
};

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;