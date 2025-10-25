import React, { useEffect, useState } from 'react'
import { customStyles } from '../../ourscheme/scheme/AddScheme';
import Select, { components } from "react-select";
import { CalendarSearch, MoreHorizontal } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LogarithmicScale,
  BarElement,
  Title,
  LinearScale, 
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getOrderOverAll, getTopTenSellProduct } from '../../../api/Endpoints';
import { useMutation } from '@tanstack/react-query';

ChartJS.register(
  CategoryScale,
  LinearScale, 
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomControl = (props) => (
  <components.Control {...props}>
    <CalendarSearch className="ml-4 mr-2 text-[#232323] w-5 h-5" />
    {props.children}
  </components.Control>
);


const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Helper function to get end of day (23:59:59)
const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const now = new Date();

const options = [
  {
    label: "Today",
    value: new Date().toISOString(),
  },
  {
    label: "Last Week",
    value: new Date(new Date().setDate(now.getDate() - 7)).toISOString(),
  },
  {
    label: "This Month",
    value: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
  },
  {
    label: "This Year",
    value: new Date(now.getFullYear(), 0, 1).toISOString(),
  },
  // {
  //   label: "Custom",
  //   value: "",
  // },
];

const initialState = {
  totalAccounts: 0,
  digiGoldAccounts: 0,
  digiSilverAccounts: 0,
  openAccounts: 0,
  closeAccounts: 0,
  completedAccounts: 0,
  preclosedAccounts: 0,
  refundAccounts: 0,
};

const Topselling = () => {

  const [accountData, setAccountData] = useState(initialState);
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [dateRange, setDateRange] = useState({
      startDate: getStartOfDay(new Date()),
      endDate: getEndOfDay(new Date()),
    });


  const [chartData, setChartData] = useState(null);
  const [productData,setProductData] =useState([]) 
 useEffect(() => {
    getOverAll();
  }, [dateRange]);

const { mutate: getOverAll } = useMutation({
    mutationFn: () => getTopTenSellProduct({fromDate:dateRange.startDate,toDate:dateRange.endDate}),
    onSuccess: (response) => {
     setProductData(response.data)
    },
    onError: (error) => {
     setProductData([])
    },
  })

  useEffect(() => {
    const labels = productData.map((item) => item.name);
    const values = productData.map((item) => item.totalSold);

    setChartData({
      labels,
      datasets: [
        {
          label: "Jewellery Sales",
          data: values,
          backgroundColor: "#7367F0", 
          // borderRadius: 8,
          borderRadius: {
            topLeft: 5,
            topRight: 5,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.5,
        },
      ],
    });
  }, [productData]);

  const chartoptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) => context.raw.toLocaleString("en-IN"), 
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#555",
          font: { size: 10, weight: "bold" },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        type: "linear",
        ticks: {
          color: "#555",
          callback: (value) => value.toLocaleString("en-IN"), 
          font: { size: 10, weight: "bold" },
          // stepSize: 10000,
        },
        grid: { color: "#ddd", lineWidth: 1 },
      },
    },
  };

  if (!chartData) {
    return <p>Loading chart...</p>;
  }

    const handleDateChange = (option) => {
    setSelectedOption(option);

    const currentDate = new Date();
    let startDate;
    let endDate;

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
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        startDate = getStartOfDay(startDate);
        endDate = getEndOfDay(currentDate);
        break;
      case "This Year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        startDate = getStartOfDay(startDate);
        endDate = getEndOfDay(currentDate);
        break;
      case "Custom":
        startDate = null;
        endDate = null;
        break;
      default:
        break;
    }

    setDateRange({ startDate, endDate });
  };


  return (
     <div className="bg-white rounded-[20px] p-5 lg:col-span-3 border-[1px] border-[#F5F5F5] text-[#232323]">
      <div className="flex justify-between items-center mb-4">
           <h2 className="font-bold text-lg">Top Selling Product</h2>
            <Select
          options={options}
          value={selectedOption}
          onChange={handleDateChange}
          defaultValue={options[0]}
          // styles={{
          //   control: (base) => ({
          //     ...base,
          //     backgroundColor: "white",
          //     border: "2px solid #f2f3f8",
          //     borderRadius: "8px",
          //     borderColor: "#F5F5F5",
          //     padding: "2px",
          //     cursor: "pointer",
          //   }),
          //   indicatorSeparator: () => ({
          //     display: "none",
          //   }),
          // }}
          styles={customStyles(true)}
          components={{ Control: CustomControl }}
        />
      </div>
      <div className="bg-white rounded-[20px] p-5 lg:col-span-3 border-[1px] border-[#F5F5F5] text-[#232323] h-[450px]">
        <Bar data={chartData} options={chartoptions} />
      </div>

      {/* <Bar data={chartData} options={chartoptions} /> */}
        </div>
  )
}

export default Topselling