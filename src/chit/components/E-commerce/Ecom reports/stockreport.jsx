import React, { useEffect, useState } from "react";
import Table from "../../../components/common/Table";
import { stockReport } from "../../../api/Endpoints";
import { Search } from "lucide-react";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import DateRangeSelector from "../../common/calender";
import { useDebounce } from "../../../hooks/useDebounce";
import { useMutation } from "@tanstack/react-query";
import ExportDropdown from "../../common/Dropdown/Export";

function Stockreport() {
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
const [from_date, setfrom_date] = useState();
  const [to_date, setto_date] = useState();

  const [searchInput, setSearchInput] = useState("");
        const debouncedSearch = useDebounce(searchInput, 500);

  const formatSizeStock = (sizeArray) => {
    if (!Array.isArray(sizeArray) || sizeArray.length === 0) {
      return "No sizes available";
    }

    return sizeArray
      .map((item) => {
        const sizeValue = item?.sizeValue ?? "N/A";
        const quantity = item?.quantity ?? 0;

        if (!isNaN(sizeValue) && sizeValue % 1 !== 0) {
          return `${sizeValue} US (${quantity})`;
        } else if (!isNaN(sizeValue)) {
          return `${sizeValue} mm (${quantity})`;
        } else {
          return `${sizeValue} (${quantity})`;
        }
      })
      .join(", ");
  };

  // const processApiData = (apiData) => {
  //   return apiData.map((item) => ({
  //     productName: item?.product_name ?? "Unnamed",
  //     category: item?.category_name ?? "N/A",
  //     sku: item?.sku || "N/A",
  //     sizeStock: formatSizeStock(item?.size),
  //     totalStock: item?.total_stock ?? 0,
  //   }));
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await stockReport(currentPage, itemsPerPage);

  //       if (response?.data) {
  //         // console.log("ertyu",respons)
  //         const processedData = processApiData(response.data.products || []);
  //         setStockData(processedData);
  //         setTotalDocuments(response?.data?.pagination?.totalProducts || 0);
  //         setTotalPages(response?.data?.pagination?.totalPages || 0);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching stock report:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [currentPage, itemsPerPage]);



  const processStockData = (apiData) => {
  return apiData.map((item) => ({
    productName: item?.product_name ?? "Unnamed",
    category: item?.category_name ?? "N/A",
    sku: item?.sku || "N/A",
    sizeStock: formatSizeStock(item?.size),
    totalStock: item?.total_stock ?? 0,
  }));
};

const { mutate: getStockReport } = useMutation({
  mutationFn: ({ page, limit, search, from_date, to_date }) =>
    stockReport(page, limit, search, from_date, to_date),
  onSuccess: (response) => {
    if (!response?.data) return;

    const processedData = processStockData(response.data.products || []);
    setStockData(processedData);

    setTotalDocuments(response?.data?.pagination?.totalProducts || 0);
    setTotalPages(response?.data?.pagination?.totalPages || 0);
    setIsLoading(false);
  },
  onError: (error) => {
    console.error("Error fetching stock report:", error);
    setStockData([]);
    setTotalDocuments(0);
    setTotalPages(0);
    setIsLoading(false);
  },
});

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
    payload.from_date = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    payload.to_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
  }

  setIsLoading(true);
  getStockReport(payload);
}, [currentPage, itemsPerPage, debouncedSearch, from_date, to_date]);


  const columns = [
    {
      header: "S.No",
      cell: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      header: "Product Name",
      cell: (row) => row.productName,
    },
    {
      header: "Category",
      cell: (row) => row.category,
    },
    {
      header: "SKU",
      cell: (row) => row.sku,
    },
    {
      header: "Size & Stock",
      cell: (row) => row.sizeStock,
    },
    {
      header: "Total Stock",
      cell: (row) => row.totalStock,
    },
  ];

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const pageNumber = Number(page);
    if (!pageNumber || isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
      return;
    }
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Ecom Reports" },
          { label: "Stock Report", active: true },
        ]}
      />
      <div className="flex flex-col p-4 bg-white border-2 border-[#F2F2F9] rounded-[16px] ">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mt-4">
          <div className="relative w-90 sm:w-[228px] ml-5">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <Search className="text-[#6C7086] h-5 w-5" />
            </div>
            <input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search"
              className="pl-8 pr-4 py-2 border-2 border-[#F2F2F9] rounded-[8px] w-full"
            />
          </div>
          <div className="flex justify-end items-center gap-4">
            <DateRangeSelector
              onChange={(range) => {
                setfrom_date(range.startDate);
                  setto_date(range.endDate);
              }}
            />
              <ExportDropdown
                // apiData={orderData}
                fileName={`Order report ${new Date().toLocaleDateString(
                  "en-GB"
                )}`}
              />
          </div>
        </div>
        <div className="mt-4">
          <Table
            data={stockData}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalDocuments}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </>
  );
}

export default Stockreport;