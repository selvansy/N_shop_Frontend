import React, { useEffect, useState } from "react";
import Table from "../../common/Table";
import { getOverAllDashboard, getRecentOrders } from "../../../api/Endpoints";
import { useMutation } from "@tanstack/react-query";

const Recentorder = () => {
  const [wishlistdata, setWishlistdata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [orderData, setOrderDatas] = useState([]);

  // useEffect(() => {
  //   getOrderAll();
  // }, []);

  const { mutate: getOrderAll } = useMutation({
    mutationFn: ({ page, limit }) => getRecentOrders(page,limit),
    onSuccess: (response) => {
      const formatted = response?.data?.orders.map((item, index) => ({
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
        amount: Number(item.totalDiscount || 0).toFixed(2), // 👉 Always 2 decimals
        status: item.status,
      }));

      setOrderDatas(formatted);
      setTotalDocuments(response?.data?.totalCount || 0);
    setTotalPages(response?.data?.totalPages || 0);
    },
    onError: (error) => {
      setCardData(initialState);
    },
  });


  useEffect(() => {
  getOrderAll({ page: currentPage, limit: itemsPerPage });
}, [currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
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

  return (
    <div>
      <h2 className="font-bold text-lg">Recent Orders</h2>
      <div className="mt-4">
        <Table
          data={orderData}
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

export default Recentorder;
