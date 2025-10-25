import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";
import {
  createsubcategory,
  getcategories,
  updatesubcategory,
  subcategorybyid,
  getallcut,
  getallcolor,
  getallshape,
  getallclarity,
  createStonemaster,
  updateStonemaster,
  getstonemasterbyid,
  allstate,
  allcountry,
  allcity,
  Craatepincode,
  updatepincode,
  getpincodebyId,
} from "../../../api/Endpoints.js";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import { image } from "framer-motion/client";
import Select from "react-select";
import * as Yup from "yup";
import { useFormik } from "formik";

const Addpincodemaster = ({setIsOpen, id ,clearId}) => {
    const layout_color = useSelector((state) => state.clientForm.layoutColor);
  const navigate = useNavigate();
  // const roledata = useSelector((state) => state.clientForm.roledata);
  // const branchAccess = roledata?.branch;

  const [metalType, setMetalType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [branches,setBranches]=useState([]);
  const [stonecut,setStonecut]=useState([]);
  const [colour,setColor]=useState([]);
  const[clarity,setclarity]=useState([]);
  const [shape,setShape]=useState([]);
  const [   countryData,setCountryData]=useState([]);
  const [StateData,setStateData]=useState([]);
  const [CityData,setCityData]=useState([]);
  const [country,setcountry]=useState("");
  const [state,setState]=useState("");
  const [city,setcity]=useState("");

  const { data: countryresponse, isLoading: loadingCountries } = useQuery({
      queryKey: ["country", country],
      queryFn: allcountry,
    });
    
      const { data: stateresponse, isFetching: loadingStates } = useQuery({
        queryKey: ["states", country],
        queryFn: () => allstate(country),
        enabled: !!country,
      });
    
      const { data: cityresponse, isFetching: loadingCities } = useQuery({
        queryKey: ["city", state],
        queryFn: () => allcity(state),
        enabled: !!state,
      });


        useEffect(() => {
    if (countryresponse) {
      const data = countryresponse.data;
      const country = data?.map((country) => ({
        value: country._id,
        label: country.country_name,
      }));
      setCountryData(country);
    }

    if (stateresponse) {
      const data = stateresponse.data;
      const state = data.map((state) => ({
        value: state._id,
        label: state.state_name,
      }));
      setStateData(state);
    }

    if (cityresponse) {
      const data = cityresponse.data;
      const city = data.map((city) => ({
        value: city._id,
        label: city.city_name,
      }));
      setCityData(city);
    }
  }, [cityresponse, stateresponse, countryresponse]);

  
  const [imagePreviews, setImagePreviews] = useState({ image: null });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
   id_country:"",
   id_state:"",
   id_city:"",
   pincode:"",
   isDeliveryAvailable:false,
   expectdelivery:"",
   description:"",
   deliveryRate: "" // Added delivery charge field
  });

  const initialValues={
      id_country: "",
      id_state: "",
      id_city: "",
      pincode: "",
      isDeliveryAvailable: false,
      estimatedDeliveryDays: "",
      description: "",
      deliveryRate: "" // Added to initial values
  }

   const validationSchema = Yup.object({
    id_country: Yup.string().required("Country is required"),
    id_state: Yup.string().required("State is required"),
    id_city: Yup.string().required("City is required"),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^\d{6}$/, "Pincode must be exactly 6 digits"),
    isDeliveryAvailable: Yup.boolean(),
    expectdelivery: Yup.string().required("Expected delivery is required"),
    description: Yup.string().max(200, "Description must be under 200 characters"),
    deliveryRate: Yup.number() // Validation for delivery charge
      .min(0, "Delivery charge cannot be negative")
      .typeError("Delivery charge must be a number")
      .when('isDeliveryAvailable', {
        is: true,
        then: (schema) => schema.required("Delivery charge is required when delivery is available"),
        otherwise: (schema) => schema.notRequired()
      }),
  });

   const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const formPayload = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formPayload.append(key, value);
        }
      });

      if (id) {
        updateDataMutate({ id, data: formPayload });
      } else {
        createcategoryMutate(formPayload);
      }

      toast.success("Form submitted successfully!");
    },
  });

 

  const customStyles = (isReadOnly) => ({
    control: (base, state) => ({
      ...base,
      minHeight: "47px", //42px
      backgroundColor: "white",
      color:"#232323",
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
      fontSize:"14px",
      "&:hover": {
        color: "#232323",
      },
    }),
     input: (base) => ({
      ...base,
      "input[type='text']:focus": { boxShadow: 'none' },
      }),
      option:(base,state)=>({
        ...base,
        backgroundColor: state.isSelected ? "#F0F7FE" : state.isFocused ? "#F0F7FE" : "white",
        color:"#232323",
        fontWeight:"500",
        fontSize:"14px",
      })
    });

  useEffect(() => {
  if (id) getcategoryById(id);
}, [id]);



    useEffect(() => {
      return () => {
        clearId();
      };
    }, []);
  

  //mutation to create category
  const { mutate: createcategoryMutate } = useMutation({
    mutationFn: Craatepincode,
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
    
    mutationFn: updatepincode,
    onSuccess: (response) => {
      setIsLoading(false);  
      setFormData(response.data)
      toast.success(response.message);
      setIsOpen(false)
      clearId()
    },
    onError: (error) => {
      setIsLoading(false);
      ;

      toast.error(error.response.data.message);
    },
  });

  /// get category by id
  const { mutate: getcategoryById } = useMutation({
    mutationFn: getpincodebyId,
    onSuccess: (response) => {
      const data = response.data;
       setFormData({
      id_country: data.id_country || "",
      id_state: data.id_state || "",
      id_city: data.id_city || "",
      pincode: data.pincode || "",
      isDeliveryAvailable: data.isDeliveryAvailable || false,
      estimatedDeliveryDays: data.estimatedDeliveryDays || "",
      description: data.description || "",
      deliveryRate: data.deliveryRate || "" // Added delivery charge
    });

    setcountry(data.id_country);  
    setState(data.id_state);      
    setcity(data.id_city);
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

  // Handle delivery availability change
  const handleDeliveryAvailabilityChange = (e) => {
    const isAvailable = e.target.value === "true";
    setFormData((prev) => ({
      ...prev,
      isDeliveryAvailable: isAvailable,
      // Reset delivery charge if delivery is not available
      deliveryRate: isAvailable ? prev.deliveryRate : ""
    }));
  };

  const validateForm = (categoryData) => {
    const errors = {};
    // if (!categoryData.categoryId) errors.categoryId = "category is required";
    // if (!categoryData.id_branch) errors.branch = "Branch is required";
    // if (!categoryData.name)
    //   errors.name = "Category Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


const handleSubmit =()=>{

    if(id){
      console.log("wretyu",id)
        // const updateform={...formData}
        updatecategorymutate({id,...formData});
    }
    else{
   createcategoryMutate(formData);
    }
}

  const handleCancle = () => {
    setIsOpen(false);
    clearId()
  };



  return (
    <>
     
          <div className="w-full flex flex-col bg-[#F5F5F5]  mt-3 overflow-y-auto scrollbar-hide ">
              <div className="flex flex-col p-4 bg-white relative">

                  <div className="grid grid-rows-1 md:grid-cols-2 gap-5 border-[#F2F2F9] mb-10">
                      <div className="flex flex-col mt-2">
                          <div className="flex flex-col">
                              <label className="text-[#232323] text-sm font-semibold mb-1 ">
                                  Country<span className="text-red-400"> *</span>
                              </label>

                              <Select
                                  options={countryData}
                                  value={
                                      countryData?.find(
                                          (ctry) => ctry.value === formData.id_country
                                      ) || country
                                  }
                                  onChange={(ctry) => {
                                      setcountry(ctry.value);
                                      setFormData((prev) => ({
                                          ...prev,
                                          id_country: ctry.value,
                                      }));
                                  }}
                                  styles={customStyles(true)}
                                  isLoading={loadingCountries}
                                  placeholder="Select Country"
                              />
                          </div>

                      </div>

                      <div className="flex flex-col mt-2">
                          <div className="flex flex-col">
                              <label className="text-[#232323] text-sm font-semibold mb-1 ">
                                  State<span className="text-red-400"> *</span>
                              </label>

                              <Select
                                  options={StateData}
                                  value={
                                      StateData?.find(
                                          (ctry) => ctry.value === formData.id_state
                                      ) || state
                                  }
                                  onChange={(ctry) => {
                                      setState(ctry.value);
                                      setFormData((prev) => ({
                                          ...prev,
                                          id_state: ctry.value,
                                      }));
                                  }}
                                  styles={customStyles(true)}
                                  isLoading={loadingCountries}
                                  placeholder="Select State"
                              />
                          </div>

                      </div>


                      <div className="flex flex-col">
                           <div className="flex flex-col">
                              <label className="text-[#232323] text-sm font-semibold mb-2 ">
                                  City<span className="text-red-400"> *</span>
                              </label>

                              <Select
                                  options={CityData}
                                  value={
                                      CityData?.find(
                                          (ctry) => ctry.value === formData.id_city
                                      ) || city
                                  }
                                  onChange={(ctry) => {
                                      setcity(ctry.value);
                                      setFormData((prev) => ({
                                          ...prev,
                                          id_city: ctry.value,
                                      }));
                                  }}
                                  styles={customStyles(true)}
                                  isLoading={loadingCountries}
                                  placeholder="Select City"
                              />
                          </div>
                      </div>

                      <div className="flex flex-col">
                          <div className="flex flex-col">
                          <label className="text-[#232323] text-sm font-semibold mb-2 ">
                                  Pincode<span className="text-red-400"> *</span>
                              </label>
                          <input
                              name="pincode"
                              type="text"
                              value={formData.pincode}
                              maxLength={6}
                              className="border-2 border-[#F2F2F9] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Enter Here"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d{0,6}$/.test(value)) {
                                  handleInputChange(e);
                                }
                              }}
                          />
                      </div>
                      </div>

                      <div className="flex flex-col">
                          <div className="flex flex-col">
                              <label className="text-[#232323] text-sm font-semibold mb-2 ">
                                  Delivery Availability<span className="text-red-400"> *</span>
                              </label>
                              <select
                                  name="isDeliveryAvailable"
                                  value={formData.isDeliveryAvailable}
                                  onChange={handleDeliveryAvailabilityChange}
                                  className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                              </select>
                          </div>
                      </div>

                      {/* Delivery Charge Field - Conditionally shown when delivery is available */}
                      {formData.isDeliveryAvailable && (
                        <div className="flex flex-col">
                          <div className="flex flex-col">
                            <label className="text-[#232323] text-sm font-semibold mb-2 ">
                              Delivery Charge<span className="text-red-400"> *</span>
                            </label>
                            <input
                              name="deliveryRate"
                              type="number"
                              value={formData.deliveryRate}
                              className="border-2 border-[#F2F2F9] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Enter delivery charge"
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                         <div className="flex flex-col ">
                         <label className="text-[#232323] text-sm font-semibold mb-2 ">
                                  Expected Delivery Days<span className="text-red-400"> *</span>
                              </label>
                          <input
                              name="estimatedDeliveryDays"
                              type="number"
                              value={formData.estimatedDeliveryDays}
                              className="border-2 border-[#F2F2F9] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Enter number of days"
                              onChange={handleInputChange}
                              min="1"
                          />
                      </div>
                      </div>

                      <div className="flex flex-col">
                          <label className="text-gray-700 mb-2 font-medium">
                              Description
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

export default Addpincodemaster;