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
  getallScheme,
  getOverAllSummary,
  getSellProduct,
  getTopTenSellProduct,
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

function topselling() {
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

    const [searchInput, setSearchInput] = useState("");
    
   const debouncedSearch = useDebounce(searchInput, 500);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        // debouncedSearch(value);
    };
    

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

   const [productData,setProductData] =useState([]) 
   useEffect(() => {
      getOverAll();
    }, [from_date,to_date,debouncedSearch,currentPage,itemsPerPage]);
  
  const { mutate: getOverAll } = useMutation({
      mutationFn: () => getSellProduct({fromDate:from_date,toDate:to_date,search:debouncedSearch,page:currentPage,limit:itemsPerPage}),
      onSuccess: (response) => {
       setProductData(response.data?.result)
       setisLoading(false)
       setTotalDocuments(response?.data?.totalDocuments)
       setTotalPages(response?.data?.totalPages)
      },
      onError: (error) => {
       setProductData([])
      setisLoading(false)

      },
    })
  

  const columns = [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "Product Name",
      cell: (row) => row?.name,
      //   (
      //   <span
      //     className="cursor-pointer hover:underline font-semibold"
      //     onClick={() =>
      //       handleSchemeClick(row)}
      //   >
      //     {row?.scheme_name}
      //   </span>
      // ),
    },
    {
      header: "Category",
      cell: (row) => row?.categoryName,
    },
    {
      header: "Metal",
      cell: (row) => row?.metalName,
    },
    {
      header: "Purity",
      cell: (row) => row?.purityName,
    },
    {
      header: "Units Sold",
      cell: (row) => row?.totalSold,
    },
    {
      header: "Total Revenue(₹)",
      cell: (row) => row?.totalAmount,
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
          { label: "Top Selling Product", active: true },
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
                apiData={processData}
                fileName={`Order report ${new Date().toLocaleDateString(
                  "en-GB"
                )}`}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Table
            data={productData}
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

export default topselling;