import React, { useEffect, useState } from "react";
import Table from "../../../components/common/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Modal from "../../common/Modal";
import ModelOne from "../../common/Modelone";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExportDropdown from "../../../components/common/Dropdown/Export";
import { ExportToExcel } from "../../common/Dropdown/Excelexport";
import { ExportToPDF } from "../../common/Dropdown/ExportPdf";
import {
  dueReportSummary,
  getActiveScheme,
  getallScheme,
  getOverAllSummary,
  getRecentOrders,
  preCloseSummary,
} from "../../../../chit/api/Endpoints";
import { SlidersHorizontal, Search, X, Columns3 } from "lucide-react";
import { CalendarDays, RefreshCcw } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import DateRangeSelector from "../../common/calender";
import { customSelectStyles } from "../../Setup/purity";
import { useDebounce } from "../../../hooks/useDebounce";
// import Managetables from "./managetables";

function Orderreport() {
  const [isLoading, setisLoading] = useState(true);
  const [overAllData, setOverAllData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [from_date, setfrom_date] = useState();
  const [to_date, setto_date] = useState();
  const [processData, setProcessData] = useState([]);
  const [column, setcolum] = useState(false);
  const [model, setmodel] = useState([]);
   const [searchLoading, setSearchLoading] = useState(false);

  const [orderData, setOrderDatas] = useState([]);
      const [searchInput, setSearchInput] = useState("");
      const debouncedSearch = useDebounce(searchInput, 500);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchLoading(true)
        setSearchInput(value);
        // debouncedSearch(value);
    };
    
//     const overAllData = [
//   {
//     scheme_name: "ORD1001",
//     totalOpenAccount: "2025-09-01",
//     totalPaidAccounts: "Selva Ganesh",
//     totalOpenAmount: "9876543210",
//     totalCloseAccount: 12000,
//     status: "Delivered",
//     closedWeight: "15g",
//   },
//   {
//     scheme_name: "ORD1002",
//     totalOpenAccount: "2025-09-02",
//     totalPaidAccounts: "Karthik Kumar",
//     totalOpenAmount: "9876501234",
//     totalCloseAccount: 8500,
//     status: "Shipped",
//     closedWeight: "10g",
//   },
//   {
//     scheme_name: "ORD1003",
//     totalOpenAccount: "2025-09-03",
//     totalPaidAccounts: "Meena R",
//     totalOpenAmount: "9876123450",
//     totalCloseAccount: 6500,
//     status: "Placed",
//     closedWeight: "8g",
//   },
//   {
//     scheme_name: "ORD1004",
//     totalOpenAccount: "2025-09-04",
//     totalPaidAccounts: "Ravi Shankar",
//     totalOpenAmount: "9988776655",
//     totalCloseAccount: 5000,
//     status: "Cancelled",
//     closedWeight: "5g",
//   },
//   {
//     scheme_name: "ORD1005",
//     totalOpenAccount: "2025-09-05",
//     totalPaidAccounts: "Priya M",
//     totalOpenAmount: "9123456789",
//     totalCloseAccount: 7800,
//     status: "Processing", // 👈 To test "Unknown" badge
//     closedWeight: "6g",
//   },
// ];


  const roleData = useSelector((state) => state.clientForm.roledata);
  const accessBranch = roleData?.branch;
  const id_branch = roleData?.id_branch;

  const [schemeList, setSchemeList] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState();
  //  const [processData, setProcessData] = useState([]);

  const closemodal = () => {
    setcolum(false);
  };

  const openmodal = () => {
    setcolum(true);
  };

  const navigate = useNavigate();





  useEffect(() => {
    const process = overAllData.map((item, index) => ({
      "S.no": index + 1,
    }));
    setProcessData(process);
  }, [overAllData]);

 

  useEffect(() => {
  const payload = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  };

  if (from_date && to_date) {
    payload.from_date = from_date;
    payload.to_date = to_date;
  } else {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    payload.from_date = startOfToday.toISOString();
    payload.to_date = endOfToday.toISOString();
  }

  getOrderAll(payload);
}, [currentPage, itemsPerPage, debouncedSearch, from_date, to_date]);

//    useEffect(() => {
//    getOrderAll({ page: currentPage, limit: itemsPerPage,search:debouncedSearch,from_date:from_date,to_date:to_date });
//  }, [currentPage, itemsPerPage,debouncedSearch,from_date,to_date]);

   const { mutate: getOrderAll } = useMutation({
     mutationFn: ({page,limit,search,from_date,to_date}) => getRecentOrders(page,limit,search,from_date,to_date),
     onSuccess: (response) => {
       const formatted = response?.data?.orders.map((item) => ({
         order_id: item.orderId,
         date: new Date(item.createdAt).toLocaleDateString("en-GB", {
           day: "2-digit",
           month: "2-digit",
           year: "numeric",
         }),
         customer: `${item.userId?.firstname || ""} ${
           item.userId?.lastname || ""
         }`.trim(),
         mobile: item.phone,
         amount: Number(item.totalDiscount || 0).toFixed(2), 
         status: item.status,
       }));
       setSearchLoading(false)
       setOrderDatas(formatted);
       setTotalDocuments(response?.data?.totalCount)
       setTotalPages(response?.data?.totalPages)
       setisLoading(false)
     },
     onError: (error) => {
             setisLoading(false)
             setSearchLoading(false)
       setCardData(initialState);
     },
   });
 

  const getStatusBadge = (status) => {
    let baseStyles =
      "px-3 py-1 rounded-lg font-semibold text-sm border text-center inline-block";
    let fixedWidth = "w-24";

    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span
            className={`${baseStyles} ${fixedWidth} bg-green-100 text-[#12B76A] border-green-400`}
          >
            Delivered
          </span>
        );
      case "pending":
        return (
          <span
            className={`${baseStyles} ${fixedWidth} bg-yellow-100 text-[#FDA700] border-yellow-400`}
          >
            Shipped
          </span>
        );
      case "placed":
        return (
          <span
            className={`${baseStyles} ${fixedWidth} bg-teal-100 text-teal-700 border-teal-400`}
          >
            Placed
          </span>
        );
      case "cancelled":
        return (
          <span
            className={`${baseStyles} ${fixedWidth} bg-red-100 text-red-700 border-red-400`}
          >
            Cancelled
          </span>
        );
      default:
        return (
          <span
            className={`${baseStyles} ${fixedWidth} bg-gray-100 text-gray-700 border-gray-400`}
          >
            Processing
          </span>
        );
    }
  };


  const columns = [
    {
      header: "S.No",
     cell: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Order ID",
      cell: (row) => row.order_id,
    },
    {
      header: "Date",
      cell: (row) => row.date,
    },
    {
      header: "Customer",
      cell: (row) => row.customer,
    },
    {
      header: "Mobile Number",
      cell: (row) => row.mobile,
    },
    {
      header: "Amount (₹)",
      cell: (row) => `₹${row.amount}`,
    },
    {
      header: "Status",
      cell: (row) => getStatusBadge(row?.status),
    },
  ];
  const handleSchemeClick = (row) => {
    navigate("/report/table", {
      state: { id: row._id, type: "scheme" },
    });
  };

  const handlePageChange = (page) => {
    const pageNumber = Number(page);
    if (
      !pageNumber ||
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > totalPages
    ) {
      return;
    }

    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Ecom Reports" },
          { label: "Orders", active: true },
        ]}
      />
      <div className="flex flex-col p-4 bg-white border-2 border-[#F2F2F9] rounded-[16px] ">
        {/* <hr className="mt-2"/> */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4">
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
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-start">
            </div>
            <div className="flex justify-end items-center gap-4">
              <DateRangeSelector
                onChange={(range) => {
                  setfrom_date(range.startDate);
                  setto_date(range.endDate);
                }}
              />
              <ExportDropdown
                apiData={orderData}
                fileName={`Order report ${new Date().toLocaleDateString(
                  "en-GB"
                )}`}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Table
            data={orderData}
            columns={columns}
            loading={isLoading}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalDocuments}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
        <Modal />
        <ModelOne
          title={
            <div>
              <h1 className="text-md font-medium text-black mt-2">
                Want to Manage Tables?
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Please Drag and Drop your column to reorder your table and
                enable see options you want
              </p>
            </div>
          }
          isOpen={column}
          extraClassName="w-1/3"
          setIsOpen={setcolum}
          closeModal={closemodal}
        >
          {/* <div>
            <Managetables setIsOpen={setcolum} />
          </div> */}
        </ModelOne>
      </div>
    </>
  );
}

export default Orderreport;