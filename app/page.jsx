"use client";

import Navbar from "@/components/Navbar";
import Sidenav from "@/components/Sidenav";
import { useDashboardDataMutation } from "@Slices/userApiSlice";
import { useVendorGetMutation } from "@Slices/vendorApiSlice";
import { usePartnerGetMutation } from "@Slices/partnersApiSlice";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import moment from "moment/moment";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Product from "@components/product";

export default function Home() {
  const [Dashboard, setDashboard] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [searchPartner, setSearchPartner] = useState("");

  const [fetchDashboardData] = useDashboardDataMutation();
  const [vendorGet] = useVendorGetMutation();
  const [partnerGet] = usePartnerGetMutation();

  const router = useRouter();
  // const { id } = router.query;



  const handleDataFetch = async () => {
    try {
      const res = await fetchDashboardData().unwrap();

      if (res?.status === "Success") {
        setDashboard(res?.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
    }
  };

  const handleVendorFetch = async () => {
    try {
      const res = await vendorGet().unwrap();

      if (res?.status === "Success") {
        setVendors(res?.data);
      }
    } catch (error) {
      console.error("Error fetching vendor data: ", error);
    }
  };

  const handlePartnerFetch = async () => {
    try {
      const res = await partnerGet().unwrap();

      if (res?.status === "Success") {
        setPartners(res?.data);
      }
    } catch (error) {
      console.error("Error fetching partner data: ", error);
    }
  };

  useEffect(() => {
    handleDataFetch();
    filterOrdersByLocation();
    handleVendorFetch();
    handlePartnerFetch();
  }, [searchInput]);

  const filterOrdersByLocation = () => {
    if (!searchInput) {
      setFilteredOrders(Dashboard?.PendingOrders?.orders || []);
    } else {
      const filtered = (Dashboard?.PendingOrders?.orders || []).filter((order) =>
        order.deliveryAddress.address1.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

vendors.filter(vendor => {
  if (searchVendor === "") {
    return vendor;
  } else if (vendor.address.toLowerCase().includes(searchVendor.toLowerCase())) {
    return vendor;
  }
});

partners.filter((partner) => {
  if (searchPartner === "") {
    return true;
  } else if (partner?.location?.toLowerCase()?.includes(searchPartner.toLowerCase())) {
    return true;
  }
  return false;
});


  return (
    <>
      <main className="max-w-full">
        <div className="flex w-full max-h-screen">
          <Sidenav />
          <Navbar />
          <div className="flex w-full pt-12">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              <div className="w-full h-full">
                {/* ------------------- main content here
            ---------------------------------------------------
            */}
                <div className="px-2 py-4">
                  <div className="p-2">
                    <p className="text-xl">Dashboard</p>
                  </div>

                  <div className="py-2">
                    <div className="grid grid-cols-4">
                      <div className="border border-slate-100 rounded-sm p-3 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          {Dashboard?.Products
                            ? Dashboard?.Products?.count
                            : "___"}
                        </h3>
                        <p className="text-center my-2 text-lg">Products</p>
                      </div>
                      <div className="border border-slate-100 rounded-sm p-3 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          {Dashboard?.Users ? Dashboard?.Users?.count : "___"}
                        </h3>
                        <p className="text-center my-2 text-lg">Customers</p>
                      </div>
                      <div className="border border-slate-100 rounded-sm p-3 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          {Dashboard?.PendingOrders
                            ? Dashboard?.PendingOrders?.count
                            : "___"}
                        </h3>
                        <p className="text-center my-2 text-lg">
                          Pending Orders
                        </p>
                      </div>
                    </div>
                    <div className="py-4 px-2">
                      {/* // display pending orders */}
                      <div className="mt-4">
                    <form>
                    <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                     <svg
                      className="h-6 w-6 text-gray-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                     >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                   </svg>
                 </span>
                 <input
                   type="text"
                   className="pl-10 pr-3 py-2 border rounded-md border-gray-200 focus:border-blue-500 focus:outline-none w-1/4"
                   placeholder="Search for order by location..."
                   value={searchInput}
                   onChange={(e) => {
                     setSearchInput(e.target.value);
                     filterOrdersByLocation();
                    }}
                  />
                </div>
               </form>
             </div>
                      <div className="mb-4">
                        <div className="py-2">
                          <div className="flex justify-between">
                            <p className="text-md font-bold">New Orders</p>
                            <div>
                              <Button type={"button"}>View All</Button>
                            </div>
                          </div>
                        </div>
                        {Dashboard?.PendingOrders &&
                          Dashboard?.PendingOrders?.orders && (
                            <div className="border border-slate-100 rounded-md">
                              <Table>
                                <TableCaption>New Orders</TableCaption>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>firstname</TableHead>
                                    <TableHead>lastname</TableHead>
                                    <TableHead>items</TableHead>
                                    <TableHead>payment</TableHead>
                                    <TableHead>total</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Delivery address</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredOrders.map(
                                    (order, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {order?.user?.firstname}
                                        </TableCell>
                                        <TableCell>
                                          {order?.user?.lastname}
                                        </TableCell>
                                        <TableCell>{`${order?.productItems}`}</TableCell>
                                        <TableCell>
                                          {order?.paymentMethod
                                            ? order?.paymentMethod
                                            : order?.payment?.paymentMethod}
                                        </TableCell>
                                        <TableCell>{`UGX ${order?.total}`}</TableCell>
                                        <TableCell>
                                          {moment(order?.createdAt).fromNow()}
                                        </TableCell>
                                        <TableCell>
                                          {order?.deliveryAddress.address1}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                      </div>
                      <Product router={router} />
                      <div className="mb-4">
                      <div className="mt-4">
                          <form>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <svg
                               className="h-6 w-6 text-gray-300"
                               xmlns="http://www.w3.org/2000/svg"
                               fill="none"
                               viewBox="0 0 24 24"
                               stroke="currentColor"
                              >
                          <path
                             strokeLinecap="round"
                             strokeLinejoin="round"
                             strokeWidth="2"
                             d="M4 6h16M4 12h16M4 18h16"
                           />
                          </svg>
                          </span>
                      <input
                        type="text"
                        className="pl-10 pr-3 py-2 border rounded-md border-gray-200 focus:border-blue-500 focus:outline-none w-1/4"
                        placeholder="Search for vendor by location..."
                        value={searchVendor}
                        onChange={(e) => {
                          setSearchVendor(e.target.value)
                          filterVendorsByLocation();
                        }}
                      />
                     </div>
                    </form>
                   </div>
                        <div className="py-2">
                         <div className="flex justify-between">
                          <p className="text-md font-bold">Vendors</p>
                          </div>
                        </div>
                          {vendors.length > 0 && (
                           <div className="border border-slate-100 rounded-md">
                             <Table>
                             <TableCaption>Vendor Data</TableCaption>
                              <TableHeader>
                                <TableRow>
                                   <TableHead>Name</TableHead>
                                   <TableHead>Address</TableHead>
                                   <TableHead>Phone</TableHead>
                                   <TableHead>Transport</TableHead>
                                   <TableHead>Date</TableHead>
                                   </TableRow>
                                   </TableHeader>
                                <TableBody>
                                  {
                                    vendors.filter(vendor => {
                                      if (searchVendor === '') {
                                        return vendor;
                                      } else if (vendor.address.toLowerCase().includes(searchVendor.toLocaleLowerCase())) {
                                        return vendor
                                      }
                                    }).map((vendor, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{vendor.name}</TableCell>
                                        <TableCell>{vendor.address}</TableCell>
                                        <TableCell>{vendor.phone}</TableCell>
                                        <TableCell>{vendor.transport}</TableCell>
                                        <TableCell>
                                           {moment(vendor?.createdAt).fromNow()}
                                       </TableCell>
                                        </TableRow>
                                   ))
                                  }
                                </TableBody>
                              </Table>
                            </div>
                          )}
                      </div>
                      <div className="mb-4">
                      <div className="mt-4">
                        <form>
                           <div className="relative">
                           <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                           <svg
                           className="h-6 w-6 text-gray-300"
                           xmlns="http://www.w3.org/2000/svg"
                           fill="none"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           >
                           <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                          </svg>
                          </span>
                         <input
                           type="text"
                           className="pl-10 pr-3 py-2 border rounded-md border-gray-200 focus:border-blue-500 focus:outline-none w-1/4"
                           placeholder="Search for driver by location..."
                           value={searchPartner}
                           onChange={(e) => setSearchPartner(e.target.value)}                          />
                        </div>
                       </form>
                      </div>
                        <div className="py-2">
                         <div className="flex justify-between">
                          <p className="text-md font-bold">Drivers</p>
                          </div>
                        </div>
                          {partners.length > 0 && (
                           <div className="border border-slate-100 rounded-md">
                             <Table>
                             <TableCaption>Driver Data</TableCaption>
                              <TableHeader>
                                <TableRow>
                                   <TableHead>Name</TableHead>
                                   <TableHead>Address</TableHead>
                                   <TableHead>Phone</TableHead>
                                   <TableHead>Email</TableHead>
                                   <TableHead>Transport</TableHead>
                                   <TableHead>Date</TableHead>
                                   </TableRow>
                                   </TableHeader>
                                <TableBody>
                                  {
                                    partners
                                    .filter((partner) => {
                                      if (!searchPartner) {
                                        return true;
                                      } else if (
                                        partner.location &&
                                        partner.location.toLowerCase().includes(searchPartner.toLowerCase())
                                      ) {
                                        return true;
                                      }
                                      return false;
                                    })
                                    .map((partner, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{partner.fullname || ''}</TableCell>
                                        <TableCell>{partner.location || ''}</TableCell>
                                        <TableCell>{partner.phone || ''}</TableCell>
                                        <TableCell>{partner.email || ''}</TableCell>
                                        <TableCell>{partner.transport || ''}</TableCell>
                                        <TableCell>
                                          {moment(partner?.createdAt).fromNow() || ''}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  }
                                </TableBody>
                              </Table>
                            </div>
                          )}
                      </div>
                      <div className="py-4 flex gap-4 lg:flex-row flex-col">
                        {/* // display yoocard subscriptions */}
                        <div className="mb-4 lg:w-3/5 w-full pr-4 border-r-2 border-r-slate-100">
                          <div className="py-2">
                            <div className="flex justify-between">
                              <p className="text-md font-bold">
                                YooCard Subscriptions
                              </p>
                              <div>
                                <Link href={"/subscriptions"}>
                                  <Button type={"button"}>View All</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                          {Dashboard?.Subscriptions && (
                            <div className="border border-slate-100 rounded-md">
                              <Table>
                                <TableCaption>New Orders</TableCaption>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>firstname</TableHead>
                                    <TableHead>lastname</TableHead>
                                    <TableHead>Cards</TableHead>
                                    <TableHead>Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Dashboard?.Subscriptions &&
                                    [
                                      ...Dashboard?.Subscriptions
                                        ?.subscriptions,
                                    ].map((subscription, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {subscription?.user?.firstname}
                                        </TableCell>
                                        <TableCell>
                                          {subscription?.user?.lastname}
                                        </TableCell>
                                        <TableCell>
                                          {subscription &&
                                            subscription?.cards?.length > 0 &&
                                            subscription?.cards.map(
                                              (card, index) => (
                                                <p key={index}>{card.card}</p>
                                              )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                          {moment(
                                            subscription?.createdAt
                                          ).fromNow()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                         
                        {/* // display newsletter subscriptions */}
                        <div className="mb-4 lg:w-2/5 w-full">
                          <div className="py-2">
                            <div className="flex justify-between">
                              <p className="text-md font-bold">
                                Newsletter Subscriptions
                              </p>
                              <div>
                                <Link href={"/newsletters"}>
                                  <Button type={"button"}>View All</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                          {Dashboard?.Newsletters && (
                            <div className="border border-slate-100 rounded-md">
                              <Table>
                                <TableCaption>Newsletters</TableCaption>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>email</TableHead>
                                    <TableHead>Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Dashboard?.Newsletters &&
                                    [...Dashboard?.Newsletters].map(
                                      (newsletter, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {newsletter?.email}
                                          </TableCell>

                                          <TableCell>
                                            {moment(
                                              newsletter?.createdAt
                                            ).fromNow()}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* // display data for schedules */}
                      <div className="mb-4 w-full pr-4 border-r-2 border-r-slate-100">
                        <div className="py-2">
                          <div className="flex justify-between">
                            <p className="text-md font-bold">Schedules</p>
                            <div>
                              <Link href={"/schedules"}>
                                <Button type={"button"}>View All</Button>
                              </Link>
                            </div>
                          </div>
                        </div>

                        {Dashboard?.Schedules && (
                          <div className="border border-slate-100 rounded-md">
                            <Table>
                              <TableCaption>Users' Schedules</TableCaption>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Schedule For</TableHead>
                                  <TableHead>Schedule Days</TableHead>
                                  <TableHead>Schedule Time</TableHead>
                                  <TableHead>Products</TableHead>
                                  <TableHead>Repeat Schedule</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>

                              <TableBody>
                                {Dashboard?.Schedules &&
                                  [...Dashboard?.Schedules?.schedules].map(
                                    (schedule, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {`${schedule.user.firstname} ${schedule.user.lastname}`}
                                        </TableCell>
                                        <TableCell>
                                          {schedule.scheduleFor}
                                        </TableCell>
                                        <TableCell>
                                          {schedule.scheduleDays.map((day) => (
                                            <p key={day} className="capitalize">
                                              {day}
                                            </p>
                                          ))}
                                        </TableCell>

                                        <TableCell>
                                          {schedule.scheduleTime}
                                        </TableCell>
                                        <TableCell>
                                          {schedule.scheduleFor == "appointment"
                                            ? schedule.products.map(
                                                (product, index) => (
                                                  <p
                                                    className="capitalize"
                                                    key={index}
                                                  >
                                                    {product.appointmentType}{" "}
                                                    Appointment
                                                  </p>
                                                )
                                              )
                                            : schedule.products.map(
                                                (product, index) => (
                                                  <p key={index}>
                                                    {product.name}
                                                  </p>
                                                )
                                              )}
                                        </TableCell>
                                        <TableCell>
                                          {schedule.repeatSchedule
                                            ? "Yes"
                                            : "No"}
                                        </TableCell>
                                        <TableCell>
                                          {moment(
                                            schedule?.createdAt
                                          ).fromNow()}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}