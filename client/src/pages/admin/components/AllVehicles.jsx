import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setEditData } from "../../../redux/adminSlices/actions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { showVehicles } from "../../../redux/user/listAllVehicleSlice";
import {
  clearAdminVehicleToast,
} from "../../../redux/adminSlices/adminDashboardSlice/StatusSlice";

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAddVehicleClicked } = useSelector((state) => state.addVehicle);
  
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError } =
    useSelector((state) => state.statusSlice);

  // Show vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/showVehicles", {
          method: "GET",
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAllVehicles(data);
          dispatch(showVehicles(data));
        } else {
          toast.error("Error al cargar vehículos");
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Error al cargar vehículos");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [isAddVehicleClicked, dispatch]);

  // Delete a vehicle
  const handleDelete = async (vehicleId) => {
    try {
      const res = await fetch(`/api/admin/deleteVehicle/${vehicleId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (res.ok) {
        toast.success("Vehículo eliminado exitosamente");
        // Recargar la lista de vehículos
        fetchVehicles();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al eliminar vehículo");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Error al eliminar vehículo");
    }
  };

  // Edit a vehicle
  const handleEdit = (vehicle) => {
    dispatch(setEditData(vehicle));
    navigate("/adminDashboard/editProducts");
  };

  // Clear toasts
  useEffect(() => {
    if (adminEditVehicleSuccess) {
      toast.success("Vehículo editado exitosamente");
      dispatch(clearAdminVehicleToast());
    }
    if (adminAddVehicleSuccess) {
      toast.success("Vehículo agregado exitosamente");
      dispatch(clearAdminVehicleToast());
    }
    if (adminCrudError) {
      toast.error(adminCrudError);
      dispatch(clearAdminVehicleToast());
    }
  }, [adminEditVehicleSuccess, adminAddVehicleSuccess, adminCrudError, dispatch]);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "registeration_number", headerName: "Placa", width: 120 },
    { field: "company", headerName: "Marca", width: 120 },
    { field: "name", headerName: "Modelo", width: 120 },
    { field: "year_made", headerName: "Año", width: 80 },
    { field: "fuel_type", headerName: "Combustible", width: 120 },
    { field: "seats", headerName: "Asientos", width: 100 },
    { field: "price", headerName: "Precio", width: 100 },
    { field: "location", headerName: "Ubicación", width: 150 },
    { field: "district", headerName: "Distrito", width: 120 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ModeEditOutlineIcon />}
            onClick={() => handleEdit(params.row)}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteForeverIcon />}
            onClick={() => handleDelete(params.row._id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const rows = allVehicles.map((vehicle, index) => ({
    id: index + 1,
    ...vehicle,
  }));

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Página" title="Todos los Vehículos" />
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row._id}
        />
      </Box>
      <Toaster position="top-right" />
    </div>
  );
}

export default AllVehicles;
