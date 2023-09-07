"use client";

import Navbar from "@/components/Navbar";
import Sidenav from "@/components/Sidenav";
import { useDashboardDataMutation } from "@Slices/userApiSlice";
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

export default function Home() {
  const [Dashboard, setDashboard] = useState([]);

  const [fetchDashboardData] = useDashboardDataMutation();

  const handleDataFetch = async () => {
    const res = await fetchDashboardData().unwrap();

    console.log({ res });

    if (res?.status == "Success") {
      setDashboard(res?.data);
    }
  };

  useEffect(() => {
    handleDataFetch();
  }, []);

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
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...Dashboard?.PendingOrders?.orders].map(
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
                                      </TableRow>
                                    )
                                  )}
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
