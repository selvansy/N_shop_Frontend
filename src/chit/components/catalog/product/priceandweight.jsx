import React, { useEffect, useState } from 'react'

const Priceandweight = ({ onChange, initialState }) => {
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        if (!initialState) return
        setFormData(initialState)
    }, [initialState])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedFormData = { ...prev, [name]: value };
            onChange?.(updatedFormData);
            return updatedFormData;
        });
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        const metalPrice = (formData.currentMetalRate || 0) * (formData.netWeight || 0);
        const stonePrice = parseFloat(formData.stoneprice || 0);
        const diamondPrice = parseFloat(formData.diamondprice || 0);
        const makingCharge = parseFloat(formData.makingCharges?.discountedValue || 0);
        const wastageCharge = parseFloat(formData.wastageCharges?.discountedValue || 0);
        
        const subtotal = metalPrice + stonePrice + diamondPrice + makingCharge + wastageCharge;
        const gstAmount = subtotal * (parseFloat(formData.gst || 0) / 100);
        
        return (subtotal + gstAmount).toFixed(2);
    };

    // Calculate price without GST (for the price field)
    const calculatePrice = () => {
        const metalPrice = (formData.currentMetalRate || 0) * (formData.netWeight || 0);
        const stonePrice = parseFloat(formData.stoneprice || 0);
        const diamondPrice = parseFloat(formData.diamondprice || 0);
        const makingCharge = parseFloat(formData.makingCharges?.discountedValue || 0);
        const wastageCharge = parseFloat(formData.wastageCharges?.discountedValue || 0);
        
        return (metalPrice + stonePrice + diamondPrice + makingCharge + wastageCharge).toFixed(2);
    };

    return (
        <div>
            <h2 className="text-xl text-[#023453] font-bold justify-between mb-3">
                Price and Weight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col mt-2 ">
                    <label className="text-gray-700 mb-2 font-medium">
                        Current Metal Rate<span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center border-2 border-[#F2F2F9] rounded-[8px] h-[44px] bg-[#F4F4F4]">
                        <div className="h-[44px] border-e-2 border-[#F2F2F9] flex items-center">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                ₹
                            </span>
                        </div>
                        <input
                            name="currentmetalrate"
                            type="string"
                            value={formData.currentMetalRate || 0}
                            onChange={handleInputChange}
                            className="w-full focus:outline-none ml-2  bg-[#F4F4F4]"
                            placeholder="Current Metal Rate"
                            readOnly
                        />
                    </div>
                </div>

                <div className="flex flex-col mt-2">
                    <label className="text-gray-700 mb-2 font-medium">
                        Gross Weight<span className="text-red-400">*</span>
                    </label>
                    <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px] relative">
                        <input
                            name="grossWt"
                            type="string"
                            value={formData.grossWt || ''}
                            className=" border-2 border-[#F2F2F9] rounded-md pr-14 pl-3 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-full "
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
                </div>

                <div className="flex flex-col mt-2">
                    <label className="text-gray-700 mb-2 font-medium">
                        Net Weight<span className="text-red-400">*</span>
                    </label>
                    <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px]">
                        <input
                            name="netWeight"
                            type="string"
                            value={formData.netWeight || ''}
                            className=" rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent "
                            placeholder="Enter Here"
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                        />
                        <div className="h-[43px] border-s-2 border-[#F2F2F9] flex items-center">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                g
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-2">
                    <label className="text-gray-700 mb-2 font-medium">
                        Total Stone Weight
                    </label>
                    <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px] relative">
                        <input
                            type="number"
                            value={formData.stonewt || 0}
                            className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-100"
                            readOnly
                        />
                        <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center border-s-2 border-[#F2F2F9] rounded-r-md bg-white">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                g
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-2">
                    <label className="text-gray-700 mb-2 font-medium">
                        Total Diamond Weight
                    </label>
                    <div className="flex border-2 border-[#F2F2F9] h-[44px] rounded-[8px] relative">
                        <input
                            type="number"
                            value={formData.diamondwt || 0}
                            className="rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-100"
                            readOnly
                        />
                        <div className="absolute right-0 top-0 h-full w-14 flex items-center justify-center border-s-2 border-[#F2F2F9] rounded-r-md bg-white">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                cts
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-2 ">
                    <label className="text-gray-700 mb-2 font-medium">
                        Price<span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center border-2 border-[#F2F2F9] rounded-[8px] h-[44px] bg-[#F4F4F4]">
                        <div className="h-[44px] border-e-2 border-[#DEDEDE] flex items-center">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                ₹
                            </span>
                        </div>
                        <input
                            name="price"
                            type="string"
                            value={calculatePrice()}
                            className="w-full focus:outline-none ml-2  bg-[#F4F4F4]"
                            placeholder="Price"
                            readOnly
                        />
                    </div>
                </div>

                <div className="flex flex-col mt-2">
                    <label className="text-gray-700 mb-2 font-medium">
                        GST %<span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="gst"
                            value={formData.gst || 3}
                            type="number"
                            onChange={handleInputChange}
                            className="border-2 border-[#F2F2F9] rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent h-[42px]"
                            placeholder="GST"
                            min="0"
                            max="100"
                        />
                        <span className="absolute right-0 top-0 h-full w-14 flex items-center justify-center border-s-2 border-[#F2F2F9] rounded-r-md">
                            %
                        </span>
                    </div>
                </div>

                <div className="flex flex-col mt-2 ">
                    <label className="text-gray-700 mb-2 font-medium">
                        Total Price<span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center border-2 border-[#F2F2F9] rounded-[8px] h-[44px] bg-[#F4F4F4]">
                        <div className="h-[44px] border-e-2 border-[#DEDEDE] flex items-center">
                            <span className="px-[14px] flex items-center justify-center h-full">
                                ₹
                            </span>
                        </div>
                        <input
                            type="string"
                            value={calculateTotalPrice()}
                            className="w-full focus:outline-none ml-2  bg-[#F4F4F4]"
                            placeholder="Total Price"
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Priceandweight;