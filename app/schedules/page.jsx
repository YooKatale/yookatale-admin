"use client";

import { useFetchSchedulesMutation } from "@Slices/schedulesApi";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
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
import { useToast } from "@components/ui/use-toast";
import { Loader2, Loader2Icon } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Schedule = () => {
  const [ScheduleData, setScheduleData] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [fetchSchedules] = useFetchSchedulesMutation();

  const { toast } = useToast();
  const router = useRouter();

  const handleDataFetch = async () => {
    const res = await fetchSchedules("pending").unwrap();

    if (res?.status == "Success") {
      setScheduleData(res?.data);
    }
  };

  const handleScheduleApprove = async (ID) => {
    try {
      const res = await approveSchedule(ID).unwrap();

      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));

      if (res?.status == "Success") {
        toast({
          title: "Success",
          description: `Schedule approved`,
        });

        await handleDataFetch();
      }
    } catch (err) {
      // set loading to be false
      setLoading((prevState) => (prevState ? false : true));

      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message
          ? err.data?.message
          : err.data || err.error,
      });
    }
  };

  useEffect(() => {
    handleDataFetch();
  }, []);
  return (
    <>
      <main className="max-w-full">
        <div className="flex w-full max-h-screen">
          <Sidenav marginTop={true} />
          <Navbar />
          <div className="flex flex-col lg:flex-row lg:w-full pt-12 w-[140%]">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              <div className="w-full h-full">
                {/* ------------------- main content here
            ---------------------------------------------------
            */}
                <div className="px-2 py-4">
                  {/* <div className="py-2 border-b-2 border-slate-100 flex">
                    <div className="mr-2">
                      <Button className={"text-md"} type={"button"}>
                        YooCards
                      </Button>
                    </div>
                  </div> */}

                  <div className="py-4 px-2">
                    {/* <div className="flex pt-4">
                      <div className="mr-2">
                        <Button className={"text-md"} type={"button"}>
                          Pending
                        </Button>
                      </div>
                    </div> */}

                    <div className="pt-2 flex justify-between">
                      <div>
                        <p className="text-lg font-bold">Users' Schedules</p>
                      </div>

                      <div></div>
                    </div>

                    <div className="pt-2 pr-4 pb-4 pl-2 max-h-96 overflow-x-hidden overflow-y-auto">
                      {ScheduleData && (
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
                              {ScheduleData.length > 0 &&
                                ScheduleData.map((schedule, index) => (
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
                                                {product.name}{" "}
                                                {`(${product.quantity} units)`}
                                              </p>
                                            )
                                          )}
                                    </TableCell>
                                    <TableCell>
                                      {schedule.repeatSchedule ? "Yes" : "No"}
                                    </TableCell>
                                    <TableCell>
                                      {moment(schedule?.createdAt).fromNow()}
                                    </TableCell>
                                  </TableRow>
                                ))}
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
      </main>
    </>
  );
};

export default Schedule;
