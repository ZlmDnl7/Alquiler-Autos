import { GrStatusGood } from "react-icons/gr";
import { MdOutlinePending } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import { 
  setUpdateRequestTable, 
  setVenodrVehilces, 
  setadminVenodrRequest 
} from "../../../redux/vendor/vendorDashboardSlice";

const VenderVehicleRequests = () => {
  const { vendorVehicleApproved, vendorVehilces, adminVenodrRequest } = useSelector(
    (state) => state.vendorDashboardSlice
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchVendorRequest = async () => {
      try {
        const res = await fetch(`/api/admin/fetchVendorVehilceRequests`, {
          method: "GET",
        });
        if (!res.ok) {
          console.error(
            "Failed to fetch vendor vehicle requests:",
            res.statusText
          );
          return;
        }
        const data = await res.json();
        dispatch(setVenodrVehilces(data));
        dispatch(setadminVenodrRequest(data));
      } catch (error) {
        console.error("Error fetching vendor requests:", error);
      }
    };
    fetchVendorRequest();
  }, [dispatch]);

  // Approve vendor vehicle request
  const handleApproveRequest = async (id) => {
    try {
      dispatch(setUpdateRequestTable(id));
      const res = await fetch("/api/admin/approveVendorVehicleRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
        }),
      });
      if (!res.ok) {
        console.error("Error approving request:", res.statusText);
        return;
      }
      const data = await res.json();
      console.log("Request approved:", data);
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  // Reject vendor vehicle request
  const handleReject = async (id) => {
    try {
      const res = await fetch("/api/admin/rejectVendorVehicleRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
        }),
      });
      if (!res.ok) {
        console.error("Error rejecting request:", res.statusText);
        return;
      }
      const data = await res.json();
      console.log("Request rejected:", data);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // ✅ Corregido: Funciones separadas para manejar approve y reject
  const handleApproveClick = (id) => {
    handleApproveRequest(id);
    dispatch(setUpdateRequestTable(id));
  };

  const handleRejectClick = (id) => {
    handleReject(id);
    dispatch(setUpdateRequestTable(id));
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          style={{
            width: "50px",
            height: "40px",
            borderRadius: "5px",
            objectFit: "cover",
          }}
          alt="vehicle"
        />
      ),
    },
    {
      field: "registeration_number",
      headerName: "Register Number",
      width: 150,
    },
    { field: "company", headerName: "Company", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) =>
        params.row.status ? (
          <div className="text-yellow-500 bg-yellow-100 p-2 rounded-lg flex items-center justify-center gap-x-1">
            <span className="text-[8px]">Pending</span>
            <MdOutlinePending />
          </div>
        ) : (
          <div className="text-green-500 bg-green-100 p-2 rounded-lg flex items-center justify-center gap-x-1">
            <span className="text-[8px]">Approved</span>
            <GrStatusGood />
          </div>
        ),
    },
    {
      field: "Approve",
      headerName: "Approve",
      width: 100,
      renderCell: (params) => (
        <Button
          className="bg-green-500"
          onClick={() => handleApproveClick(params.row.id)}
        >
          <GrStatusGood style={{ fontSize: 24, color: 'green' }} />
        </Button>
      ),
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 100,
      renderCell: (params) => (
        <Button
          className="bg-red-200"
          onClick={() => handleRejectClick(params.row.id)}
        >
          <IoIosCloseCircle style={{ fontSize: 28, color: 'red' }} />
        </Button>
      ),
    },
  ];

  // ✅ Corregido: Verificación más robusta para rows
  const rows = adminVenodrRequest
    ? adminVenodrRequest
        .filter((vehicle) => vehicle.isDeleted === "false")
        .map((vehicle) => ({
          id: vehicle._id,
          image: vehicle.image?.[0] || '', // Verificación adicional
          registeration_number: vehicle.registeration_number,
          company: vehicle.company,
          name: vehicle.name,
          status: !vehicle.isAdminApproved,
        }))
    : [];

  const isVendorVehiclesEmpty = !vendorVehilces || vendorVehilces.length === 0;

  return (
    <div className="max-w-[1000px] d-flex justify-end text-start items-end p-10 bg-slate-100 rounded-md">
      {isVendorVehiclesEmpty ? (
        <p>No requests yet</p>
      ) : (
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize:
                    vendorVehicleApproved && vendorVehicleApproved.length > 10
                      ? 10
                      : 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              ".MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "&.MuiDataGrid-root": {
                border: "none",
              },
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default VenderVehicleRequests;