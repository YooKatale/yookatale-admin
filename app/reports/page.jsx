"use client";
import {
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { useAuditlogsgetMutation, useDashboardDataMutation } from "@Slices/userApiSlice";
import React, { useEffect, useState } from 'react';
//   import { useVendorGetMutation } from "@Slices/vendorApiSlice";
// import { usePartnerGetMutation } from "@Slices/partnersApiSlice";
// import { useRouter } from "next/navigation";
import numeral from 'numeral';
//import Chart from 'react-apexcharts'


import PaginatedTable from '@components/ui/PaginatedTable';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false
  });
const ProductCategories = [
    "roughages",
    "fruits",
    "root tubers",
    "vegetables",
    "grains and flour",
    "meats",
    "fats and oils",
    "herbs and spices",
    "juice",
    "meals",
    "popular",
    "topdeals",
    "discover",
    "promotional",
    "recommended",
  ];
  
  const columns = ['user', 'action', 'description', 'risklevel', 'usercategory', 'date'];

 const Reports2 =() => {
    const [Dashboard, setDashboard] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [searchPartner, setSearchPartner] = useState("");

  const [fetchDashboardData] = useDashboardDataMutation();
  const [fetchAuditLogsData] = useAuditlogsgetMutation();
//   const [vendorGet] = useVendorGetMutation();
//   const [partnerGet] = usePartnerGetMutation();
  const [auditlogsData, setAuditLogsData]=useState([])
  const [userregistrations, setUserregistrations] = useState([]);
  
  // const { id } = router.query;

  const months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  
  const currentYear = new Date().getFullYear();
  const seriesChartData = Array(12).fill(0); 
  const ordersChartData = Array(12).fill(0);
  const subscriptionChartData = Array(12).fill(0); 
  const categories = months;
  userregistrations?.forEach((key) => {
    if (key.year === currentYear) {
        // Set the value for the corresponding month
        //seriesChartData[date.getMonth()] = key.count;
        seriesChartData[key.month - 1] = key.count;
      }
    
  });

  const userRegistrationChartData= {
    series: [{
        name: "Users",
        data: seriesChartData
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: `User Signup By Month - ${currentYear}`,
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.3
        },
      },
      xaxis: {
        categories: categories,
      }
    },
  
  
  };

  if (Dashboard?.ordermonthlycounts) {
    Dashboard.ordermonthlycounts.forEach((key) => {
        if (key.year === currentYear) {
            // Set the value for the corresponding month
            ordersChartData[key.month - 1] = key.count;
          }
        
      });
  }

  
  const orderChartData= {
    series: [{
        name: "Orders",
        data: ordersChartData
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: `Platform Orders By Month - ${currentYear}`,
        align: 'center'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.3
        },
      },
      xaxis: {
        categories: categories,
      }
    },
  
  
  };
  
   // Initialize the counts array
const countsArray = ProductCategories.map(() => 0);

// Update counts based on the dashboard data
if (Dashboard?.productCountByCategory) {
  Dashboard.productCountByCategory.forEach(item => {
    const index = ProductCategories.indexOf(item.category);
    if (index !== -1) {
      countsArray[index] = item.count;
    }
  });
}

if (Dashboard?.subscriptioncounts) {
    Dashboard.subscriptioncounts.forEach((key) => {
        if (key.year === currentYear) {
            // Set the value for the corresponding month
            subscriptionChartData[key.month - 1] = key.count;
          }
      });
  }
  const pieData ={
    series: countsArray,
            options: {
              chart: {
                width: 380,
                type: 'pie',
              },
              labels: ProductCategories,
              title: {
                text: 'Products by Category',
                align: 'center'
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },
  }
  const chartData= {
    series: [{
        name: "Subscription",
        data: subscriptionChartData
    }],
    options: {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Subscriptions by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.3
        },
      },
      xaxis: {
        categories: categories,
      }
    },
  
  
  };


  const handleDataFetch = async () => {
    try {
      const res = await fetchDashboardData().unwrap();
     

      if (res?.status === "Success") {
        setDashboard(res?.data);
        setUserregistrations(res?.data.userregistration)
      }
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
    }
  };
  
  const handleAuditLogsFetch = async ()=>{
    try {
        const res = await fetchAuditLogsData().unwrap();
       
        if (res?.status === "Success") {
          setAuditLogsData(res?.logs);
        }
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      }
  }
  useEffect(() => {
    handleDataFetch();
    handleAuditLogsFetch()
    // handleVendorFetch();
    // handlePartnerFetch();
  }, []);

  const sampleData=[]

  auditlogsData?.length && auditlogsData.map((key, index)=>{
    sampleData.push({
        user: key.user,
        action: key.action,
        description: key.description,
        risklevel: key.risklevel,
        usercategory: key.usercategory,
        date: key.createdAt
    })
})
    return (
        <main className="max-w-full">
        <div className="flex w-full">
          <Sidenav />
          <Navbar />
          <div className="flex w-full pt-12">
          
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              {/* ------------------- main content here
            ---------------------------------------------------
            */}
              <div className="p-2">
                    <h1 className="text-xl font-bold mt-1">All time Stats</h1>
                  </div>
              <div className="flex">
              
                <div className="w-3/12 border border-slate-100 p-3 m-2 text-center">
                    <Stat>
                        <StatLabel className="text-xl">Pending Orders</StatLabel>
                        <StatNumber>{Dashboard?.PendingOrders ? Dashboard?.PendingOrders?.count: "___"}</StatNumber>
                        <StatHelpText className="text-l mt-1">Value UGX {Dashboard?.PendingOrders ? numeral(Dashboard?.PendingOrders?.cashvalue).format(','): "___"}</StatHelpText>
                    </Stat>
                </div>
                <div className="w-3/12 border border-slate-100 p-3 m-2 text-center">
                    <Stat>
                        <StatLabel className="text-xl">Completed Orders</StatLabel>
                        <StatNumber>{Dashboard?.CompletedOrders ? Dashboard?.CompletedOrders?.count: "___"}</StatNumber>
                        <StatHelpText>Value UGX {Dashboard?.CompletedOrders ? numeral(Dashboard?.CompletedOrders?.cashvalue).format(','): "___"}</StatHelpText>
                    </Stat>
                </div>
                <div className="w-3/12 border border-slate-100 p-3 m-2 text-center">
                    <Stat>
                        <StatLabel className="text-xl">All Platform Sales</StatLabel>
                        <StatNumber>{Dashboard?.AllTimeOrders ? Dashboard?.AllTimeOrders?.count: "___"}</StatNumber>
                        <StatHelpText>Value UGX {Dashboard?.AllTimeOrders ? numeral(Dashboard?.AllTimeOrders?.allorderscashvalue).format(','): "___"}</StatHelpText>
                    </Stat>
                </div>
                <div className="w-3/12 border border-slate-100 p-3 m-2 text-center">
                    <Stat>
                        <StatLabel className="text-xl">All Platform</StatLabel>
                        <StatLabel className="text-l">Users</StatLabel>
                        <StatNumber>{Dashboard?.Users ? Dashboard?.Users?.count: "___"}</StatNumber>
                    </Stat>
                </div>
              </div>
                <div className="flex">
                    <div className="w-6/12 border border-slate-100 m-2">
                        <Chart options={chartData.options} series={chartData.series} type="bar" height={320} />
                    </div>
                    <div className="w-6/12 border border-slate-100 m-2">
                        <Chart options={pieData.options} series={pieData.series} type="pie" height={320} />
                    </div>
                </div>

                <div className="flex">
                    <div className="w-6/12 border border-slate-100 m-2">
                        <Chart options={userRegistrationChartData.options} series={userRegistrationChartData.series} type="line" height={320} />
                    </div>
                    <div className="w-6/12 border border-slate-100 m-2">
                        <Chart options={orderChartData.options} series={orderChartData.series} type="area" height={320} />
                    </div>
                </div>
                
                <div className="p-6">
                    <h1 className="text-xl font-bold mb-4">System Events</h1>
                    <PaginatedTable
                        data={sampleData}
                        columns={columns}
                        rowsPerPage={5} // Set number of rows per page
                    />
                </div>
            </div>
          </div>
        </div>
      </main>
    )
  }


//export default Reports;


export class Reports extends React.Component {
  render() {
    return (
      <Reports2/>
    )
  }
}

export default Reports