import React, { useEffect, useState } from "react";
import Table from "../../common/Table";
import { useSelector, useDispatch } from "react-redux";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  statetable,
  activatestatemaster,
} from "../../../api/Endpoints";
import { eventEmitter } from "../../../../utils/EventEmitter";
import { openModal } from "../../../../redux/modalSlice";
import Modal from "../../../components/common/Modal";
import usePagination from "../../../hooks/usePagination";
import { useDebounce } from "../../../hooks/useDebounce";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import ModelOne from "../../common/Modelone";
import ActiveDropdown from "../../common/ActiveDropdown";
import plus from "../../../../assets/plus.svg";
// import Addstatemaster from "./addstatemaster";

const StateMaster = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const roledata = useSelector((state) => state.clientForm.roledata);
  const layout_color = useSelector((state) => state.clientForm.layoutColor);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statedata, setStatedata] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [from_date, setFromdate] = useState("");
  const [to_date, setTodate] = useState("");
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [updatingId, setUpdatingId] = useState(null); // Track which row is being updated

  const [id, setId] = useState();
  const [isviewOpen, setIsviewOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  function closeIncommingModal() {
    setIsviewOpen(false);
    setId("");
  }

  const clearId = () => setId("");

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const pageNumber = Number(page);
    if (!pageNumber || isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const paginationData = {
    totalItems: totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
  };
  const paginationButtons = usePagination(paginationData);

  // FIXED: Delivery Enabled toggle mutation - API first approach
  const { mutate: toggleDeliveryStatus } = useMutation({
    mutationFn: ({ id, currentStatus }) => activatestatemaster(id),
    onMutate: ({ id }) => {
      // Set updating state for specific row
      setUpdatingId(id);
    },
    onSuccess: (response, variables) => {
      // Update UI only after successful API call
      setStatedata((prev) =>
        prev.map((st) =>
          st._id === variables.id 
            ? { ...st, deliveryEnabled: !variables.currentStatus } 
            : st
        )
      );
      toast.success(response.message || "Status updated successfully");
    },
    onError: (error, variables) => {
      console.error("Error toggling delivery status:", error);
      toast.error("Failed to update delivery status");
    },
    onSettled: (data, error, variables) => {
      // Clear updating state regardless of success/error
      setUpdatingId(null);
    },
  });

  const handleDeliveryToggle = (id, currentStatus) => {
    toggleDeliveryStatus({ id, currentStatus });
  };

  // Fetch states function
  const fetchStates = async (payload) => {
    try {
      setIsLoading(true);
      const response = await statetable(payload);
      
      if (response && response.data) {
        setStatedata(response.data);
        setTotalPages(response.totalPages || Math.ceil(response.totalDocuments / itemsPerPage));
        setTotalDocuments(response.totalDocuments || response.data.length);
      } else if (Array.isArray(response)) {
        setStatedata(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalDocuments(response.length);
      } else {
        setStatedata([]);
        setTotalPages(0);
        setTotalDocuments(0);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStatedata([]);
      setTotalPages(0);
      setTotalDocuments(0);
      toast.error("Failed to fetch states");
    } finally {
      setIsLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const payload = {
      search: debouncedSearch,
      page: currentPage,
      limit: itemsPerPage,
      from_date,
      to_date,
      active: activeFilter ?? "",
    };

    fetchStates(payload);
  }, [currentPage, itemsPerPage, debouncedSearch, isviewOpen, activeFilter]);

  useEffect(() => {
    const handleDelete = (id) => {
      setDeleteId(id);
      deleteState(id);
    };

    eventEmitter.on("CONFIRMATION_SUBMIT", handleDelete);

    return () => {
      eventEmitter.off("CONFIRMATION_SUBMIT", handleDelete);
    };
  }, []);

  // Mutation for fetching state table
  const { mutate: getStates } = useMutation({
    mutationFn: (payload) => statetable(payload),
    onSuccess: (response) => {
      if (response && response.data) {
        setStatedata(response.data);
        setTotalPages(response.totalPages || Math.ceil(response.totalDocuments / itemsPerPage));
        setTotalDocuments(response.totalDocuments || response.data.length);
      } else if (Array.isArray(response)) {
        setStatedata(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalDocuments(response.length);
      } else {
        setStatedata([]);
        setTotalPages(0);
        setTotalDocuments(0);
      }
      setIsLoading(false);
      setSearchLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching states:", error);
      setStatedata([]);
      setTotalPages(0);
      setTotalDocuments(0);
      setIsLoading(false);
      setSearchLoading(false);
      toast.error("Failed to fetch states");
    },
  });

  // Mutation for delete state (if needed)
  const { mutate: deleteState } = useMutation({
    mutationFn: ({ _id }) => deletestatemaster(_id),
    onSuccess: (response) => {
      toast.success(response.message);
      getStates({
        search: debouncedSearch,
        page: currentPage,
        limit: itemsPerPage,
        active: activeFilter,
      });
      setDeleteId(null);
      eventEmitter.off("CONFIRMATION_SUBMIT");
    },
    onError: (error) => {
      setDeleteId(null);
      console.error("Error:", error);
      toast.error("Failed to delete state");
      eventEmitter.off("CONFIRMATION_SUBMIT");
    },
  });

  // Edit handler
  const handleEdit = (id) => {
    setIsviewOpen(true);
    setId(id);
  };

  // Delete handler
  const handleDelete = (id) => {
    setActiveDropdown(null);
    dispatch(
      openModal({
        modalType: "CONFIRMATION",
        header: "Delete State",
        formData: {
          message:
            "Are you sure you want to delete this state? This will also affect all pincodes under this state, and this action cannot be undone.",
          _id: id,
        },
        buttons: {
          cancel: { text: "Cancel" },
          submit: { text: "Delete" },
        },
      })
    );
  };

  const columns = [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "State",
      cell: (row) => row?.id_state?.state_name || "N/A",
    },
    {
      header: "Delivery Enabled",
      accessor: "deliveryEnabled",
      cell: (row) => (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={row?.deliveryEnabled === true}
            onChange={() => handleDeliveryToggle(row?._id, row?.deliveryEnabled)}
            disabled={updatingId === row?._id || isLoading}
          />
          <div
            className={`z-0 group peer bg-white rounded-full duration-300 w-8 h-4 ring-1 ring-[#E7EEF5] p-[2px] after:duration-300 after:bg-[#004181] ${
              row?.deliveryEnabled === true
                ? "peer-checked:bg-[#E7EEF5] peer-checked:ring-[#E7EEF5]"
                : "peer-checked:bg-[#E7EEF5] peer-checked:ring-gray-400"
            } after:rounded-full after:absolute after:h-3 after:w-3 after:top-[2px] after:left-[2px] after:flex after:justify-center after:items-center peer-checked:after:translate-x-4 peer-checked:after:bg-[${layout_color}] peer-hover:after:scale-95 ${
              updatingId === row?._id ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {updatingId === row?._id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        </label>
      ),
    },
    // {
    //   header: "Actions",
    //   cell: (row, rowIndex) => (
    //     <Action
    //       row={row}
    //       data={statedata}
    //       rowIndex={rowIndex}
    //       activeDropdown={activeDropdown}
    //       setActive={setActiveDropdown}
    //       handleEdit={handleEdit}
    //       handleDelete={handleDelete}
    //     />
    //   ),
    //   sticky: "right",
    // },
  ];

  const handleAddState = () => setIsviewOpen(true);

  return (
    <>
      <Breadcrumb items={[{ label: "State Master" }, { label: "State", active: true }]} />

      <div className="flex flex-col p-4 bg-white border border-[#F2F2F9] rounded-[16px]">
        {/* Search and Add button */}
        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:justify-between sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:mb-0 sm:order-2 sm:w-auto">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {searchLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
              ) : (
                <Search className="text-[#6C7086] h-5 w-5" />
              )}
            </div>
            <input
              onChange={(e) => {
                setSearchLoading(true);
                setSearchInput(e.target.value);
              }}
              placeholder="Search"
              className="px-4 py-2 ps-9 border-2 border-[#F2F2F9] rounded-[8px] text-md w-full h-[36px] sm:w-[228px]"
            />
          </div>

          {/* Active Dropdown + Add button */}
          <div className="flex flex-row w-full sm:order-1 sm:w-auto sm:mr-auto">
            <div className="w-1/2 sm:w-auto me-1">
              <ActiveDropdown setActiveFilter={setActiveFilter} />
            </div>

            <div className="w-1/2 sm:hidden">
              <button
                className="rounded-md px-4 py-2 text-white w-full hover:bg-[#034571]"
                onClick={handleAddState}
                style={{ backgroundColor: layout_color }}
              >
                + Add State
              </button>
            </div>
          </div>

          {/* <div className="hidden sm:block sm:order-3">
            <button
              className="flex rounded-lg px-[20px] py-[8px] text-sm font-semibold text-white items-center hover:bg-[#034571]"
              onClick={handleAddState}
              style={{ backgroundColor: layout_color }}
            >
              <img src={plus} alt="plus" className="w-4 h-4 me-[10px]" />
              Add State
            </button>
          </div> */}
        </div>

        {/* Table */}
        <div className="mt-4">
          <Table
            data={statedata}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalDocuments}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
        <Modal />
      </div>
    </>
  );
};

export default StateMaster;