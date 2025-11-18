"use client";

import UpdateAccount from "@components/modals/UpdateAccount";
import ChangePassword from "@components/modals/ChangePassword";
import { Button } from "@components/ui/button";
import { 
  User2, 
  Mail, 
  Phone, 
  UserCircle, 
  Shield, 
  KeyRound, 
  Edit,
  Users
} from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");

  // function to set modal data
  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  return (
    <>
      {/* Modal Forms */}
      {modalState && modal === "updateAccount" && (
        <UpdateAccount closeModal={setModalState} />
      )}
      {modalState && modal === "changePassword" && (
        <ChangePassword closeModal={setModalState} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your profile and security settings</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg">
                    <User2 size={48} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-4 border-white">
                    <Shield size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {`${userInfo?.firstname || ""} ${userInfo?.lastname || ""}`}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Users size={14} className="mr-1" />
                      {userInfo?.account?.toUpperCase() || "USER"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleModal("changePassword")}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                >
                  <KeyRound size={18} className="mr-2" />
                  Change Password
                </Button>
                <Button
                  onClick={() => handleModal("updateAccount")}
                  className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                >
                  <Edit size={18} className="mr-2" />
                  Update Details
                </Button>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="bg-blue-100 rounded-lg p-2">
                  <UserCircle size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="space-y-5">
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    First Name
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {userInfo?.firstname || "-"}
                  </p>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Last Name
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {userInfo?.lastname || "-"}
                  </p>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Gender
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 capitalize group-hover:text-green-600 transition-colors">
                    {userInfo?.gender || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="bg-purple-100 rounded-lg p-2">
                  <Mail size={24} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Contact Information</h3>
              </div>
              
              <div className="space-y-5">
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Mail size={14} />
                    Email Address
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 break-all group-hover:text-green-600 transition-colors">
                    {userInfo?.email || "-"}
                  </p>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {userInfo?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow lg:col-span-2">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="bg-green-100 rounded-lg p-2">
                  <Shield size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Account Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Username
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {userInfo?.username || "-"}
                  </p>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Account Type
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-800 capitalize group-hover:text-green-600 transition-colors">
                    {userInfo?.account || "-"}
                  </p>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    User ID
                  </label>
                  <p className="mt-1 text-sm font-mono text-gray-600 truncate group-hover:text-green-600 transition-colors" title={userInfo?._id}>
                    {userInfo?._id || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 rounded-lg p-2 mt-1">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Security Tip</h4>
                <p className="text-sm text-gray-600">
                  For your security, we recommend changing your password regularly and using a strong, 
                  unique password that combines letters, numbers, and special characters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
