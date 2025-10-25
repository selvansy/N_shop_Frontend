import React, { useEffect, useState } from "react";

import Select from "react-select";
import { customSelectStyles } from "../../Setup/purity";

import { useSelector } from "react-redux";
import {
  accountStats,
  getAllBranch,
  getbranchbyid,
} from "../../../api/Endpoints";
import { useMutation } from "@tanstack/react-query";
import { customStyles } from "../../ourscheme/scheme/AddScheme";
import HeaderDashborder from "../../SuperAdmin/Dashboard/top-section/headerDashborder";
import AccountReview from "../../SuperAdmin/Dashboard/accountReview/accountReview";
import AccountStatus from "../../SuperAdmin/Dashboard/accountReview/accountStatus";
import PaymentHistory from "../../SuperAdmin/Dashboard/notification_payment/payment_history";
import ModeOfPayment from "../../SuperAdmin/Dashboard/modeOfPayment/modeOfPayment";
import NotificationCard from "../../SuperAdmin/Dashboard/notification_payment/notification";
import HeaderEcom from "./Headerdasahboardecom";
import Topselling from "./Topselling";
import Sales from "./Sales";
import Recentorder from "./Recentorder";
import Lowstock from "./Lowstockreport";
import DateRangeSelector from "../../common/calender";

function EcomDashboard() {
  const roleData = useSelector((state) => state.clientForm.roledata);
  const accessBranch = roleData?.branch;
  const [branch, setBranch] = useState(() => (accessBranch === "0" ? [] : {}));
  const [selectedBranch, setSelectedBranch] = useState("");
  const [from_date, setfrom_date] = useState();
  const [to_date, setto_date] = useState();
  useEffect(() => {
    if (!roleData) return;
    if (accessBranch !== "0") {
      getBranchData({ id: accessBranch });
    } else if (accessBranch == "0") {
      getAllBranches();
    }

    return () => {
      setSelectedBranch("");
    };
  }, [roleData]);

  //mutation to get branch by id
  const { mutate: getBranchData } = useMutation({
    mutationFn: (data) => getbranchbyid(data),
    onSuccess: (response) => {
      const { data } = response;
      setBranch({
        _id: data._id,
        branch_name: data.branch_name,
      });
      setSelectedBranch(data._id);
    },
    onError: (error) => {
      console.error("Error fetching branches:", error);
    },
  });

  //mutation to get all branches
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

  return (
    <>    <div className="px-1 -ml-2">
      {/* branch selection */}
      <div className="flex justify-end">
        <div className="mt-2 pr-5">
         <DateRangeSelector
                        onChange={(range) => {
                        
                          setfrom_date(range.startDate);
                          setto_date(range.endDate);
                        }}
                      />
                      </div>

        {accessBranch == "0" && branch.length > 0 ? (
          <div>
          <Select
            isClearable={true}
            className="mt-2 min-w-[190px]"
            styles={customStyles(true)}
            options={branch || []}
            placeholder="Branch"
            value={branch.find((option) => option.value === selectedBranch) || null}
            onChange={(option) => {
              // Handle both selected and cleared values
              setSelectedBranch(option ? option.value : null);
            }}
          />
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
       
      </div>

  
      <div className="mb-[10px]">
        {/* <HeaderDashborder id_branch={selectedBranch} /> */}
        <HeaderEcom  dateFilter={{fromDate:from_date,toDate:to_date}}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-7 gap-2 mb-[9px] ">
        <div className="md:col-span-4 mr-3 ">
            <Topselling />
        </div>
        <div className="md:col-span-3 ">
            <Sales />
          {/* <AccountStatus id_branch={selectedBranch} /> */}
        </div>
      </div>

    </div>
   
   <div className="border-[1px] border-[#F5F5F5] p-5 rounded-[20px] lg:col-span-2 bg-white text-[#232323]">
    <Recentorder />
   </div>

    <div className="border-[1px] border-[#F5F5F5] p-5 rounded-[20px] lg:col-span-2 mt-5 bg-white text-[#232323]">
    <Lowstock />
   </div>
   </>

  );
}

export default EcomDashboard;
