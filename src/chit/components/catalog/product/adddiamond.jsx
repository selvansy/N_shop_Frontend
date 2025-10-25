import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getAllDiamonds, stonedetails } from "../../../api/Endpoints";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import Table from "../../common/Table";

const Adddiamond = ({ setIsviewOpendiamond, diamondData, setDiamondData, id,Ids}) => {
  const layout_color = useSelector((state) => state.clientForm.layoutColor);


  console.log("ertyu",Ids)
  
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [diamonds, setDiamonds] = useState([]);

  const [formData, setFormData] = useState({
    itemId: "",
    cost: "",
    weight: "",
    price: "",
    certificateno: ""
  });



  const columns = [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "Diamond Name",
      cell: (row) => {
        const diamond = diamonds.find((d) => d._id === row.itemId);
        return diamond ? diamond.stonename : "—";
      },
    },
    // {
    //   header: "Certificate No",
    //   cell: (row) => row.certificateno || "—",
    // },
    {
      header: "Diamond Cts",
      cell: (row) => `${row.weight || 0} cts`,
    },
    {
      header: "Diamond Rate",
      cell: (row) => `₹${row.cost || 0}`,
    },
    {
      header: "Diamond Amount",
      cell: (row) => `₹${row.price || 0}`,
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          className="text-red-500"
          onClick={() => handleDelete(row)}
        >
          Delete
        </button>
      ),
      sticky: "right",
    },
  ];

  useEffect(() => {
    getAlldiamonds();
  }, []);

  const { mutate: getAlldiamonds } = useMutation({
    mutationFn: getAllDiamonds,
    onSuccess: (response) => {
      if(response?.data.length > 0){
        setDiamonds(response.data);
      } else {
        setDiamonds([]);
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to load diamonds");
    },
  });

useEffect(() => {
 
  if (Ids && Ids.length > 0) {
    const idsToFetch = Ids && Ids.length > 0 ? Ids : [id]; 
    fetchStoneDetails({ ids: idsToFetch, type: "diamond" });
  }
}, [Ids]);


  const { mutate: fetchStoneDetails } = useMutation({
  mutationFn: (payload) => stonedetails(payload),
  onSuccess: (response) => {
    if (response?.success) {
       const fetchedDiamonds = response.data; 
      // setDiamondData(fetchedDiamonds);

      const Fetchstones = response.data.data.map((d) => ({
      _id: d._id,
      type: d.type,
      itemId: d.itemId?._id || "",
      stonename: d.itemId?.stonename || "—",
      percraterate: d.itemId?.percraterate || 0,
      weight: d.weight || 0,
      cost: d.cost || 0,
      price: d.price || 0,
    }));

    setDiamondData(Fetchstones);
      console.log("wertyuio",fetchedDiamonds)
    } else {
      toast.error("No stone details found");
    }
  },
  onError: (error) => {
    console.error("Error fetching stone details:", error);
    toast.error("Failed to load stone details");
  },
});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };

      if (name === "weight" || name === "cost") {
        const weight = Number(updatedData.weight) || 0;
        const cost = Number(updatedData.cost) || 0;
        updatedData.price = (weight * cost).toFixed(2);
      }

      return updatedData;
    });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const validateForm = (diamond) => {
    const errors = {};
    if (!diamond.weight) errors.weight = "Weight is required";
    if (!diamond.itemId) errors.itemId = "Diamond is required";
    if (!diamond.cost) errors.cost = "Rate is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setFormErrors({});

    if (!validateForm(formData)) {
      toast.error("Please fill all required fields");
      return;
    }

    // Update parent state only (like AddStone does)
    setDiamondData((prev) => [...prev, formData]);

    setFormData({
      itemId: "",
      cost: "",
      weight: "",
      price: ""
    });
  };

  const handleDelete = (rowToDelete) => {
    setDiamondData(prev => prev.filter(row => row !== rowToDelete));
  };

  const handleCancle = () => {
    setIsviewOpendiamond(false);
  };

  return (
    <>
      <div className="w-full flex flex-col bg-[#F5F5F5] mt-3 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col p-4 bg-white relative">
          <div className="grid grid-rows-1 md:grid-cols-2 gap-5 border-[#F2F2F9] mb-10">

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Diamond<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="itemId"
                  value={formData.itemId}
                  onChange={handleInputChange}
                  className="appearance-none border-2 border-[#F2F2F9] rounded-md p-3 w-full bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">--Select---</option>
                  {diamonds.map((diamond) => (
                    <option
                      key={diamond._id}
                      value={diamond._id}
                    >
                      {diamond.stonename}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
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
                </div>
              </div>
              {formErrors.itemId && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.itemId}
                </span>
              )}
            </div>

            {/* <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Certificate No
              </label>
              <input
                name="certificateno"
                type="text"
                value={formData.certificateno}
                className="border-2 border-[#F2F2F9] rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter certificate number"
                onChange={handleInputChange}
              />
            </div> */}

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Diamond Cts<span className="text-red-400">*</span>
              </label>
              <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px] relative">
                <input
                  name="weight"
                  type="number"
                  value={formData.stoneweight}
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter Here"
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                  step="0.01"
                />
                <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center border-s-2 border-[#F2F2F9] rounded-r-md bg-white">
                  <span className="px-[14px] flex items-center justify-center h-full">
                    cts
                  </span>
                </div>
              </div>
              {formErrors.stoneweight && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.stoneweight}
                </span>
              )}
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Diamond Rate<span className="text-red-400">*</span>
              </label>
              <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px]">
                <div className="h-[43px] border-s-2 border-[#F2F2F9] flex items-center">
                  <span className="px-[14px] flex items-center justify-center h-full">
                    ₹
                  </span>
                </div>
                <input
                  name="cost"
                  type="number"
                  value={formData.stonecost}
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter Here"
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                  step="0.01"
                />
              </div>
              {formErrors.stonecost && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.stonecost}
                </span>
              )}
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Diamond Amount
              </label>
              <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px]">
                <div className="h-[43px] border-s-2 border-[#F2F2F9] flex items-center">
                  <span className="px-[14px] flex items-center justify-center h-full">
                    ₹
                  </span>
                </div>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="bg-white">
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                className="bg-[#E2E8F0] text-black rounded-md p-2 w-full lg:w-20"
                onClick={isLoading ? undefined : handleCancle}
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
                {isLoading ? <SpinLoading /> : "Add"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Table
              data={diamondData}
              columns={columns}
              isLoading={isLoading}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={diamondData.length}
              handleItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Adddiamond;