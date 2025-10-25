import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { formatDecimal, formatNumber } from "../../../utils/commonFunction";
import Delivery from "../../../../assets/Delivery.svg";
import Pending from "../../../../assets/Pending.svg";
import Order from "../../../../assets/Order.svg";
import Shipment from "../../../../assets/Shipment.svg";
import { getOrderOverAll, getOverAllDashboard } from "../../../api/Endpoints";

function HeaderEcom({ id_branch, dateFilter }) {
  const initialState = {
    totalAccounts: 0,
    totalCustomers: 0,
    totalGoldSave: 0,
    totalAmount: 0,
    overDues: 0,
  };
  const [cardData, setCardData] = useState(initialState);
  const [cards, setCards] = useState([
    {
      _id: 1,
      title: "New order",
      subTitle: "Total Accounts",
      value: 0,
      image: Order,
    },
    {
      _id: 2,
      title: "Pending",
      value: 0,
      image: Pending,
    },
    {
      _id: 3,
      title: "Delivered Today",
      value: 0,
      image: Delivery,
    },
    {
      _id: 4,
      title: "In Shipment",
      value: 0,
      image: Shipment,
    },
  ]);

  useEffect(() => {
    getOverAll();
  }, [dateFilter]);

  const { mutate: getOverAll } = useMutation({
    mutationFn: () => getOrderOverAll(dateFilter),
    onSuccess: (response) => {
      setCards((prevCards) =>
        prevCards.map((card) => {
          switch (card._id) {
            case 1:
              return { ...card, value: response.data.newOrders };
            case 2:
              return { ...card, value: response.data.pendingOrders };
            case 3:
              return { ...card, value: response.data.deliveredToday };
            case 4:
              return { ...card, value: response.data.inShipment };
            default:
              return card;
          }
        })
      );
    },
    onError: (error) => {
      setCardData(initialState);
    },
  });

  return (
    <div className="flex flex-col gap-5 py-3 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 text-[#232323]">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[20px] p-4 border-[1px] border-[#F5F5F5] flex flex-col gap-4"
          >
            <img src={card.image} alt={card.title} className="h-10 w-10" />
            <div className="flex flex-col gap-1">
              {card.subTitle && card.sub_Value !== undefined ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col items-start">
                      <p className="text-xl font-bold">{card.sub_Value}</p>
                      <p className="text-[#6C7086] text-sm font-medium">
                        {card.subTitle}
                      </p>
                    </div>
                    <div className="text-[#F5F5F5] text-xl font-semibold border-s-2 border-[#F5F5F5] h-[50px]"></div>
                    <div className="flex flex-col items-start">
                      <p className="text-xl font-semibold"> {card.value} </p>
                      <p className="text-[#6C7086] text-sm font-medium">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold">
                    {card.title == "Total Payment"
                      ? formatNumber({ value: card.value, decimalPlaces: 0 })
                      : card.value}
                  </p>
                  <p className="text-[#6C7086] text-sm font-medium">
                    {card.title}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeaderEcom;
