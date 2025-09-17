import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  pickupDate: { type: Date, required: true },
  dropOffDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickUpLocation: { type: String, required: true },
  pickUpDistrict: { type: String, required: false },
  dropOffLocation: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  razorpayOrderId: { type: String, required: false },
  razorpayPaymentId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  status:{
    type:String,
    enum:["noReservado","reservado","enViaje","noRecogido","cancelado","vencido","viajeCompletado"],
    default:"noReservado"
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
