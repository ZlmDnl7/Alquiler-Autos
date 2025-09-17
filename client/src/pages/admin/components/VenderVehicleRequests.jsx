import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Header } from "../components";
import toast, { Toaster } from "react-hot-toast";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

function VenderVehicleRequests() {
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
          
          // Mostrar mensaje informativo si no hay solicitudes
          if (data.count === 0) {
            toast.success("No hay solicitudes pendientes de vendedores");
          }
        } else {
          // Solo mostrar error para errores reales del servidor
          const errorData = await res.json();
          toast.error(errorData.message || "Error al cargar solicitudes");
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Error de conexión al cargar solicitudes");
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
              // Implementar vista de detalles del vehículo
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
      
      {requests.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-gray-500 mb-4">
            Los vendedores aún no han enviado solicitudes de vehículos para aprobar.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Las solicitudes de vendedores aparecerán aquí cuando los vendedores agreguen nuevos vehículos a la plataforma.
            </p>
          </div>
        </div>
      ) : (
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
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}

export default VenderVehicleRequests;
