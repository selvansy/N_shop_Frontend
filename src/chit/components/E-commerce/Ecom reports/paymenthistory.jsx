import React, { useEffect, useState } from "react";
import Table from "../../../components/common/Table";
import { useMutation } from "@tanstack/react-query";
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
  getallpaymentmode,
  getallScheme,
  getOverAllSummary,
  getTopTenSellProduct,
  paymentDataList,
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

function PaymentHistoyReport() {
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
    const [selectedPaymentMode, setSelectedPaymentMode] = useState();
     const [branchOptions, setBranchOptions] = useState([]);

      const [searchInput, setSearchInput] = useState("");
      const debouncedSearch = useDebounce(searchInput, 500);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
    };

     const { mutate: getAllbranch } = useMutation({
        mutationFn: () => getallpaymentmode(),
        onSuccess: (response) => {
          setBranchOptions(
            response.data.map((branch) => ({
              value: branch._id,
              label: branch.mode_name,
            }))
          );
        },
        onError: (error) => {
          setisLoading(false);
          console.error("Error fetching payment data:", error);
        },
      });

      useEffect(()=>{
        getAllbranch()
      },[])
    

  const roleData = useSelector((state) => state.clientForm.roledata);
  const accessBranch = roleData?.branch;
  const id_branch = roleData?.id_branch;

  const [schemeList, setSchemeList] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState();
  const [paymentData, setPaymentData] = useState([]);

  // Format date to dd-mm-yyyy
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const payload = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      paymentMode: selectedPaymentMode
    };
  
    if (from_date && to_date) {
      payload.from_date = from_date;
      payload.to_date = to_date;
    } else {
      const today = new Date();
      payload.from_date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      payload.to_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
    }
  
    getOverAll(payload);
  }, [currentPage, itemsPerPage, debouncedSearch, from_date, to_date, selectedPaymentMode]);

  const { mutate: getOverAll } = useMutation({
    mutationFn: ({page, limit, search, from_date, to_date, paymentMode}) => 
      paymentDataList(page, limit, search, from_date, to_date, paymentMode),
    onSuccess: (response) => {
      // Format the payment data with proper date formatting
      const formattedData = response.data?.result?.map(item => ({
        ...item,
        formattedDate: formatDateToDDMMYYYY(item?.createdAt)
      })) || [];
      
      setPaymentData(formattedData);
      setTotalDocuments(response.data?.totalCount || 0);
      setTotalPages(response.data?.totalPages || 0);
      setisLoading(false);
    },
    onError: (error) => {
      setPaymentData([]);
      setisLoading(false);
      console.error("Error fetching payment data:", error);
    },
  });

  const closemodal = () => {
    setcolum(false);
  };

  const openmodal = () => {
    setcolum(true);
  };

  const navigate = useNavigate();
  
  const columns = [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "Order Id",
      cell: (row) => row?.orderId,
    },
    {
      header: "Payment Date",
      cell: (row) => row?.formattedDate, // Use the pre-formatted date
    },
    {
      header: "Customer",
      cell: (row) => {
        const customer = row?.id_customer;
        return customer 
          ? `${customer.firstname} ${customer.lastname ?? ""}` 
          : "";
      }
    },
    {
      header: "Mobile number",
      cell: (row) => row?.id_customer?.mobile || "",
    },
    {
      header: "Paid Amount",
      cell: (row) => `₹${row?.payment_amount || 0}`,
    },
    {
      header: "Payment Mode",
      cell: (row) => row?.paymentModeName,
    }
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
          { label: "Order", active: true },
        ]}
      />
      <div className="flex flex-col p-4 bg-white border-2 border-[#F2F2F9] rounded-[16px] ">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4">
          <div className="flex justify-start">
            {/* <div className="w-60">
              <Select
                styles={customSelectStyles(true)}
                placeholder="Payment Mode"
                options={branchOptions || []}
                isClearable={true}
                value={
                  branchOptions.find(
                    (option) => option.value === selectedPaymentMode
                  ) || null
                }
                onChange={(option) => {
                  setSelectedPaymentMode(option ? option.value : null);
                }}
              />
            </div> */}
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
                apiData={paymentData}
                fileName={`Payment History Report ${new Date().toLocaleDateString("en-GB").split('/').join('-')}`}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Table
            data={paymentData}
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

export default PaymentHistoyReport;