import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

function VenderVehicleRequests() {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vendor vehicle requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/fetchVendorVehilceRequests", {
          method: "GET",
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setRequests(data.data || []);
        } else {
          toast.error("Error al cargar solicitudes");
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Error al cargar solicitudes");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Approve vehicle request
  const handleApprove = async (vehicleId) => {
    try {
      const res = await fetch("/api/admin/approveVendorVehicleRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ _id: vehicleId }),
      });
      
      if (res.ok) {
        setRequests(requests.filter(req => req._id !== vehicleId));
        toast.success("Solicitud aprobada exitosamente");
      } else {
        toast.error("Error al aprobar solicitud");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Error al aprobar solicitud");
    }
  };

  // Reject vehicle request
  const handleReject = async (vehicleId) => {
    try {
      const res = await fetch("/api/admin/rejectVendorVehicleRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ 
          _id: vehicleId,
          rejectionReason: "Solicitud rechazada por el administrador"
        }),
      });
      
      if (res.ok) {
        setRequests(requests.filter(req => req._id !== vehicleId));
        toast.success("Solicitud rechazada exitosamente");
      } else {
        toast.error("Error al rechazar solicitud");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Error al rechazar solicitud");
    }
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
    { field: "addedBy", headerName: "Agregado por", width: 150 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleApprove(params.row._id)}
          >
            Aprobar
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => handleReject(params.row._id)}
          >
            Rechazar
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              // TODO: Implementar vista de detalles
              toast.info("Vista de detalles próximamente");
            }}
          >
            Ver
          </Button>
        </div>
      ),
    },
  ];

  const rows = requests.map((request, index) => ({
    id: index + 1,
    ...request,
  }));

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Página" title="Solicitudes de Vendedores" />
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

export default VenderVehicleRequests;
