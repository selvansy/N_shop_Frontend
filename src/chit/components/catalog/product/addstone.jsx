import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getAllStones, stonedetails } from "../../../api/Endpoints";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import Table from "../../common/Table";

const Addstone = ({ setIsOpen, stoneData, setStoneData, id,Ids }) => {

  
  const layout_color = useSelector((state) => state.clientForm.layoutColor);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [Stones, setStones] = useState([]);

  const [formData, setFormData] = useState({
    itemId: "",
    cost: "",
    weight: "",
    price: "",
  });


  const [sample,setSample]=useState();

  console.log(sample)
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
        //  const fetchedDiamonds = response.data; 
        // setDiamondData(fetchedDiamonds);
        // setStoneData()

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

    setStoneData(Fetchstones);
        
      } else {
        toast.error("No stone details found");
      }
    },

    onError: (error) => {
      console.error("Error fetching stone details:", error);
      toast.error("Failed to load stone details");
    },
  });

  const columns = [
    {
      header: "S.No",
      cell: (_, index) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "Stone Name",
      cell: (row) => {
        const stone = Stones.find((s) => s._id === row.itemId);
        return stone ? stone.stonename : "—";
      },
    },
    {
      header: "Stone Weight",
      cell: (row) => `${row.weight || 0} g`,
    },
    {
      header: "Stone Cost",
      cell: (row) => `₹${row.cost || 0}`,
    },
    {
      header: "Price",
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
    getallcategories();
  }, []);

  const { mutate: getallcategories } = useMutation({
    mutationFn: getAllStones,
    onSuccess: (response) => {
      if(response?.data.length > 0){
        setStones(response.data);
      }else{
        setStones([])
      }
    },
    onError: (error) => {
      console.error("Error:", error);
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
        updatedData.price = weight * cost;
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

  const validateForm = (stone) => {
    const errors = {};
    if (!stone.weight) errors.weight = "Weight is required";
    if (!stone.itemId) errors.itemId = "Stone is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDelete = (rowToDelete) => {
    setStoneData(prev => prev.filter(row => row !== rowToDelete));
  };

  const handleSubmit = () => {
    setFormErrors({});

    if (!validateForm(formData)) {
      toast.error("Please fill all required fields");
      return;
    }

    // Update parent state only
    setStoneData((prev) => [...prev, formData]);

    setFormData({
      itemId: "",
      cost: "",
      weight: "",
      price: "",
    });
  };

  const handleCancle = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="w-full flex flex-col bg-[#F5F5F5] mt-3 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col p-4 bg-white relative">
          <div className="grid grid-rows-1 md:grid-cols-2 gap-5 border-[#F2F2F9] mb-10">
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Stone Name<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="itemId"
                  value={formData.itemId}
                  onChange={handleInputChange}
                  className="appearance-none border-2 border-[#F2F2F9] rounded-md p-3 w-full bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">--Select---</option>
                  {Stones?.map((type) => (
                    <option
                      key={type._id}
                      value={type._id}
                    >
                      {type.stonename}
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

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Stone Weight<span className="text-red-400">*</span>
              </label>
              <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px] relative">
                <input
                  name="weight"
                  type="number"
                  value={formData.weight}
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter Here"
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                />
                <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center border-s-2 border-[#F2F2F9] rounded-r-md bg-white">
                  <span className="px-[14px] flex items-center justify-center h-full">
                    g
                  </span>
                </div>
              </div>
              {formErrors.weight && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.weight}
                </span>
              )}
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Stone Cost<span className="text-red-400">*</span>
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
                  value={formData.cost}
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter Here"
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Price<span className="text-red-400">*</span>
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
                  className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter Here"
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
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
              data={stoneData}
              columns={columns}
              isLoading={isLoading}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={stoneData.length}
              handleItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Addstone;