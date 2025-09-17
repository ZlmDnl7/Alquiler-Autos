import { useDispatch, useSelector } from "react-redux";
import { FaCarSide } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import CarNotFound from "./CarNotFound";
import { useNavigate } from "react-router-dom";
import { setVariants } from "../../redux/user/listAllVehicleSlice";
import { setFilteredData } from "../../redux/user/sortfilterSlice";

const AvailableVehiclesAfterSearch = () => {
  const { availableCars } = useSelector((state) => state.selectRideSlice);
  const { pickup_district, pickup_location, pickupDate, dropoffDate } =
    useSelector((state) => state.bookingDataSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showVariants = async (model) => {
    try {
      const requestData = {
        pickUpDistrict: pickup_district,
        pickUpLocation: pickup_location,
        pickupDate: pickupDate.humanReadable,
        dropOffDate: dropoffDate.humanReadable,
        model,
      };

      const response = await fetch("/api/user/getVehiclesWithoutBooking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setVariants(data));
        dispatch(setFilteredData(data));
        navigate("/allVariants");
      } else {
        console.error("Request failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  const hasAvailableCars = availableCars?.length > 0;
  const filteredCars = availableCars?.filter(car => car.isDeleted !== true && car.isDeleted !== 'true') || [];

  return (
    <div>
      {hasAvailableCars && (
        <div className="text-center flex flex-col mt-10 justify-center items-center sm:max-w-[500px] mx-auto">
          <h2 className="text-[18px] lg:text-[24px]">Elige Entre Opciones</h2>
          <p className="text-center text-[8px] px-6 lg:text-[12px] lg:w-[550px]">
            Elige de nuestra colección moderna de vehículos variados. Siéntete como en casa
            igual que tu propio auto. Nuestros clientes han experimentado nuestro servicio y
            resultados, y están ansiosos por compartir sus experiencias positivas contigo.
          </p>
        </div>
      )}

      <div className="mx-auto flex sm:flex-row w-full lg:grid lg:max-w-[1000px] lg:grid-cols-3 justify-center items-center gap-5 flex-wrap mt-10 drop-shadow-md">
        {filteredCars.map((car, idx) => (
          <div
            className="bg-white box-shadow rounded-lg drop-shadow"
            key={car.id || idx} // Use car.id if available, fallback to index
          >
            <div className="mx-auto max-w-[320px] px-4 py-2 sm:px-6 sm:py-0 lg:max-w-7xl lg:px-8">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden object-contain rounded-md bg-white lg:aspect-none group-hover:opacity-75 lg:h-80 mb-3">
                <img
                  src={car.image?.[0] || '/placeholder-car.jpg'} // Safe access with fallback
                  alt={car.name || 'Vehicle'}
                  className="w-full object-contain object-center lg:h-full lg:w-full"
                />
              </div>

              <div className="flex justify-between items-start">
                <h2 className="text-[14px] capitalize font-semibold tracking-tight text-gray-900">
                  {car.name}
                </h2>
                <div className="text-[14px] flex flex-col items-end">
                  <p className="font-semibold">{car.price}</p>
                  <div className="text-[6px] relative bottom-[3px]">
                    Por Día
                  </div>
                </div>
              </div>

              <div className="my-2 font-mono">
                <div className="flex justify-between items-center mb-5 mt-5">
                  <h3 className="text-[12px] flex justify-between items-center gap-1">
                    <FaCarSide />
                    {car.company}
                  </h3>
                  <p className="text-end text-[12px] flex justify-between items-center gap-1">
                    <MdAirlineSeatReclineNormal />
                    {car.seats}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[12px] mb-5">
                  <p className="flex items-center justify-center gap-1">
                    <FaCarSide />
                    {car.car_type}
                  </p>
                  <button
                    className="bg-green-500 rounded-sm text-black px-6 py-2 hover:bg-green-600 transition-colors"
                    onClick={() => showVariants(car.model)}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasAvailableCars && <CarNotFound />}
    </div>
  );
};

export default AvailableVehiclesAfterSearch;