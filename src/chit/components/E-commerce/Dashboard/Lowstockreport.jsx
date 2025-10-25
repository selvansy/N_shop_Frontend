import React, { useState, useEffect } from "react";
import Table from "../../common/Table";
import { stockReport } from "../../../api/Endpoints";

const Lowstock = () => {
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalDocuments, setTotalDocuments] = useState(0);

  console.log("uwfugua",stockData)

  // Format size + stock
  const formatSizeStock = (sizeArray) => {
    if (!Array.isArray(sizeArray) || sizeArray.length === 0) {
      return "No sizes available";
    }

    return sizeArray
      .map((item) => {
        const sizeValue = item?.sizeValue ?? "N/A";
        const quantity = item?.quantity ?? 0;

        if (!isNaN(sizeValue) && sizeValue % 1 !== 0) {
          return `${sizeValue} US (${quantity})`; // decimal → US size
        } else if (!isNaN(sizeValue)) {
          return `${sizeValue} mm (${quantity})`; // whole number → mm
        } else {
          return `${sizeValue} (${quantity})`;
        }
      })
      .join(", ");
  };

  // Map API → table data
  const processApiData = (apiData) => {
    return apiData.map((item) => ({
      productName: item?.product_name ?? "Unnamed",
      category: item?.category_name ?? "N/A",
      sku: item?.sku || "N/A",
      sizeStock: formatSizeStock(item?.size),
      totalStock: item?.total_stock ?? 0,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await stockReport(currentPage, itemsPerPage);

        if (response?.data) {
          // const processedData = processApiData(response.data || []);
          const processedData = processApiData(response.data.products || []);
          setStockData(processedData);
          setTotalDocuments(response?.data?.pagination?.totalProducts || 0);
          setTotalPages(response?.data?.pagination?.totalPages || 0);
        }
      } catch (error) {
        console.error("Error fetching stock report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

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

  return (
    <div>
      <h2 className="font-bold text-lg">Stock Alert</h2>
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
  );
};

export default Lowstock;