import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { Header } from "../../admin/components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import AddIcon from "@mui/icons-material/Add";
import { setEditData } from "../../../redux/adminSlices/actions";

function VendorAllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vendor vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vendor/showVendorVehilces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ _id: currentUser?._id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setVehicles(data || []);
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

  useEffect(() => {
    if (currentUser?._id) {
      fetchVehicles();
    }
  }, [currentUser?._id]);

  // Delete a vehicle
  const handleDelete = async (vehicleId) => {
    try {
      const res = await fetch(`/api/vendor/vendorDeleteVehicles/${vehicleId}`, {
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
    navigate("/vendorDashboard/vendorEditProductComponent");
  };

  // Add new vehicle
  const handleAdd = () => {
    navigate("/vendorDashboard/vendorAddProduct");
  };

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
      field: "isAdminApproved", 
      headerName: "Estado", 
      width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded text-xs ${
          params.row.isAdminApproved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {params.row.isAdminApproved ? 'Aprobado' : 'Pendiente'}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 200,
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

  const rows = vehicles.map((vehicle, index) => ({
    id: index + 1,
    ...vehicle,
  }));

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <Header category="Página" title="Mis Vehículos" showAddButton={false} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Agregar Vehículo
        </Button>
      </div>
      
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

export default VendorAllVehicles;
