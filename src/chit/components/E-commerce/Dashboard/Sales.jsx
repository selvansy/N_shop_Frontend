import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import { CalendarSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { customStyles } from "../../ourscheme/scheme/AddScheme";
import { getTopTenSellProductByCategory } from "../../../api/Endpoints";

// Custom select control with icon
const CustomControl = (props) => (
  <components.Control {...props}>
    <CalendarSearch className="ml-4 mr-2 text-[#232323] w-5 h-5" />
    {props.children}
  </components.Control>
);

// Helpers
const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};
const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const now = new Date();
const options = [
  { label: "Today", value: new Date().toISOString() },
  { label: "Last Week", value: new Date(new Date().setDate(now.getDate() - 7)).toISOString() },
  { label: "This Month", value: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() },
  { label: "This Year", value: new Date(now.getFullYear(), 0, 1).toISOString() },
];

const Sales = () => {
  const [statusData, setStatusData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [dateRange, setDateRange] = useState({
    startDate: getStartOfDay(new Date()),
    endDate: getEndOfDay(new Date()),
  });
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const colors = ["#3A0CA3", "#004181", "#B5179E", "#FFC300", "#D99FE7", "#317BFF"];
  const getColor = (index) => colors[index % colors.length];

  const { mutate: getAccountData } = useMutation({
    mutationFn: ({ fromDate, toDate }) => getTopTenSellProductByCategory({ fromDate, toDate }),
    onSuccess: (response) => {
      const data = response?.data || [];
      const formatted = data.map((item, index) => ({
        label: item.categoryName,
        color: getColor(index),
        percentage: item.totalSold,
      }));
      setStatusData(formatted);
    },
    onError: () => {
      setStatusData([]);
    },
  });

  useEffect(() => {
    getAccountData({ fromDate: dateRange.startDate, toDate: dateRange.endDate });
  }, [dateRange]);

  const total = statusData.reduce((sum, item) => sum + item.percentage, 0);

  const handleDateChange = (option) => {
    setSelectedOption(option);
    const currentDate = new Date();
    let startDate, endDate;

    switch (option.label) {
      case "Today":
        startDate = getStartOfDay(currentDate);
        endDate = getEndOfDay(currentDate);
        break;
      case "Last Week":
        const lastWeek = new Date(currentDate);
        lastWeek.setDate(currentDate.getDate() - 7);
        startDate = getStartOfDay(lastWeek);
        endDate = getEndOfDay(currentDate);
        break;
      case "This Month":
        startDate = getStartOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        endDate = getEndOfDay(currentDate);
        break;
      case "This Year":
        startDate = getStartOfDay(new Date(currentDate.getFullYear(), 0, 1));
        endDate = getEndOfDay(currentDate);
        break;
      default:
        break;
    }
    setDateRange({ startDate, endDate });
  };

  // Chart setup
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let startPosition = 0;

  const navigate = useNavigate();

  return (
    <div className="border border-[#F5F5F5] p-5 rounded-[20px] lg:col-span-2 bg-white text-[#232323]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-gray-800 font-bold text-lg">Sales By Category</h2>
        <Select
          options={options}
          value={selectedOption}
          onChange={handleDateChange}
          styles={customStyles(true)}
          components={{ Control: CustomControl }}
        />
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-56 h-72 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F5F5F5" strokeWidth="16" />
            {statusData.map(({ label, color, percentage }) => {
              if (percentage <= 0) return null;
              const segmentPercentage = total > 0 ? (percentage / total) * 100 : 0;
              const arcLength = (segmentPercentage / 100) * circumference;

              const circleElement = (
                <circle
                  key={label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={color}
                  strokeWidth="16"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset={-startPosition}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredSegment(label)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: "pointer" }}
                />
              );

              startPosition += arcLength;
              return circleElement;
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center flex-col">
            {hoveredSegment ? (
              <>
                <span className="text-sm text-gray-500">{hoveredSegment}</span>
                <span className="text-xl font-medium text-gray-400">
                  {statusData.find((item) => item.label === hoveredSegment)?.percentage}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-xl font-medium text-gray-400">{total}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {statusData.map(({ label, color, percentage }) => (
            <div
              key={label}
              className="flex items-center group"
              onMouseEnter={() => setHoveredSegment(label)}
              onMouseLeave={() => setHoveredSegment(null)}
              style={{ cursor: "pointer" }}
            >
              <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: color }}></div>
              <span className="text-md">{label}</span>
              <span className="text-sm ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {percentage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sales;
