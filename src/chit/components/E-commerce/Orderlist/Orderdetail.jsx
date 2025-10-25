import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../common/breadCumbs/breadCumbs";
import { useMutation } from "@tanstack/react-query";
import { getorderbyid } from "../../../api/Endpoints";
import { useParams } from "react-router-dom";

const Orderdetail = () => {
  const [data, setData] = useState([]);
  const { id } = useParams();
  const [status,setStatus]=useState(1)
  //   const { mutate: getorderbyid1 } = useMutation({
  //   mutationFn: getorderbyid,
  //   onSuccess: (response) => {
  //     console.log(response)
  //     const data = response.data;
  //    setData(data);
  //   },
  //   onError: (error) => {
  //     console.error("Error fetching data:", error);
  //   },
  // });

  const { mutate: Getorder } = useMutation({
    mutationFn: getorderbyid,
    onSuccess: (response) => {
      setData(response.data);
      setStatus(response.data.overAll.orderStatus)
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  useEffect(() => {
    if (id) Getorder(id);
  }, [id]);

  const placedAt = data?.overAll?.placedAt
    ? new Date(data.overAll.placedAt)
    : null;

  const ArrivedAT = data?.overAll?.arrivedAt
    ? new Date(data.overAll.arrivedAt)
    : null;



  const events = [
    {
      key: 1,
      title: "Process order",
      desc: "Your order is Processing",
      time: "17:30",
      date: "15-2-2025",
      active: status >= 1, // ✅ active if status >= 1
    },
    {
      key: 2,
      title: `Order was placed (Order ID : ${data?.overAll?.orderId})`,
      desc: "Your order has been placed successfully",
      time: placedAt
        ? placedAt.toLocaleString("en-GB", {
            weekday: "long",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "",
      date: placedAt
        ? placedAt.toLocaleDateString("en-GB").replace(/\//g, "-")
        : "",
      active: status >= 2, // ✅ active if status >= 2
    },
    {
      key: 3,
      title: "Delivered",
      desc: "Your order has been successfully delivered 🎉",
      time: ArrivedAT
        ? ArrivedAT.toLocaleString("en-GB", {
            weekday: "long",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "",
      date: ArrivedAT
        ? ArrivedAT.toLocaleDateString("en-GB").replace(/\//g, "-")
        : "",
      active: status >= 3, // ✅ active if status >= 3
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[{ label: "Order" }, { label: "Order Details", active: true }]}
      />
      <div className="flex flex-col gap-5 py-3 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 flex flex-col gap-5">
            <div className="border border-[#F5F5F5] bg-white p-5 rounded-[20px]">
              <h1 className="text-xl font-semibold text-[#232323]">
                Order :{data?.overAll?.orderId}
              </h1>
              {/* <h2 className="text-sm text-gray-500">{data?.overAll?.placedAt}</h2> */}
              <h2 className="text-sm text-gray-500">
                {data?.overAll?.placedAt
                  ? new Date(data.overAll.placedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""}
              </h2>

              <div className="relative overflow-x-auto mt-6">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-[#6C7086] border-b uppercase bg-[#E7EEF5]">
                    <tr>
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Image</th>
                      <th className="px-6 py-3">Qty</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.item?.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4">{product.productName}</td>
                        <td className="px-6 py-4">
                          <img
                            src={`${data?.productPathUrl}${product.img}`}
                            alt={product.productName}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4">{product.qty}</td>
                        <td className="px-6 py-4">{product.size}</td>
                        <td className="px-6 py-4">₹{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end mt-8 space-y-2">
                <p className="text-sm">
                  Sub Total: ₹{" "}
                  {data?.overAll?.subTotal
                    ? data.overAll.subTotal.toFixed(3)
                    : "0.000"}
                </p>
                <p className="text-sm">GST: ₹ 0.00</p>
                <p className="text-sm font-semibold">
                  Grand Total: ₹{" "}
                  {data?.overAll?.totalAmount
                    ? data.overAll.totalAmount.toFixed(3)
                    : "0.000"}
                </p>
              </div>
            </div>

          </div>

          {/* <div className='xl:col-span-2 flex flex-col gap-5'></div> */}

          <div className="border border-[#F5F5F5] bg-white p-5 rounded-[20px]">
            <div className="border border-[#F5F5F5] bg-white p-8 rounded-[20px] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-300">
                  <img
                    src={`${data?.customerPathUrl}${data?.overAll?.cus_img}`}
                    alt={data?.overAll?.name}
                    className="h-12 w-12 object-cover rounded-md"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#232323]">
                    {data?.overAll?.name}
                  </h3>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#232323] text-sm">
                  Contact Info
                </h4>
                <p className="text-sm text-gray-500">
                  Email: {data?.overAll?.email ? data?.overAll?.email : "-"}
                </p>
                <p className="text-sm text-gray-500">
                  Phone: {data?.overAll?.mobile}{" "}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#232323] text-sm">
                  Shipping Address
                </h4>
                <p className="text-sm text-gray-500">
                  {data?.overAll?.address}
                </p>
              </div>

              {/* <div>
        <h4 className="font-semibold text-[#232323] text-sm">Delivery</h4>
        <p className="text-sm text-gray-500">Shipping Company</p>
          <p className="text-sm text-gray-500">Track ID</p>
      </div> */}

              {/* <div>
        <h4 className="font-semibold text-[#232323] text-sm">Payment</h4>
        <p className="text-sm text-gray-500">Card Number:</p>
      </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orderdetail;
