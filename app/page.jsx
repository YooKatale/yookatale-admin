import Navbar from "@/components/Navbar";
import Sidenav from "@/components/Sidenav";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <main className="max-w-full">
        <div className="flex w-full max-h-screen">
          <Sidenav />
          <Navbar />
          <div className="flex w-full pt-12">
            <div className="w-1/5"></div>
            <div className="w-4/5 pt-4">
              <div className="w-4/5 h-screen max-h-screen overflow-x-hidden overflow-y-auto">
                {/* ------------------- main content here
            ---------------------------------------------------
            */}
                <div className="px-2 py-4">
                  <div className="p-2">
                    <p className="text-xl">Dashboard</p>
                  </div>

                  <div className="py-2">
                    <div className="grid grid-cols-4">
                      <div className="border border-slate-100 rounded-sm p-2 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          200
                        </h3>
                        <p className="text-center my-2 text-xl">Products</p>
                      </div>
                      <div className="border border-slate-100 rounded-sm p-2 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          5
                        </h3>
                        <p className="text-center my-2 text-xl">Customers</p>
                      </div>
                      <div className="border border-slate-100 rounded-sm p-2 mx-2">
                        <h3 className="text-2xl text-center text-gray-400 font-extrabold">
                          12
                        </h3>
                        <p className="text-center my-2 text-xl">
                          Pending Orders
                        </p>
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
