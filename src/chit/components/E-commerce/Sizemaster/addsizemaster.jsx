import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import SpinLoading from "../../common/spinLoading";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createsizemaster, Deletesizemaster, GetsizemasterbyId, getUom, Updatesizemaster } from "../../../api/Endpoints";
import { useNavigate, useParams } from "react-router-dom";

const Addsizemaster = () => {
   const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [Unit,setUnit]=useState([]);

  
  const [formData, setFormData] = useState({
    sizeName: "",
    code: "",
    description: "",
    sizes: [],
    unit:""
  });

  const Unitsize = [
  { id: 1, label: "Millimeter", value: "mm" },
  { id: 2, label: "Centimeter", value: "cm" },
  { id: 3, label: "Inch", value: "inch" },
];

 const { mutate: fetchUom, isPending } = useMutation({
  mutationFn: (payload) => getUom(payload),
  onSuccess: (response) => {
    setUnit(response.data);
  },
  onError: (error) => {
    console.error("Error fetching UOM:", error);
  },
});

// const { data: uomData } = useQuery({
//   queryKey: ["uom"],
//   queryFn: getUom,  
//   onSuccess: (response) => {
//     setUnit(
//       response.data.map((item) => ({
//         label: item.name,   
//         value: item.code,
//       }))
//     );
//   },
// });
  const validateForm = (categoryData) => {
    const errors = {};
    if (!categoryData.sizeName) errors.sizeName = "category is required";
    if (!categoryData.unit) errors.branch = "unit is required";
    if (!categoryData.code)
      errors.code = "Category Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

useEffect(() => {
  fetchUom(); 
}, []);

const navigate=useNavigate();


  const { mutate: createcategoryMutate } = useMutation({
    mutationFn: createsizemaster,
    onSuccess: () => {
      //  toast.success(response.message);
    navigate('/sizemaster/sizemaster');
    // toast.success("Size Master created successfully");   
    setIsLoading(false);
    setIsOpen(false);                    
  setFormData({
    sizeName: "",
    code: "",
    description: "",
    sizes: [],
    unit: "",
  });
  setSize("");
    },
    onError: (error) => {
      setIsLoading(false);
      
      toast.error(error.response.data.message);
    },
  });

    const { mutate: updatecategorymutate } = useMutation({
    mutationFn: Updatesizemaster,
    onSuccess: (response) => {
      navigate('/sizemaster/sizemaster');
      setIsLoading(false);  
      if(response.message=="Size already Existing"){
        toast.error(response.message);
        return
      }
       toast.success(response?.message);  
      
      
      // clearId()
    },
    onError: (error) => {
      setIsLoading(false);

      toast.error(error.response.data.message);
    },
  });

  
  const [size, setSize] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

 
  const handleAddStone = () => {
    if (size.trim() === "") return;

  //    if (!size) {
  //   console.log("Please enter a size!");
  //   return;
  // }
  //  if (!formData.unit) {
  //   console.log("Please select a unit before adding size!");
  //   return;
  // }

    // if (formData.size.includes(size)) return;

    setFormData({
      ...formData,
      sizes: [...formData.sizes, size],
    });

    setSize("");
  };

  const removeStone = (index) => {
    const updatedSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      sizes: updatedSizes,
    });
  };

    useEffect(() => {
    if (id) getcategoryById(id);
  }, [id]);

  const { mutate: getcategoryById } = useMutation({
      mutationFn: GetsizemasterbyId,
      onSuccess: (response) => {
        console.log(response)
        // setFormData(response.data);
        const data = response.data;
         setFormData({
           sizeName: data.sizeName,
           code: data.code,
           description: data.description,
            sizes: data.sizes,
           unit: data.unit,
      });
  
      // setcountry(data.id_country);  
      // setState(data.id_state);      
      // setcity(data.id_city);
      },
      onError: (error) => {
        console.error("Error fetching countries:", error);
      },
    });

  
  const handleSubmit = () => {
    if(id){
   
      updatecategorymutate({id,...formData})
    
    }
    else{

      setIsLoading(true); 
      createcategoryMutate(formData);
    }
    
  };

  return (
    <>
      <Breadcrumb
        items={[{ label: "Size Master" }, { label: "Size", active: true }]}
      />

      <div className="bg-[#FFFFFF] rounded-[16px] p-5 border-[1px] text-[#232323]">
        <div className="w-full h-full flex flex-col mt-3 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
            <div>
              <label className="block text-sm font-medium mb-1">
                Size Name<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="sizeName"
                value={formData.sizeName}
                onChange={handleInputChange}
                maxLength={30}
                className="w-full border-[1px] border-[#f2f3f8] rounded-md px-3 py-2"
                placeholder="Enter name"
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">
                Size Code<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                maxLength={30}
                className="w-full border-[1px] border-[#f2f3f8] rounded-md px-3 py-2"
                placeholder="Enter code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={30}
                className="w-full border-[1px] border-[#f2f3f8] rounded-md px-3 py-2"
                placeholder="Enter description"
              />
            </div>

         
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="text-gray-700 mb-2 font-medium block">Size</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  maxLength={30}
                  className="w-30 border-[1px] border-[#f2f3f8] rounded-md px-3 py-2"
                  placeholder="Enter Size"
                />
                <select
                  className="w-30 border-[1px] border-[#f2f3f8] rounded-md px-3 py-2"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  placeholder="Select Unit"
                >
                  <option value="">Unit</option> 
                  {Unit.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddStone}
                  className="h-10 w-28 rounded-lg px-4 py-2 text-sm font-semibold text-[#034571] items-center whitespace-nowrap bg-white border border-[#034571] transition-colors hover:bg-[#034571] hover:text-white"
                >
                  Add Size
                </button>
              </div>


              <div className="flex flex-wrap gap-3 mt-3">
                {formData.sizes.map((stone, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white border border-[#034571] rounded-full px-4 py-1 shadow-sm"
                  >
                    <span className="text-[#034571] font-medium text-sm">
                      {stone} {formData.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStone(index)}
                      className="text-red-500 hover:text-red-700 text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white">
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="text-white bg-[#034571] rounded-md p-2 w-full lg:w-20"
            >
             {isLoading ? <SpinLoading /> : id ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="bg-[#E2E8F0] text-black rounded-md p-2 w-full lg:w-20"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addsizemaster;
