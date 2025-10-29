// import { useEffect, useState, useCallback, useMemo } from "react";
// import Table from "../../../components/common/Table";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import "jspdf-autotable";
// import ExportDropdown from "../../../components/common/Dropdown/Export";
// import {
//   getActiveScheme,
//   getAllorderlist,
// } from "../../../../chit/api/Endpoints";
// import { Search } from "lucide-react";
// import "react-datepicker/dist/react-datepicker.css";
// import { useDispatch, useSelector } from "react-redux";
// import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
// import DateRangeSelector from "../../common/calender";
// import { debounce } from "lodash";
// import Action from "../../common/action";
// import Modal from "../../../components/common/Modal";
// import ModelOne from "../../common/Modelone";
// import RequestShipment from "./Request";
// import { useNavigate } from "react-router-dom";
// import OrderStatus from "./Status";

// function Orderlist() {
//   const roleData = useSelector((state) => state.clientForm.roledata);
//   const layout_color = useSelector((state) => state.clientForm.layoutColor);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { accessBranch, id_branch, id_role, id_client } = useMemo(() => ({
//     accessBranch: roleData?.branch,
//     id_branch: roleData?.id_branch,
//     id_role: roleData?.id_role?.id_role,
//     id_client: roleData?.id_client,
//   }), [roleData]);

//   // State declarations
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalDocuments, setTotalDocuments] = useState(0);
//   const [from_date, setFromDate] = useState();
//   const [to_date, setToDate] = useState();
//   const [searchInput, setSearchInput] = useState("");
//   const [selectedScheme, setSelectedScheme] = useState();
//   const [selectedPaymentMode, setSelectedPaymentMode] = useState();
//   const [schemeList, setSchemeList] = useState([]);
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [modalState, setModalState] = useState({
//     isViewOpen: false,
//     isViewOpenReq: false,
//     isViewStatus: false,
//   });
//   const [selectedId, setSelectedId] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState('');


//   const { data: orderResponse } = useQuery({
//     queryKey: ["orderlist", from_date, to_date, currentPage, itemsPerPage, searchInput, selectedScheme, selectedPaymentMode],
//     queryFn: () => getAllorderlist({
//       from_date,
//       to_date,
//       page: currentPage,
//       limit: itemsPerPage,
//       search: searchInput,
//       id_scheme: selectedScheme,
//       payment_mode: selectedPaymentMode,
//     }),
//     enabled: true,
//   });

//   const orderList = orderResponse?.data?.orders || [];
  
//   useEffect(() => {
//     if (orderResponse?.data) {
//       setTotalPages(orderResponse.data.totalPages || 0);
//       setTotalDocuments(orderResponse.data.totalDocuments || 0);
//       setIsLoading(false);
//       setSearchLoading(false);
//     }
//   }, [orderResponse]);

//   // Memoized values
//   const customSelectStyles = useCallback((isReadOnly) => ({
//     control: (base, state) => ({
//       ...base,
//       minHeight: "42px",
//       backgroundColor: "white",
//       border: state.isFocused ? "1px solid black" : "2px solid #f2f3f8",
//       boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
//       borderRadius: "0.375rem",
//       "&:hover": { color: "#e2e8f0" },
//       pointerEvents: isReadOnly ? "auto" : "none",
//       opacity: 1,
//     }),
//     indicatorSeparator: () => ({ display: "none" }),
//     placeholder: (base) => ({
//       ...base,
//       color: "#858293",
//       fontWeight: "thin",
//     }),
//     dropdownIndicator: (provided) => ({
//       ...provided,
//       color: "#232323",
//       "&:hover": { color: "#232323" },
//     }),
//   }), []);

//   // Mutations
//   const { mutate: getAllScheme } = useMutation({
//     mutationFn: getActiveScheme,
//     onSuccess: (response) => {
//       setSchemeList(
//         response.data.map((item) => ({
//           label: item.scheme_name,
//           value: item._id,
//         }))
//       );
//     },
//     onError: (error) => {
//       setIsLoading(false);
//       console.error("Error fetching scheme data:", error);
//     },
//   });

//   // Debounced search
//   const debouncedSearch = useCallback(
//     debounce((searchValue) => {
//       setSearchLoading(true);
//       setSearchInput(searchValue);
//       setCurrentPage(1);
//     }, 500),
//     []
//   );

//   // Effects
//   useEffect(() => {
//     return () => debouncedSearch.cancel();
//   }, [debouncedSearch]);

//   useEffect(() => {
//     if (!roleData) return;
//     if (accessBranch === 0) {
//       getAllScheme();
//     }
//   }, [roleData, accessBranch]);

//   // Event handlers
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     debouncedSearch(value);
//   };

//   const handlePageChange = (page) => {
//     const pageNumber = Number(page);
//     if (pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   const handleItemsPerPageChange = (value) => {
//     setItemsPerPage(value);
//     setCurrentPage(1);
//   };

//   const handleEdit = (id) => {
//     setSelectedId(id);
//   };

//   const handleView = (id) => {
//     navigate(`/ecom/orderlist_details/${id}`);
//   };

//   const handleGeneratePDF = () => {
//     navigate('/ecom');
//   };

//   const closeModal = () => {
//     setModalState({
//       isViewOpen: false,
//       isViewOpenReq: false,
//       isViewStatus: false,
//     });
//     setSelectedId("");
//   };

//   const openModal = (modalType, id = "", status) => {
//     console.log(status);
//     setSelectedStatus(status);
//     setSelectedId(id);
//     setModalState(prev => ({
//       ...prev,
//       [modalType]: true
//     }));
//   };

//   const handleActiveDropdown = (data) => {
//     setActiveDropdown(data);
//   };

//   // Table columns
//   const columns = useMemo(() => [
//     {
//       header: "S.No",
//       cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
//     },
//     {
//       header: "Order ID",
//       cell: (row) => row?.orderId,
//     },
//     {
//       header: "Order Date",
//       cell: (row) => row?.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "",
//     },
//     {
//       header: "Quantity",
//       cell: (row) => row?.itemsCount
//     },
//     {
//       header: "Price",
//       cell: (row) => row?.totalAmount !== undefined ? Number(row.totalAmount).toFixed(3) : "",
//     },
//     {
//       header: "Status",
//       cell: (row) => (
//         <button
//           className={`px-4 py-1 rounded-lg font-medium text-sm transition border ${
//             row.status
//               ? "border-blue-400 text-blue-500 bg-blue-50 cursor-default"
//               : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
//           }`}
//           disabled={row.status && ["Delivered", "Cancelled"].includes(row.status)}
//           onClick={() => openModal("isViewStatus", row._id, row.status)}
//         >
//           {row.status ? row.status : "Set"}
//         </button>
//       ),
//     },
//     {
//       header: "Actions",
//       cell: (row, rowIndex) => (
//         <Action
//           row={row}
//           data={orderList}
//           rowIndex={rowIndex}
//           activeDropdown={activeDropdown}
//           setActive={handleActiveDropdown}
//           handleEdit={handleEdit}
//           handleView={handleView}
//           handleGeneratePDF={handleGeneratePDF}
//           showpdf={true}
//           handleDelete={false}
//         />
//       ),
//       sticky: "right",
//     },
//   ], [currentPage, itemsPerPage, orderList, activeDropdown]);

//   return (
//     <>
//       <Breadcrumb
//         items={[
//           { label: "Order" },
//           { label: "Order History", active: true },
//         ]}
//       />
      
//       <div className="flex flex-col p-4 bg-white border border-[#F2F2F9] rounded-[16px]">
//         <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4 w-full">
//           <div className="flex justify-start">
//             <div className="relative w-90 sm:w-[228px] ml-5">
//               <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
//                 {searchLoading ? (
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
//                 ) : (
//                   <Search className="text-[#6C7086] h-5 w-5" />
//                 )}
//               </div>
//               <input
//                 value={searchInput}
//                 onChange={handleSearchChange}
//                 placeholder="Search"
//                 className="pl-8 pr-4 py-2 border-2 border-[#F2F2F9] rounded-[8px] w-full"
//               />
//             </div>
//           </div>
          
//           <div className="flex justify-end items-center w-full">
//             <div className="flex justify-end items-center gap-4">
//               <DateRangeSelector
//                 onChange={(range) => {
//                   setFromDate(range.startDate);
//                   setToDate(range.endDate);
//                 }}
//               />
//               <ExportDropdown
//                 apiData={orderList}
//                 fileName={`Order List ${new Date().toLocaleDateString("en-GB")}`}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-4">
//           <Table
//             data={orderList}
//             columns={columns}
//             loading={isLoading}
//             currentPage={currentPage}
//             handlePageChange={handlePageChange}
//             itemsPerPage={itemsPerPage}
//             totalItems={totalDocuments}
//             handleItemsPerPageChange={handleItemsPerPageChange}
//           />
//         </div>

//         {/* Modals */}
//         <ModelOne
//           title="Request Shipment"
//           extraClassName="w-[400px]"
//           setIsOpen={() => openModal("isViewOpenReq")}
//           isOpen={modalState.isViewOpenReq}
//           closeModal={closeModal}
//         >
//           <RequestShipment setIsOpen={() => setModalState(prev => ({...prev, isViewOpenReq: false}))} />
//         </ModelOne>

//         <ModelOne
//           title="Status"
//           extraClassName="w-[400px]"
//           setIsOpen={() => openModal("isViewStatus")}
//           isOpen={modalState.isViewStatus}
//           closeModal={closeModal}
//         >
//           <OrderStatus setIsOpen={() => setModalState(prev => ({...prev, isViewStatus: false}))} id={selectedId} currentStatus={selectedStatus} />
//         </ModelOne>
        
//         <Modal />
//       </div>
//     </>
//   );
// }

// export default Orderlist;
import { useEffect, useState, useCallback, useMemo } from "react";
import Table from "../../../components/common/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import "jspdf-autotable";
import ExportDropdown from "../../../components/common/Dropdown/Export";
import {
  getActiveScheme,
  getAllorderlist,
} from "../../../../chit/api/Endpoints";
import { Search } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import DateRangeSelector from "../../common/calender";
import { debounce } from "lodash";
import Action from "../../common/action";
import Modal from "../../../components/common/Modal";
import ModelOne from "../../common/Modelone";
import RequestShipment from "./Request";
import { useNavigate } from "react-router-dom";
import OrderStatus from "./Status";

function Orderlist() {
  const roleData = useSelector((state) => state.clientForm.roledata);
  const layout_color = useSelector((state) => state.clientForm.layoutColor);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { accessBranch, id_branch, id_role, id_client } = useMemo(() => ({
    accessBranch: roleData?.branch,
    id_branch: roleData?.id_branch,
    id_role: roleData?.id_role?.id_role,
    id_client: roleData?.id_client,
  }), [roleData]);

  // State declarations
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [from_date, setFromDate] = useState();
  const [to_date, setToDate] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [selectedScheme, setSelectedScheme] = useState();
  const [selectedPaymentMode, setSelectedPaymentMode] = useState();
  const [schemeList, setSchemeList] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modalState, setModalState] = useState({
    isViewOpen: false,
    isViewOpenReq: false,
    isViewStatus: false,
  });
  const [selectedId, setSelectedId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('');

  // Use the refetch function from useQuery
  const { 
    data: orderResponse, 
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ["orderlist", from_date, to_date, currentPage, itemsPerPage, searchInput, selectedScheme, selectedPaymentMode],
    queryFn: () => getAllorderlist({
      from_date,
      to_date,
      page: currentPage,
      limit: itemsPerPage,
      search: searchInput,
      id_scheme: selectedScheme,
      payment_mode: selectedPaymentMode,
    }),
    enabled: true,
  });

  const orderList = orderResponse?.data?.orders || [];
  
  useEffect(() => {
    if (orderResponse?.data) {
      setTotalPages(orderResponse.data.totalPages || 0);
      setTotalDocuments(orderResponse.data.totalDocuments || 0);
      setIsLoading(false);
      setSearchLoading(false);
    }
  }, [orderResponse]);

  // Memoized values
  const customSelectStyles = useCallback((isReadOnly) => ({
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      backgroundColor: "white",
      border: state.isFocused ? "1px solid black" : "2px solid #f2f3f8",
      boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
      borderRadius: "0.375rem",
      "&:hover": { color: "#e2e8f0" },
      pointerEvents: isReadOnly ? "auto" : "none",
      opacity: 1,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    placeholder: (base) => ({
      ...base,
      color: "#858293",
      fontWeight: "thin",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#232323",
      "&:hover": { color: "#232323" },
    }),
  }), []);

  // Mutations
  const { mutate: getAllScheme } = useMutation({
    mutationFn: getActiveScheme,
    onSuccess: (response) => {
      setSchemeList(
        response.data.map((item) => ({
          label: item.scheme_name,
          value: item._id,
        }))
      );
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("Error fetching scheme data:", error);
    },
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchLoading(true);
      setSearchInput(searchValue);
      setCurrentPage(1);
    }, 500),
    []
  );

  // Effects
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (!roleData) return;
    if (accessBranch === 0) {
      getAllScheme();
    }
  }, [roleData, accessBranch]);

  // Event handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handlePageChange = (page) => {
    const pageNumber = Number(page);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleEdit = (id) => {
    setSelectedId(id);
  };

  const handleView = (id) => {
    navigate(`/ecom/orderlist_details/${id}`);
  };

  const handleGeneratePDF = () => {
    navigate('/ecom');
  };

  const closeModal = () => {
    setModalState({
      isViewOpen: false,
      isViewOpenReq: false,
      isViewStatus: false,
    });
    setSelectedId("");
    
    // Refetch orders when modal closes
    refetchOrders();
  };

  const openModal = (modalType, id = "", status) => {
    console.log(status);
    setSelectedStatus(status);
    setSelectedId(id);
    setModalState(prev => ({
      ...prev,
      [modalType]: true
    }));
  };

  const handleActiveDropdown = (data) => {
    setActiveDropdown(data);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "Order ID",
      cell: (row) => row?.orderId,
    },
    {
      header: "Order Date",
      cell: (row) => row?.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "",
    },
    {
      header: "Quantity",
      cell: (row) => row?.itemsCount
    },
    {
      header: "Price",
      cell: (row) => row?.totalAmount !== undefined ? Number(row.totalAmount).toFixed(3) : "",
    },
    // {
    //   header: "Status",
    //   cell: (row) => (
    //     <button
    //       className={`px-4 py-1 rounded-lg font-medium text-sm transition border ${
    //         row.status
    //           ? "border-blue-400 text-blue-500 bg-blue-50 cursor-default"
    //           : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
    //       }`}
    //       disabled={row.status && ["Delivered", "Cancelled"].includes(row.status)}
    //       onClick={() => openModal("isViewStatus", row._id, row.status)}
    //     >
    //       {row.status ? row.status : "Set"}
    //     </button>
    //   ),
    // },
    {
  header: "Status",
  cell: (row) => {
    const getStatusStyles = (status) => {
      switch(status) {
        case "Delivered":
          return " text-[#12B76A] bg-[#12B76A38]";
        case "Shipped":
          return " text-[#FDA700] bg-[#FDA70038]";
        case "Cancelled":
          return "text-[#FF0000] bg-[#FF000038]";
        case "Placed":
          return "text-[#118D6E] bg-[#118D6E38]";
        default:
          return "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white";
      }
    };

    const isDisabled = row.status && ["Delivered", "Cancelled"].includes(row.status);
    const statusStyles = getStatusStyles(row.status);

    return (
          <button
            className={`px-4 py-1 rounded-lg font-medium text-sm transition border ${row.status
                ? statusStyles
                : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              } ${isDisabled ? "cursor-default" : ""}`}
            disabled={isDisabled}
            onClick={() => openModal("isViewStatus", row._id, row.status)}
          >
            {row.status ? row.status : "Set"}
          </button>
        );
      },
    },
    {
      header: "Actions",
      cell: (row, rowIndex) => (
        <Action
          row={row}
          data={orderList}
          rowIndex={rowIndex}
          activeDropdown={activeDropdown}
          setActive={handleActiveDropdown}
          handleEdit={handleEdit}
          handleView={handleView}
          handleGeneratePDF={handleGeneratePDF}
          showpdf={true}
          handleDelete={false}
        />
      ),
      sticky: "right",
    },
  ], [currentPage, itemsPerPage, orderList, activeDropdown]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Order" },
          { label: "Order History", active: true },
        ]}
      />
      
      <div className="flex flex-col p-4 bg-white border border-[#F2F2F9] rounded-[16px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4 w-full">
          <div className="flex justify-start">
            <div className="relative w-90 sm:w-[228px] ml-5">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                ) : (
                  <Search className="text-[#6C7086] h-5 w-5" />
                )}
              </div>
              <input
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search"
                className="pl-8 pr-4 py-2 border-2 border-[#F2F2F9] rounded-[8px] w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end items-center w-full">
            <div className="flex justify-end items-center gap-4">
              <DateRangeSelector
                onChange={(range) => {
                  setFromDate(range.startDate);
                  setToDate(range.endDate);
                }}
              />
              <ExportDropdown
                apiData={orderList}
                fileName={`Order List ${new Date().toLocaleDateString("en-GB")}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Table
            data={orderList}
            columns={columns}
            loading={isLoading}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalDocuments}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>

        {/* Modals */}
        <ModelOne
          title="Request Shipment"
          extraClassName="w-[400px]"
          // setIsOpen={() => openModal("isViewOpenReq")}
           setIsOpen={() => setModalState(prev => ({...prev, isViewStatus: false}))}
          isOpen={modalState.isViewOpenReq}
          closeModal={closeModal}
        >
          <RequestShipment 
            setIsOpen={() => setModalState(prev => ({...prev, isViewOpenReq: false}))} 
            onSuccess={refetchOrders} // Pass refetch function as callback
          />
        </ModelOne>

        <ModelOne
          title="Status"
          extraClassName="w-[400px]"
          // setIsOpen={() => openModal("isViewStatus")}
           setIsOpen={() => setModalState(prev => ({...prev, isViewStatus: false}))}
          isOpen={modalState.isViewStatus}
          closeModal={closeModal}
        >
          <OrderStatus 
            setIsOpen={() => setModalState(prev => ({...prev, isViewStatus: false}))} 
            id={selectedId} 
            currentStatus={selectedStatus}
            onSuccess={refetchOrders} // Pass refetch function as callback
          />
        </ModelOne>
        
        <Modal />
      </div>
    </>
  );
}

export default Orderlist;