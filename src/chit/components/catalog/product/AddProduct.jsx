import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";
import {
  getallmetal,
  puritybymetal,
  createproduct,
  updateproduct,
  categorybymetalid,
  getbranchbyid,
  getAllBranch,
  getMetalRateByMetalId,
  productbyid,
  subcategorybycategory,
  getallcollection,
  getallsizemaster,
} from "../../../api/Endpoints";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import SpinLoading from "../../common/spinLoading";
import { customSelectStyles } from "../../Setup/purity";
import Select from "react-select";
import MakingChargesForm from "./makingCharge";
import WastageChargeForm from "./wastageCharge";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import { customStyles } from "../../ourscheme/scheme/AddScheme";
import Priceandweight from "./priceandweight";
import Modal from "../../../components/common/Modal";
import ModelOne from "../../common/Modelone";
import Addstone from "./addstone";
import Adddiamond from "./adddiamond";

const AddProduct = () => {
  const roleData = useSelector((state) => state.clientForm.roledata);
  const accessBranch = roleData?.id_branch || roleData?.branch;
  const naviagte = useNavigate();
  const { id } = useParams();
  const [branch, setBranch] = useState(() => (accessBranch === "0" ? [] : {}));
  const layout_color = useSelector((state) => state.clientForm.layoutColor);
  const [metals, setMetals] = useState([]);
  const [category, setCategory] = useState([]);
  const [currentRate, setCurrentRate] = useState("0");
  const [purity, setPurity] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const MAX_IMAGES = 3;
  const [product_image, setproductImgPath] = useState([]);
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [errors, setErrors] = useState({});
  const [pathUrl, setPathUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [makingCharge, setMakingCharge] = useState({});
  const [subcategory, setSubcategory] = useState([]);
  const [collection, setCollection] = useState([]);
  const [isviewOpen, setIsviewOpen] = useState(false);
  const [isviewOpendiamond, setIsviewOpendiamond] = useState(false);
  const [stoneData, setStoneData] = useState([]);
  const [diamondData, setDiamondData] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const[Ids,setIds]=useState([])
  const [dragIndex, setDragIndex] = useState(null);

  const handleaddmetal = () => {
    setIsviewOpen(true);
  };

  function closeIncommingModal() {
    setIsviewOpendiamond(false);
  }

  const handleadddiamond = () => {
    setIsviewOpendiamond(true);
  };

  function closeIncommingModaldiamond() {
    setIsviewOpendiamond(false);
  }

  const [formData, setFormData] = useState({
    product_name: "",
    code: "",
    id_category: "",
    subcategoryId: "",
    id_branch: "",
    description: "",
    id_metal: "",
    id_purity: "",
    gst: 3,
    showprice: true,
    sku: "",
    quantity: 0,
    sizemaster: "",
    categories: [],
    collection: [],
    availableSizes: {
      sizeId: "",
      values: [],
    },
    makingCharges: {
      mode: "amount",
      actualValue: "",
      discountedValue: "",
      discountedPercentage: "",
      discountView: false,
      mcView: false,
    },
    wastageCharges: {
      mode: "amount",
      actualValue: "",
      discountedValue: "",
      discountedPercentage: "",
      discountView: false,
      wastageView: false,
    },
    currentmetalrate: "",
    grossWt: "",
    netWeight: "",
    stonewt: "",
    diamondwt: "",
    price: "",
    totalprice: "",
    stone: false,
    diamond: false
  });
  console.log(formData)


  const [selectedSizes, setSelectedSizes] = useState([]);
  useEffect(() => {
    const stoneTotals = stoneData.reduce(
      (acc, stone) => {
        return {
          stonewt: acc.stonewt + (Number(stone.weight) || 0),
          stonecost: acc.stonecost + (Number(stone.cost) || 0),
          stoneprice: acc.stoneprice + (Number(stone.price) || 0),
        };
      },
      { stonewt: 0, stonecost: 0, stoneprice: 0 }
    );

   const diamondTotals = diamondData.reduce(
      (acc, diamond) => {
        return {
          diamondwt: acc.diamondwt + (Number(diamond.weight) || 0),
          diamondcost: acc.diamondcost + (Number(diamond.cost) || 0),
          diamondprice: acc.diamondprice + (Number(diamond.price) || 0),
        };
      },
      { diamondwt: 0, diamondcost: 0, diamondprice: 0 }
    );

    setFormData((prev) => ({
      ...prev,
      stonewt: stoneTotals.stonewt,
      stonecost: stoneTotals.stonecost,
      stoneprice: stoneTotals.stoneprice,
      diamondwt: diamondTotals.diamondwt,
      diamondcost: diamondTotals.diamondcost,
      diamondprice: diamondTotals.diamondprice,
      totalstoneanddiamond: stoneTotals.stoneprice + diamondTotals.diamondprice,
      stone: stoneData.length > 0, 
      diamond: diamondData.length > 0,
    }));
  }, [stoneData, diamondData]);

  const { data } = useQuery({
    queryKey: ["sizeMaster"],
    queryFn: getallsizemaster,
  });

  const sizeMasterOptions =
    data?.data?.items?.map((item) => ({
      value: item._id,
      label: item.sizeName,
      sizes: item.sizes,
    })) || [];

  const handleButtonClick = (sizeValue) => {
    setSelectedSizes((prevSelected) => {
      if (prevSelected.includes(sizeValue)) {
        const updatedSizes = prevSelected.filter((s) => s !== sizeValue);

        setFormData((prev) => ({
          ...prev,
          availableSizes: {
            ...prev.availableSizes,
            values: prev.availableSizes.values.filter(
              (item) => item.sizeValue !== parseFloat(sizeValue)
            ),
          },
        }));

        return updatedSizes;
      } else {
        setFormData((prev) => ({
          ...prev,
          availableSizes: {
            ...prev.availableSizes,
            values: [
              ...prev.availableSizes.values,
              { sizeValue: parseFloat(sizeValue), quantity: 0 },
            ],
          },
        }));
        return [...prevSelected, sizeValue];
      }
    });
  };

  const handleSizeMasterChange = (option) => {
    const sizes = option?.sizes || [];
    setAvailableSizes(sizes);
    
    setFormData((prev) => ({
      ...prev,
      availableSizes: {
        sizeId: option ? option.value : "",
        values: [],
      },
    }));
    
    setSelectedSizes([]);
    
  };

  useEffect(() => {
    if (!id) return;
    getProdcutById(id);
  }, [id]);

  useEffect(() => {
    if (!roleData) return;
    if (accessBranch !== "0") {
      getBranchData({ id: accessBranch });
    } else if (accessBranch == "0") {
      getAllBranches();
    }
  }, [roleData]);

  useEffect(() => {
    getMetals();
    formData.showprice = true;
  }, []);

  useEffect(() => {
    if (formData.id_purity) {
      getTodayMetalRate({
        id_metal: formData.id_metal,
        id_purity: formData.id_purity,
        date: new Date(),
        branch: accessBranch,
      });
    }
  }, [formData.id_purity]);

  useEffect(() => {
    if (formData?.availableSizes?.values) {
      const totalQty = formData.availableSizes.values.reduce(
        (sum, val) => sum + Number(val?.quantity || 0),
        0
      );

      setFormData((prev) => ({
        ...prev,
        quantity: Number(totalQty),
      }));
    }
  }, [formData?.availableSizes?.values]);

  useEffect(() => {
    const sum = currentRate * formData.weight;
    setPrice(sum);
  }, [formData.weight, formData.id_metal, formData.id_purity, currentRate]);

  useEffect(() => {
    let makingCharge = 0;
    let wastageCharge = 0;

    if (formData.makingCharges?.mode === "weight") {
      makingCharge = currentRate * formData.wastageCharges?.discountedValue;
    } else {
      makingCharge = Number(formData.makingCharges?.discountedValue) || 0;
    }

    if (formData.wastageCharges?.mode === "weight") {
      wastageCharge = currentRate * formData.wastageCharges?.discountedValue;
    } else {
      wastageCharge = Number(formData.wastageCharges?.discountedValue) || 0;
    }

    let total = price + makingCharge + wastageCharge;
    let totalWithGST = total + formData.gst / 100;

    setTotalPrice(totalWithGST);
  }, [
    price,
    currentRate,
    formData.gst,
    formData.weight,
    formData.makingCharges?.mode,
    formData.makingCharges?.discountedValue,
    formData.wastageCharges?.mode,
    formData.wastageCharges?.discountedValue,
  ]);

  const { mutate: getTodayMetalRate } = useMutation({
    mutationFn: ({ id_metal, id_purity, date, branch }) =>
      getMetalRateByMetalId(id_metal, id_purity, date, branch),
    onSuccess: (response) => {
      const { data } = response;
      setCurrentRate(data?.rate);

      setFormData((prev) => ({
        ...prev,
        currentMetalRate: data?.rate || 0,
      }));
    },
    onError: (error) => {
      console.error("Error fetching metal rate:", error);
    },
  });

  const { mutate: getCollections } = useMutation({
    mutationFn: () => getallcollection(),
    onSuccess: (response) => {
      setCollection(
        response.data.map((collection) => ({
          value: collection._id,
          label: collection.name,
        }))
      );
    },
    onError: (error) => {
      console.error("Error fetching metal rate:", error);
    },
  });

  useEffect(() => {
    getCollections();
  }, []);

  const { mutate: getAllBranches } = useMutation({
    mutationFn: () => getAllBranch(),
    onSuccess: (response) => {
      setBranch(
        response.data.map((branch) => ({
          value: branch._id,
          label: branch.branch_name,
        }))
      );
    },
    onError: (error) => {
      console.error("Error fetching branches:", error);
    },
  });

  const { mutate: getMetals } = useMutation({
    mutationFn: () => getallmetal(),
    onSuccess: (response) => {
      setMetals(
        response.data.map((metal) => ({
          value: metal._id,
          label: metal.metal_name,
        }))
      );
    },
    onError: (error) => {
      console.error("Error fetching branches:", error);
    },
  });
  
  const modeMap = {
  1: "amount",
  2: "weight"
};


const { mutate: getProdcutById } = useMutation({
  mutationFn: (id) => productbyid(id),
  onSuccess: (product) => {
    setIsEditing(true); 
    const data=product.data

     setFormData({
    ...data,
    sku: data.sku || 0,
    makingCharges:{
      ...data.makingCharges,
      // mode:wastageModeValue,
      mode: data.makingCharges?.mode || 1,
         modeLabel: modeMap[data.makingCharges?.mode] || "amount",
    },
    wastageCharges:{
      ...data.wastageCharges,
      // mode:makingModeValue
      mode: data.wastageCharges?.mode || 1, 
    },
    gst: 3,
    sizemaster: data.availableSizes?.sizeId || "",
       availableSizes: {
         sizeId: data.availableSizes?.sizeId || "",
         defaultsize: 0,
         values: data.availableSizes?.values || [],
       },

      
  });
  setSelectedSizes(
  data.availableSizes?.values.map(v => v.sizeValue.toString()) || []
);
    setIds(data.stoneDetails || []);

   setAvailableSizes(data.availableSizes?.values.map(v => v.sizeValue) || []);
    setMakingCharge(product.data);
    setproductImgPath(product.data.product_image);
    setPathUrl(product.data.pathurl);

    getCategory(product.data.id_metal);
    getsubcategory(product.data.id_category);
  },
  onError: (error) => {
    console.error("Error fetching product by ID:", error);
  },
});


useEffect(() => {
  if (formData.id_metal) {
    getCategory(formData.id_metal);
    getPurityByMetal(formData.id_metal);

 
    if (!isEditing) {
      setFormData((prev) => ({
        ...prev,
        id_category: "",
      }));
    }
  }
}, [formData.id_metal]);


useEffect(() => {
  if (formData.id_category) {
    getsubcategory(formData.id_category);

    if (!isEditing) {
      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
      }));
    }
  }
}, [formData.id_category]);


  
  const { mutate: getPurityByMetal } = useMutation({
    mutationFn: (id) => puritybymetal(id),
    onSuccess: (response) => {
      setPurity(
        response.data.map((purity) => ({
          value: purity._id,
          label: purity.purity_name,
        }))
      );
    },
    onError: (error) => {
      console.error("Error fetching getPurityByMetal:", error);
    },
  });

  const { mutate: getCategory } = useMutation({
    mutationFn: (data) => categorybymetalid(data),
    onSuccess: (response) => {
      setCategory(
        response.data.map((catgory) => ({
          value: catgory._id,
          label: catgory.category_name,
        }))
      );
    },
    onError: (error) => {
      setCategory([]);
      console.error("Error fetching category:", error);
    },
  });

  const { mutate: getsubcategory } = useMutation({
    mutationFn: (data) => subcategorybycategory(data),
    onSuccess: (response) => {
      setSubcategory(
        response.data.map((catgory) => ({
          value: catgory._id,
          label: catgory.name,
        }))
      );
    },
    onError: (error) => {
      setSubcategory([]);
      console.error("Error fetching category:", error);
    },
  });

  const { mutate: addProduct } = useMutation({
    mutationFn: (formData) => createproduct(formData),
    onSuccess: (response) => {
      if (response.message) {
        setIsLoading(false);
        toast.success(response.message);
        naviagte("/catalog/product/");
      }
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.response.data.message);
      console.error("Error fetching product:", error);
    },
  });
  
  const { mutate: editProduct } = useMutation({
    mutationFn: (formData) => updateproduct(formData),
    onSuccess: (response) => {
      if (response.message) {
        toast.success(response.message);
        naviagte("/catalog/product/");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(error.response.data.message);
      console.error("Error fetching product:", error);
    },
  });

  const { mutate: getBranchData } = useMutation({
    mutationFn: (data) => getbranchbyid(data),
    onSuccess: (response) => {
      const { data } = response;
      setBranch({
        _id: data._id,
        branch_name: data.branch_name,
      });
      setFormData((prev) => ({
        ...prev,
        id_branch: data._id,
      }));
    },
    onError: (error) => {
      console.error("Error fetching branches:", error);
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "gst" && !/^\d{0,2}$/.test(value)) {
      return;
    }

    if (name === "weight" && !/^\d{0,4}(\.\d{0,3})?$/.test(value)) {
      return;
    }

    if (type === "checkbox" && name === "categories") {
      setFormData((prev) => {
        const updatedCategories = checked
          ? [...prev.categories, value]
          : prev.categories.filter((id) => id !== value);

        return {
          ...prev,
          categories: updatedCategories,
        };
      });
      return;
    }

    const fieldsToUppercase=["code","sku"];
     const processedValue = fieldsToUppercase.includes(name) 
      ? value.toUpperCase() 
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));  
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (product_image.length == 3) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }
    if (files.length > 0) {
      const existingImages = product_image.filter(
        (img) => typeof img === "string"
      );
      let totalImages = existingImages.length;

      const validFiles = [];

      for (const file of files) {
        const allowedFormats = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedFormats.includes(file.type)) {
          toast.error(
            "Invalid image format. Only JPEG, PNG, and WEBP are allowed."
          );
          continue;
        }

        if (totalImages >= MAX_IMAGES) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`);
          e.target.value = "";
          return;
        }

        if (file.size > 500 * 1024) {
          toast.error(`${file.name} exceeds the 500 KB limit`);
        } else {
          validFiles.push(file);
          totalImages++;
        }
      }

      if (validFiles.length > 0) {
        setproductImgPath((prevState) => [...prevState, ...validFiles]);
      }
    }

    e.target.value = "";
  };

  useEffect(() => {
    const newPreviews = product_image.map((img) =>
      typeof img === "string" ? img : URL.createObjectURL(img)
    );
    setImagePreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [product_image]);

  const handleRemoveImage = (index) => {
    const updatedImages = product_image.filter((_, i) => i !== index);
    setproductImgPath(updatedImages);
  };

  const handleMakingCharge = (data) => {
    setFormData((prev) => ({
      ...prev,
      makingCharges: {
        ...prev.makingCharges,
        ...data,
      },
    }));
  };

  const handlepriceandweight = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleWastageCharge = (data) => {
    setFormData((prev) => ({
      ...prev,
      wastageCharges: {
        ...prev.wastageCharges,
        ...data,
      },
    }));
  };

  const validateFormData = () => {
    const errors = {};

    if (!formData.product_name.trim()) {
      errors.product_name = "Product name is required.";
    }

    if (!formData.code.trim()) {
      errors.code = "Product code is required.";
    }

    if (!formData.id_category) {
      errors.id_category = "Category is required.";
    }

    if (!formData.id_branch) {
      errors.id_branch = "Branch is required.";
    }

    if (!formData.id_metal) {
      errors.id_metal = "Metal type is required.";
    }

    if (!formData.id_purity) {
      errors.id_purity = "Purity is required.";
    }
    if (!formData.description) {
      errors.description = "description is required.";
    }

    if (isNaN(formData.gst) || Number(formData.gst) <= 0) {
      errors.gst = "GST is required.";
    }

    if (product_image.length == 0) {
      errors.product_image = "Atleast one image is required";
    }

    return errors;
  };

  const handleSubmit = () => {
  const validationErrors = validateFormData();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  setIsLoading(true);
  setErrors({});
  
  const formDataToSend = new FormData();

  // Separate existing images and new images
  const existingImages = product_image.filter(img => typeof img === "string");
  const newImages = product_image.filter(img => img instanceof File);

  // Add all form data except images
  Object.entries(formData).forEach(([key, value]) => {
    if (key === "_id" || key === "pathurl" || key === "active" || key === "product_image") {
      return;
    }

    if (key === "collection" && Array.isArray(value)) {
      value.forEach((collectionId, index) => {
        formDataToSend.append(`collection[${index}]`, collectionId);
      });
    }
    else if (typeof value === "object" && value !== null) {
      if (key === "availableSizes") {
        formDataToSend.append(`${key}[sizeId]`, value.sizeId || '');
        
        if (value.values && Array.isArray(value.values)) {
          value.values.forEach((sizeObj, index) => {
            formDataToSend.append(`${key}[values][${index}][sizeValue]`, sizeObj.sizeValue || '');
            formDataToSend.append(`${key}[values][${index}][quantity]`, sizeObj.quantity || '');
          });
        }
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (
            subKey === "_id" &&
            (key === "wastageCharges" || key === "makingCharges")
          ) {
            return;
          }
          formDataToSend.append(`${key}[${subKey}]`, subValue);
        });
      }
    } else {
      formDataToSend.append(key, value);
    }
  });

  // Add existing images as a separate field
  if (existingImages.length > 0) {
    formDataToSend.append("existing_images", JSON.stringify(existingImages));
  }

  // Add new images as files
  if (newImages.length > 0) {
    newImages.forEach((image) => {
      formDataToSend.append("product_image", image);
    });
  }

  // Add stone and diamond data
  if (stoneData.length > 0) {
    stoneData.forEach((stone, index) => {
      Object.entries(stone).forEach(([key, value]) => {
        formDataToSend.append(`stones[${index}][${key}]`, value);
      });
    });
  }

  if (diamondData.length > 0) {
    diamondData.forEach((diamond, index) => {
      Object.entries(diamond).forEach(([key, value]) => {
        formDataToSend.append(`diamonds[${index}][${key}]`, value);
      });
    });
  }

  if (id) {
    editProduct({ formDataToSend, id });
  } else {
    addProduct(formDataToSend);
  }
};

  useEffect(() => {
    const metalValue = (currentRate * formData.netWeight) || 0;
    
    let makingCharge = 0;
    if (formData.makingCharges?.mode === "weight") {
      makingCharge = currentRate * (formData.makingCharges?.discountedValue || 0);
    } else {
      makingCharge = Number(formData.makingCharges?.discountedValue) || 0;
    }

    let wastageCharge = 0;
    if (formData.wastageCharges?.mode === "weight") {
      wastageCharge = currentRate * (formData.wastageCharges?.discountedValue || 0);
    } else {
      wastageCharge = Number(formData.wastageCharges?.discountedValue) || 0;
    }

    const stoneCost = formData.stonecost || 0;
    const diamondCost = formData.diamondcost || 0;

    const subtotal = metalValue + makingCharge + wastageCharge + stoneCost + diamondCost;
    
    const gstAmount = subtotal * (formData.gst / 100) || 0;
    
    const total = subtotal + gstAmount;

    setTotalPrice(total.toFixed(2));
    setPrice(subtotal.toFixed(2));
  }, [
    currentRate,
    formData.netWeight,
    formData.gst,
    formData.makingCharges?.mode,
    formData.makingCharges?.discountedValue,
    formData.wastageCharges?.mode,
    formData.wastageCharges?.discountedValue,
    formData.stonecost,
    formData.diamondcost
  ]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      grossWt: (
        (Number(prev.netWeight) || 0) + 
        (Number(prev.stonewt) || 0) + 
        (Number(prev.diamondwt) || 0)
      ).toFixed(3)
    }));
  }, [formData.netWeight, formData.stonewt, formData.diamondwt]); 



// const handleDragStart = (index) => {
//   setDragIndex(index);
// };

// const handleDrop = (index) => {
//   const updatedImages = [...imagePreviews];
//   const draggedItem = updatedImages[dragIndex];

//   updatedImages.splice(dragIndex, 1);
//   updatedImages.splice(index, 0, draggedItem);

//   setImagePreviews(updatedImages);
//   setDragIndex(null);
// };

// const allowDrop = (e) => {
//   e.preventDefault();
// };

const handleDragStart = (index) => {
  setDragIndex(index);
};

const handleDrop = (index) => {
  
  const updatedPreviews = [...imagePreviews];
  const updatedImages = [...product_image];
  
  const draggedPreview = updatedPreviews[dragIndex];
  const draggedImage = updatedImages[dragIndex];

  updatedPreviews.splice(dragIndex, 1);
  updatedImages.splice(dragIndex, 1);
  
 
  updatedPreviews.splice(index, 0, draggedPreview);
  updatedImages.splice(index, 0, draggedImage);

  setImagePreviews(updatedPreviews);
  setproductImgPath(updatedImages);
  setDragIndex(null);
};

const allowDrop = (e) => {
  e.preventDefault();
};


  return (
    <>
      <Breadcrumb
        items={[{ label: "Catelogue" }, { label: "Product", active: true }]}
      />

      <div className="w-full flex flex-col bg-white mt-3 overflow-y-auto scrollbar-hide rounded-[16px] px-4 border border-[#F2F2F9]">
        <div className="flex flex-col p-4  relative">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold whitespace-nowrap">
              {id ? "Edit product" : "Create product"}
            </h2>
          </div>
          <div className="border-b-2 border-[#F2F2F9] w-full py-2"></div>

          <div className="grid grid-rows-2 md:grid-cols-3 gap-5 border-[#F2F2F9] mb-5 mt-2 ">
            {accessBranch == "0" && branch.length > 0 ? (
              <div>
                <label className="block text-sm  mt-3 font-medium ">
                  Branches <span className="text-red-500">*</span>
                </label>
                <Select
                  className="mt-2"
                  styles={customStyles(true)}
                  options={branch || []}
                  placeholder="Select Branch"
                  value={branch.find(
                    (option) => option.value === formData.id_branch
                  )}
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      id_branch: option.value,
                    }));
                  }}
                />
                <span className="text-red-500 text-sm mt-1">
                  {errors.id_branch}
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-500 font-medium mb-1 mt-3">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={branch?.branch_name || ""}
                  className="w-full border rounded-md px-3 py-2 text-gray-500"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Metal<span className="text-red-400">*</span>
              </label>
              <Select
                styles={customStyles(true)}
                options={metals}
                placeholder="Select Metal"
                value={metals.find(
                  (option) => option.value === formData.id_metal
                )}
                onChange={(option) => {
                  setFormData((prev) => ({
                    ...prev,
                    id_metal: option.value,
                    id_category: "",
                  }));
                  setCurrentRate("0");
                }}
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.id_metal}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Purity<span className="text-red-400">*</span>
              </label>
              <Select
                styles={customSelectStyles(metals)}
                options={purity}
                placeholder={
                  purity.length > 0 ? "Select purity" : "No purities available"
                }
                value={
                  purity.find(
                    (option) => option.value === formData.id_purity
                  ) || null
                }
                onChange={(option) => {
                  setFormData((prev) => ({
                    ...prev,
                    id_purity: option ? option.value : "",
                  }));
                }}
                isDisabled={purity.length <= 0}
                noOptionsMessage={() => "No purities available for this metal"}
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.id_purity}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Category<span className="text-red-400">*</span>
              </label>
              <Select
                styles={customSelectStyles(metals)}
                options={category}
                placeholder={
                  category.length > 0
                    ? "Select Category"
                    : "No categories available"
                }
                value={
                  category.find(
                    (option) => option.value === formData.id_category
                  ) || null
                }
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    id_category: option ? option.value : "",
                  }))
                }
                isDisabled={category.length <= 0}
                noOptionsMessage={() =>
                  "No categories available for this metal"
                }
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.id_category}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Sub Category<span className="text-red-400">*</span>
              </label>
              <Select
                styles={customSelectStyles(metals)}
                options={subcategory}
                placeholder={
                  subcategory.length > 0
                    ? "Select Category"
                    : "No Sub categories available"
                }
                value={
                  subcategory.find(
                    (option) => option.value === formData.subcategoryId
                  ) || null
                }
                onChange={(option) =>
                  setFormData((prev) => ({
                    ...prev,
                    subcategoryId: option ? option.value : "",
                  }))
                }
                isDisabled={subcategory.length <= 0}
                noOptionsMessage={() =>
                  "No categories available for this metal"
                }
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.subcategoryId}
              </span>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Product Name<span className="text-red-400">*</span>
              </label>
              <input
                name="product_name"
                type="text"
                value={formData.product_name}
                className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-[42px]"
                placeholder="Enter Product Name"
                onChange={handleInputChange}
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.product_name}
              </span>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Product Code <span className="text-red-400">*</span>
              </label>
              <input
                name="code"
                type="text"
                value={formData.code}
                className="border-2 border-[#F2F2F9] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-[42px]"
                placeholder="Enter Product Code"
                onChange={handleInputChange}
              />
              <span className="text-red-500 text-sm mt-1">{errors.code}</span>
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-gray-700 mb-2 font-medium">
                Product Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="border-2 border-[#F2F2F9] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-[42px] min-h-[42px] max-h-[120px] px-4 pt-[10px] placeholder-gray-400 text-sm"
                placeholder="Enter product description"
              ></textarea>

              <span className="text-red-500 text-sm mt-1">
                {errors.description}
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 mt-2 font-medium">
                Size master<span className="text-red-400">*</span>
              </label>
              <Select
                styles={customSelectStyles(metals)}
                placeholder={
                  sizeMasterOptions.length > 0
                    ? "Select Size master"
                    : "No size master available"
                }
                options={sizeMasterOptions}
                value={
                  sizeMasterOptions.find(
                    (opt) => opt.value === formData?.availableSizes?.sizeId
                  ) || null
                }
                onChange={handleSizeMasterChange}
                isDisabled={subcategory.length <= 0}
                noOptionsMessage={() =>
                  "No Size Master available for this metal"
                }
              />
              <span className="text-red-500 text-sm mt-1">
                {errors.sizemaster}
              </span>
            </div>

            <div className="flex flex-col mt-2 ">
              <label className="text-gray-700 mb-2 font-medium">
                SKU Code<span className="text-red-400">*</span>
              </label>
              <div className="flex items-center border-2 border-[#F2F2F9] rounded-[8px] h-[44px] ">
                <input
                  type="string"
                  name="sku"
                  onChange={handleInputChange}
                  value={formData.sku}
                  className="w-full focus:outline-none ml-2  "
                  placeholder="SKU code"
                />
              </div>
            </div>

            <div className="flex flex-col mt-2 ">
              <label className="text-gray-700 mb-2 font-medium">
                Quantity<span className="text-red-400">*</span>
              </label>
              <div className="flex items-center border-2 border-[#F2F2F9] rounded-[8px] h-[44px] ">
                <input
                  type="string"
                  name="quantity"
                  onChange={handleInputChange}
                  value={
                    typeof formData?.quantity === "number"
                      ? formData?.quantity
                      : 0
                  }
                  className="w-full focus:outline-none ml-2 "
                  placeholder="Quantity"
                />
              </div>
            </div>
            <div className="flex flex-col mt-2 ">
              <label className="text-gray-700 mb-2 font-medium">
                Collection
              </label>
              <div className="flex items-center gap-6 mt-4 w-full flex-wrap">
                {collection.map((option, index) => (
                  <label key={index} className="flex items-center gap-2 whitespace-nowrap">
                    <input
                      className="w-4 h-4"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          collection: isChecked
                            ? [...prev.collection, option.value]
                            : prev.collection.filter((id) => id !== option.value)
                        }));
                      }}
                      name="collection"
                      checked={formData.collection?.includes(option.value)}
                      type="checkbox"
                      value={option.value}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col mt-2 w-full">
              <label className="text-gray-700 mb-2 font-medium">
                Upload Image<span className="text-red-400">*</span>{" "}
                <span className="text-sm font-normal">
                  (File size must be at least 500KB & Max 3 Images)
                </span>
              </label>

              <div className="flex gap-4 items-start">
                {product_image.length < 3 && (
                  <div className="flex items-center border border-[#F2F2F9] bg-white rounded h-[44px] overflow-hidden relative w-full max-w-xs">
                    <input
                      onChange={handleImageChange}
                      className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer"
                      name="product_image"
                      id="product_image"
                      type="file"
                      accept="image/*"
                      disabled={product_image.length >= 3}
                      multiple
                    />

                    <div className="px-3 text-sm text-gray-500 w-full">
                      {product_image.length > 0
                        ? `${product_image.length} file(s) selected`
                        : "Browse"}
                    </div>

                    <label
                      htmlFor="product_image"
                      className="bg-[#004181] h-full px-4 rounded-[8px] text-white text-sm flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      Choose File
                    </label>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="flex gap-2  ">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 border border-[#F2F2F9] rounded-md overflow-hidden relative shrink-0"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={allowDrop}
                        onDrop={() => handleDrop(index)}
                      >

                        <span className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full z-10">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full hover:bg-red-600 z-10"
                          type="button"
                        >
                          ×
                        </button>
                        <img
                          src={
                            preview.startsWith("blob:")
                              ? preview
                              : `${pathUrl}${preview}`
                          }
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.product_image && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.product_image}
                </span>
              )}
            </div>
            <div className="flex flex-col mt-10">
              <div className="flex gap-4 sm:order-3">
                <button
                  className="flex rounded-lg px-[20px] py-[8px] text-sm font-semibold text-[#034571] items-center whitespace-nowrap bg-white border border-[#034571] transition-colors sm:w-auto"
                  onClick={handleaddmetal}
                >
                  {id ? "Edit stone" : "Add Stone"}
                </button>
                <button
                  className="flex rounded-lg px-[20px] py-[8px] text-sm font-semibold text-[#034571] items-center whitespace-nowrap bg-white  border border-[#034571]  transition-colors sm:w-auto"
                  onClick={handleadddiamond}
                >
                  {/* Add Diamond */}
                  {id ? "Edit Diamond" : "Add diamond"}
                </button>
              </div>
            </div>
          </div>
          <ModelOne
            title={id ? "Edit Stone" : "Add Stone"}
            extraClassName="w-[600px]"
            setIsOpen={setIsviewOpen}
            isOpen={isviewOpen}
            closeModal={closeIncommingModal}
          >
            <Addstone
              setIsOpen={setIsviewOpen}
              stoneData={stoneData}
              setStoneData={setStoneData}
              id={id}
              Ids={Ids}
            />
          </ModelOne>
          <Modal />

          <ModelOne
            title={id ? "Edit Diamond" : "Add Diamond Details"}
            extraClassName="w-[600px]"
            setIsOpen={setIsviewOpendiamond}
            isOpen={isviewOpendiamond}
            closeModal={closeIncommingModaldiamond}
          >
            <Adddiamond
              setIsviewOpendiamond={setIsviewOpendiamond}
              diamondData={diamondData}
              setDiamondData={setDiamondData}
              id={id}
              Ids={Ids}
            />
          </ModelOne>
          <Modal />
        </div>
      </div>

      {availableSizes.length > 0 && (
        <div className="bg-white mt-6 px-4 p-3 rounded-[16px] border border-[#F2F2F9]">
          <div className="w-full mt-4">
            <h2 className="text-black pb-3">Available Size</h2>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size, index) => {
                const sizeValue = `${size}`;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleButtonClick(sizeValue)}
                    className={`px-4 py-2 rounded-full font-semibold border-2 transition
                    ${
                      selectedSizes.includes(sizeValue)
                        ? "bg-[#003B73] text-white border-[#003B73]"
                        : "bg-white text-[#003B73] border-[#003B73] hover:bg-[#0056b3] hover:text-white"
                    }`}
                  >
                    {sizeValue}mm
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSizes.length > 0 && (
            <div className="w-full mt-6">
              <h2 className="text-black pb-3">Size wise stock</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {selectedSizes.map((size, index) => {
                  const valueObj = formData.availableSizes.values.find(
                    (item) => item.sizeValue === parseFloat(size)
                  );
                  
                  return (
                    <div key={index} className="flex flex-col items-start">
                      <label className="font-medium text-gray-700 mb-1">
                        {size} mm<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={valueObj?.quantity || ""}
                        onChange={(e) => {
                          const newQuantity = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            availableSizes: {
                              ...prev.availableSizes,
                              values: prev.availableSizes.values.map((item) =>
                                item.sizeValue === parseFloat(size)
                                  ? { ...item, quantity: newQuantity }
                                  : item
                              ),
                            },
                          }));
                        }}
                        placeholder="Enter quantity"
                        className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white mt-6 px-4 p-3 rounded-[16px] border border-[#F2F2F9]">
        <Priceandweight
          onChange={handlepriceandweight}
          initialState={formData}
        />
        <div className="mt-6">
          <MakingChargesForm
            onChange={handleMakingCharge}
            initialState={formData.makingCharges}
          />
        </div>
        <div className="mt-6">
          <WastageChargeForm
            onChange={handleWastageCharge}
            initialState={formData.wastageCharges}
            error={errors}
          />
        </div>

        <div className="bg-white mt-8">
          <div className="flex justify-end gap-4">
            <button
              className="bg-[#E2E8F0] text-black rounded-md p-3 w-full lg:w-20"
              type="button"
              onClick={
                isLoading ? undefined : () => naviagte("/catalog/product")
              }
            >
              Cancel
            </button>
            <button
              className="bg-[#004181] text-white rounded-md p-2 w-full lg:w-20"
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? <SpinLoading /> : id ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;