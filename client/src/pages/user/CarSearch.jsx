import { IconCalendarEvent, IconMapPinFilled, IconX } from "@tabler/icons-react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
// ✅ Corregido: Removido import no utilizado
import { setAvailableCars, setSelectedDistrict } from "../../redux/user/selectRideSlice";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { setSelectedData } from "../../redux/user/BookingDataSlice";
import dayjs from "dayjs";

const schema = z.object({
  dropoff_location: z.string().min(1, { message: "Ubicación de devolución requerida" }),
  pickup_district: z.string().min(1, { message: "Distrito de recogida requerido" }),
  pickup_location: z.string().min(1, { message: "Ubicación de recogida requerida" }),
  pickuptime: z.object({
    $d: z.instanceof(Date).refine((date) => date !== null && date !== undefined, {
      message: "Fecha de recogida no seleccionada",
    }),
  }),
  dropofftime: z.object(
    {
      $L: z.string(), // Language code
      $d: z.date(), // Date object
      $y: z.number(), // Year
      $M: z.number(), // Month (0-indexed)
      $D: z.number(), // Day of month
      $W: z.number(), // Day of week (0-indexed, starting from Sunday)
      $H: z.number(), // Hour
      $m: z.number(), // Minute
      $s: z.number(), // Second
      $ms: z.number(), // Millisecond
      $isDayjsObject: z.boolean(), // Indicator for Day.js object
    },
    { message: "Fecha de devolución requerida" }
  ),
});

const CarSearch = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_district: "",
      pickup_location: "",
      dropoff_location: "",
      pickuptime: null,
      dropofftime: null,
    },
  });
  
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // ✅ Corregido: Función con nombre más claro
  const handleSearchData = async (data) => {
    try {
      if (data) {
        // Preserving the selected data for later use
        dispatch(setSelectedData(data));
        const pickupDate = data.pickuptime.$d;
        const dropOffDate = data.dropofftime.$d;
        const searchParams = {
          pickupDate,
          dropOffDate,
          pickUpDistrict: data.pickup_district,
          pickUpLocation: data.pickup_location,
        };

        const res = await fetch("api/user/showSingleofSameModel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        });

        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.message || "Error al buscar vehículos");
          return;
        }

        const result = await res.json();
        dispatch(setAvailableCars(result));
        navigate("/availableVehicles");

        // ✅ Corregido: Reset del formulario simplificado
        reset({
          pickup_district: "",
          pickup_location: "",
          dropoff_location: "",
          pickuptime: null,
          dropofftime: null,
        });
        setPickup(null);
      }
    } catch (error) {
      console.error("Error searching vehicles:", error);
      setError("Error de conexión al buscar vehículos");
    }
  };

  // This is to ensure there will be 1 day gap between pickup and dropoff date
  const oneDayGap = pickup ? dayjs(pickup).add(1, "day") : dayjs().add(1, "day");

  return (
    <>
      <section id="booking-section" className="book-section relative z-10 mt-[50px] mx-auto max-w-[1500px] bg-white">
        <div className="container bg-white">
          <div className="book-content">
            <div className="book-content__box">
              <h2>Reservar un auto</h2>
              <p className="error-message">
                ¡Todos los campos son obligatorios! <IconX width={20} height={20} />
              </p>
              <p className="booking-done">
                Revisa tu email para confirmar la orden. <IconX width={20} height={20} />
              </p>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 ¿Para qué sirve?</strong> Este formulario te permite buscar autos disponibles 
                  según tu ubicación de recogida, devolución y fechas. <strong>Escribe cualquier ciudad o dirección</strong> - 
                  ¡No estás limitado a opciones preestablecidas!
                </p>
              </div>

              <form onSubmit={handleSubmit(handleSearchData)}>
                <div className="box-form">
                  <div className="box-form__car-type">
                    <label htmlFor="pickup_district">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Ciudad de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="pickup_district"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id="pickup_district"
                          className="p-2 capitalize"
                          placeholder="Ej: Medellín, Bogotá, Nueva York..."
                          error={Boolean(errors.pickup_district)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    {errors.pickup_district && <p className="text-red-500">{errors.pickup_district.message}</p>}
                  </div>

                  <div className="box-form__car-type">
                    <label htmlFor="pickup_location">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Dirección Específica de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="pickup_location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id="pickup_location"
                          className="md:mb-10 capitalize"
                          placeholder="Ej: Centro Comercial Santa Ana, Aeropuerto JFK..."
                          onChange={(e) => field.onChange(e.target.value)}
                          error={Boolean(errors.pickup_location)}
                        />
                      )}
                    />
                    {errors.pickup_location && <p className="text-red-500">{errors.pickup_location.message}</p>}
                  </div>

                  <div className="box-form__car-type">
                    <label>
                      <IconMapPinFilled className="input-icon" /> &nbsp; Dirección Específica de Devolución <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="dropoff_location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          error={Boolean(errors.dropoff_location)}
                          id="dropoff_location"
                          className="md-mb-10 capitalize"
                          placeholder="Ej: Hotel Hilton, Estación Central..."
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    {errors.dropoff_location && <p className="text-red-500">{errors.dropoff_location.message}</p>}
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="picktime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Fecha de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"pickuptime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker
                              label="Hora de recogida"
                              {...field}
                              value={field.value}
                              minDate={dayjs()}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                                setPickup(newValue);
                              }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.pickuptime && <p className="text-red-500">{errors.pickuptime.message}</p>}
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="droptime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Fecha de Devolución <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"dropofftime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker 
                              label="Hora de devolución" 
                              {...field} 
                              value={field.value} 
                              minDate={pickup ? oneDayGap : dayjs()} 
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.dropofftime && <p className="text-red-500">{errors.dropofftime.message}</p>}
                    {error && <p className="text-[8px] text-red-500">{error}</p>}
                  </div>

                  <button type="submit" className="book-content__box_button">
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CarSearch;