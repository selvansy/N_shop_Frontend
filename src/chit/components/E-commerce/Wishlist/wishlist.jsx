import React, { useState } from 'react'
import { Breadcrumb } from '../../common/breadCumbs/breadCumbs'
import Table from '../../common/Table';
import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { header } from 'framer-motion/client';

const Wishlist = () => {

    const [searchLoading, setSearchLoading] = useState(false);
    const [search, setSearch] = useState([]);
    const [wishlistdata, setWishlistdata] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [totalDocuments, setTotalDocuments] = useState(0);


      const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const pageNumber = Number(page);
    if (
      !pageNumber ||
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > totalPages
    ) {
      return;
    }

    setCurrentPage(pageNumber);
  };
    const { mutate: getCategory } = useMutation({
        mutationFn: (payload) => getstonetable(payload),
        onSuccess: (response) => {

            setWishlistdata(response?.data);
            setTotalPages(response.totalPages);
            setIsLoading(false);
            setSearchLoading(false);
            setTotalDocuments(response.totalDocuments);
        },
        onError: (error) => {
            console.error("Error:", error);
            setWishlistdata([]);
            setIsLoading(false);
            setSearchLoading(false);
        },
    });

      const hanldeActiveDropDown = (data) => {
    setActiveDropdown(data);
  };

   const handleEdit = (id) => {
    console.log(id);
    setIsviewOpen(true);
    setId(id);
  };

    const handleDelete = (id) => {
      setActiveDropdown(null);
      dispatch(
        openModal({
          modalType: "CONFIRMATION",
          header: "Delete Wishlist",
          formData: {
            message: "Are you sure you want to delete this Wishlist? This will also delete related to this Wishlist, and this action cannot be undone.",
            CategoryId: id,
          },
          buttons: {
            cancel: {
              text: "Cancel",
            },
            submit: {
              text: "Delete",
            },
          },
        })
      );
    };


    const columns = [
        {
            header: "S.No",

        },
        {
            header:"Customer Name",
        },
        {
            header:"Customer ID",

        },
        {
            header:"Product Name",
        },{
            header:"Product code"
        },
        {
            header:"Metal",
        },
        {
            header:"Category",

        },{
            header:"Purity",

        },{
            header:"Weight",
        },
        {
            header:"Stone/Diamond",
        },
        {
            header:"Per Crate rate",

        },{
            header:"Avilable Stock",
        },
        {
            header:"Wishlist Count",
        },
        {
             header: "Actions",
      cell: (row, rowIndex) => (
        <Action
          row={row}
        //   data={productData}
          rowIndex={rowIndex}
          activeDropdown={activeDropdown}
          setActive={hanldeActiveDropDown}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ),
      sticky: "right",
        }
    ]

    return (
        <>
            <Breadcrumb
                items={[{ label: "Wishlist" }, { label: "Wishlist Details", active: true }]}
            />
          <div className="flex flex-col p-4 bg-white border border-[#F2F2F9]  rounded-[16px] ">
        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="relative w-full  sm:mb-0 sm:order-2 sm:w-auto">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {searchLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                            ) : (
                                <Search className="text-[#6C7086] h-5 w-5" />
                            )}
                        </div>
                        <input
                            onChange={(e) => {
                                setSearchLoading(true);
                                setSearch(e.target.value);
                            }}
                            placeholder="Search"
                            className="px-4 py-2 ps-9 border-2 border-[#F2F2F9] rounded-[8px] w-full h-[36px]"
                        />
                    </div>
                      </div>
                    <div className="mt-4">
                        <Table
                            data={wishlistdata}
                            columns={columns}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            handlePageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalDocuments}
                            handleItemsPerPageChange={handleItemsPerPageChange}
                        />
                  
                </div>
            </div>
        </>
    )
}

export default Wishlist;