import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";
import {
  getallbranch,
  categorybyid,
  getallmetal,
  createcategory,
  puritybymetal,
  updatecategory,
  createsubcategory,
  getcategories,
  updatesubcategory,
  subcategorybyid,
} from "../../../api/Endpoints";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import { image } from "framer-motion/client";

const AssignAwb = ({setIsOpen, id ,clearId}) => {
  console.log(id)
    const layout_color = useSelector((state) => state.clientForm.layoutColor);
  const navigate = useNavigate();
  // const roledata = useSelector((state) => state.clientForm.roledata);
  // const branchAccess = roledata?.branch;

  const [metalType, setMetalType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [branches,setBranches]=useState([]);

  
  const [imagePreviews, setImagePreviews] = useState({ image: null });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // category_name: "",
    partnername: "",
    // id_branch:"",
    name:"",
    description:null,
    bannerImage:null
  });


   const handleClearImage = () => {
    if (imagePreviews.image?.previewUrl) {
      URL.revokeObjectURL(imagePreviews.image.previewUrl);
    }
    
    setImagePreviews({ image: null });
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


   const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };


  const MAX_FILE_SIZE = 500 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      
      if (!file) return;
  
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP).");
        event.target.value = ""; // Clear the input
        return;
      }
  
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 500KB. Please select a smaller image.");
        event.target.value = ""; // Clear the input
        return;
      }
  
      // Clean up previous preview URL to avoid memory leaks
      if (imagePreviews.image?.previewUrl) {
        URL.revokeObjectURL(imagePreviews.image.previewUrl);
      }
  
      // Create new preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews({
        image: {
          file,
          previewUrl,
          name: file.name,
        },
      });
      
      // Update formData with the file object
      setFormData(prev => ({ ...prev, image: file }));
    };

  useEffect(() => {
    
    if(id) getcategoryById(id)
      
    // getMetalType();
  }, []);

    useEffect(() => {
      return () => {
        // clearId();
      };
    }, []);
  

  //mutation to create category
  const { mutate: createcategoryMutate } = useMutation({
    mutationFn: createsubcategory,
    onSuccess: (response) => {
      toast.success(response.message);
      setIsLoading(false);
      setIsOpen(false)
    },
    onError: (error) => {
      setIsLoading(false);
      
      toast.error(error.response.data.message);
    },
  });

  const { mutate: updatecategorymutate } = useMutation({
    
    mutationFn: updatesubcategory,
    onSuccess: (response) => {
      setIsLoading(false);  
      if(response.message=="Category already Existing"){
        toast.error(response.message);
        return
      }
      toast.success(response.message);
      setIsOpen(false)
    //   clearId()
    },
    onError: (error) => {
      setIsLoading(false);
      ;

      toast.error(error.response.data.message);
    },
  });


  // get all branches
  const { mutate: getallcategories } = useMutation({
    mutationFn: getcategories,
    onSuccess: (response) => {
      console.log(response)
      setBranches(response.data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  useEffect(() => {
    getallcategories();
  }, []);


  /// get category by id
  const { mutate: getcategoryById } = useMutation({
    mutationFn: subcategorybyid,
    onSuccess: (response) => {
      console.log("wertyu",response);
      setFormData(response.data);
    },
    onError: (error) => {
      console.error("Error fetching countries:", error);
    },
  });


  // on change input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  

  const validateForm = (categoryData) => {
    const errors = {};
    if (!categoryData.partnername) errors.partnername = "category is required";
    // if (!categoryData.id_branch) errors.branch = "Branch is required";
    if (!categoryData.name)
      errors.name = "Category Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = () => {
  setFormErrors({});
  
  let updatedFormData = { ...formData };

  if (!validateForm(updatedFormData)) {
    toast.error("Fill required fields");
    return;
  }

  setIsLoading(true);

  const formDataToSend = new FormData();
  
  if (id) {
    updatecategorymutate({ id, data: formDataToSend });
  }
  
  else {
    createcategoryMutate(formDataToSend);
  }
};

  

  const handleCancle = () => {
    setIsOpen(false);
    // clearId()
  };

  return (
    <>
     
      <div className="w-full flex flex-col bg-[#F5F5F5]  mt-3 overflow-y-auto scrollbar-hide ">
        <div className="flex flex-col p-4 bg-white relative">
          <div className="grid grid-rows-1 md:grid-cols-1 gap-5 border-[#F2F2F9] mb-10">
                <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
             AWB Number
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter Here"
                onChange={handleInputChange}
              />
              
            </div>  

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Select Delivery Partner<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="partnername"
                  value={formData.partnername}
                  onChange={handleInputChange}
                  className="appearance-none border-2 border-[#F2F2F9] rounded-md p-3 w-full bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">--Select---</option>
                  {branches.map((type) => (
                    <option
                      name="type"
                      className="text-gray-700"
                      key={type.partnername}
                      value={type._id}
                    >
                      {type.category_name}
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
              {formErrors.partnername && (
                <span className="text-red-500 text-sm mt-1">
                  {formErrors.partnername}
                </span>
              )}
            </div>


                   
            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
              Status
              </label>
              <input
                name="description"
                type="text"
                value={formData.description}
                className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter Here"
                onChange={handleInputChange}
              />
              
            </div>
          </div>

          <div className="bg-white ">
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
            className=" text-white rounded-md p-2 w-full lg:w-20"
            style={{ backgroundColor: layout_color }}
          >
            {isLoading ? <SpinLoading /> : id ? "Update" : "Save"}
          </button>
        </div>
      </div>

        
        </div>
      </div>
    </>
  );
};

export default AssignAwb;
