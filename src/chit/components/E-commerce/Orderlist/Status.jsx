import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";
import { getorderstatus, changeorderstatus } from "../../../api/Endpoints";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import Select from "react-select";
const OrderStatus = ({ setIsOpen, id, clearId, currentStatus }) => {
  const layout_color = useSelector((state) => state.clientForm.layoutColor);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");
  const [filteredStatuses, setFilteredStatuses] = useState([]);

  const [formData, setFormData] = useState({
    statusId: "",
    remarks: "",
  });

  const customStyles = (isReadOnly) => ({
    control: (base, state) => ({
      ...base,
      minHeight: "42px", //42px
      backgroundColor: "white",
      color: "#232323",
      // fontWeight:600,
      border: state.isFocused ? "1px solid #f2f2f9" : "1px solid #f2f2f9",
      boxShadow: state.isFocused ? "0 0 0 1px #004181" : "none",
      borderRadius: "0.5rem",
      "&:hover": {
        color: "#e2e8f0",
      },
      pointerEvents: !isReadOnly ? "none" : "auto",
      opacity: !isReadOnly ? 1 : 1,
      cursor: isReadOnly ? "pointer" : "default",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6C7086",
      // fontWeight: "thin",
      fontSize: "14px",
      // fontStyle: "bold",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: "#232323",
      fontSize: "14px",
      "&:hover": {
        color: "#232323",
      },
    }),
    menuList: (provided) => ({
      ...provided,
      // paddingTop: 0,
      // paddingBottom: 0,
      maxHeight:   "190px",
      // maxHeight: [2, 5, 6].includes(formik.values.scheme_type)
      //   ? "130px"
      //   : "209px",
    }),
    input: (base) => ({
      ...base,
      "input[type='text']:focus": { boxShadow: "none" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#F0F7FE"
        : state.isFocused
        ? "#F0F7FE"
        : "white",
      color: "#232323",
      fontWeight: "500",
      fontSize: "14px",
    }),
  });

console.log(currentStatus)
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await getorderstatus();
        const allStatuses = res?.data || [];
        setStatuses(allStatuses);
        
        if (currentStatus === "Placed") {
          const filtered = allStatuses.filter(status => 
            status.statusNo === "3" || status.statusNo === "4"
          );
          setFilteredStatuses(filtered);
        } else if(currentStatus === "Processing" || "Payment Pending"){
          const filtered = allStatuses.filter(status => 
            status.statusNo !== "1");
          setFilteredStatuses(filtered);
        }
        else {
          setFilteredStatuses(allStatuses);
        }
      } catch (err) {
        toast.error("Failed to load order statuses");
      }
    };
    fetchStatuses();
  }, [currentStatus]);

  const { mutate: Changestatus } = useMutation({
    mutationFn: changeorderstatus,
    onSuccess: () => {
      toast.success("Order status updated successfully");
      setIsLoading(false);
      setIsOpen(false);
      clearId?.();
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const statusData = statuses.filter((item) => item._id == value);
    setStatus(statusData[0]?.statusNo);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setFormErrors({});
    if (!formData.statusId) {
      setFormErrors({ statusId: "Status is required" });
      return;
    }

    setIsLoading(true);
    Changestatus({
      ...formData,
      orderId: id,
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] mt-3 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col p-4 bg-white relative">
        <div className="grid grid-rows-1 md:grid-cols-1 gap-5 border-[#F2F2F9] mb-10">
          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2 mt-2 font-medium">
              Status<span className="text-red-400">*</span>
            </label>
            <div className="relative">
              {/* <select
                name="statusId"
                value={formData.statusId}
                onChange={handleInputChange}
                className="appearance-none border-2 border-[#F2F2F9] rounded-md p-3 w-full bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">--Select--</option>
                {filteredStatuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.name}
                  </option>
                ))}
              </select> */}
              {/* <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="black"
                >
                <path d="M19 9l-7 7-7-7"></path>
                </svg>
                </div> */}


                <div className="relative">
                  <Select
                    styles={customStyles(true)}
                    isClearable={true}
                    placeholder="Select Status"
                    options={filteredStatuses?.map((status) => ({
                      value: status._id,
                      label: status.name,
                    }))}
                    value={
                      filteredStatuses
                        ?.map((status) => ({
                          value: status._id,
                          label: status.name,
                        }))
                        .find((option) => option.value === formData.statusId) || null
                    }
                    onChange={(option) => {
                      setFormData({
                        ...formData,
                        statusId: option ? option.value : "", 
                      });
                    }}
                  />
                </div>
            </div>
            {formErrors.statusId && (
              <span className="text-red-500 text-sm mt-1">
                {formErrors.statusId}
              </span>
            )}
          </div>

          {/* Remarks Input */}
          <div className="flex flex-col mt-2">
            <label className="text-gray-700 mb-2 font-medium">Remarks</label>
            <input
              name="remarks"
              type="text"
              value={formData.remarks}
              className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter Here"
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            className="bg-[#E2E8F0] text-black rounded-md p-2 w-full lg:w-20"
            onClick={() => !isLoading && setIsOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="text-white rounded-md p-2 w-full lg:w-20"
            style={{ backgroundColor: layout_color }}
          >
            {isLoading ? <SpinLoading /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;