"use client";

import UpdateAccount from "@components/modals/UpdateAccount";
import ChangePassword from "@components/modals/ChangePassword";
import { Button } from "@components/ui/button";
import {
  User2, Mail, Phone, UserCircle, Shield, KeyRound, Edit, Users, Settings2, RefreshCw,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetAppSettingsQuery, useUpdateAppSettingsMutation } from "@Slices/ordersDeliveryApiSlice";
import {
  Box, Card, CardBody, CardHeader, VStack, HStack, Text, Heading, Switch, FormControl,
  FormLabel, NumberInput, NumberInputField, Spinner, Center, useToast, Badge, Icon,
} from "@chakra-ui/react";
import { CheckCircle, Save } from "lucide-react";

const Settings = () => {
  const { userInfo }  = useSelector((state) => state.auth);
  const [modalState, setModalState] = useState(false);
  const [modal, setModal]           = useState("");
  const toast = useToast();

  const { data: serverSettings, isLoading: loadingSettings, refetch } = useGetAppSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateAppSettingsMutation();

  const [localSettings, setLocalSettings] = useState(null);

  useEffect(() => {
    if (serverSettings && !localSettings) {
      setLocalSettings({
        autoConfirmPaidOrders:   serverSettings.autoConfirmPaidOrders   ?? true,
        autoAssignDriver:        serverSettings.autoAssignDriver        ?? true,
        codRequiresApproval:     serverSettings.codRequiresApproval     ?? false,
        driverSearchRadiusKm:    serverSettings.driverSearchRadiusKm    ?? 10,
        driverExpandedRadiusKm:  serverSettings.driverExpandedRadiusKm  ?? 25,
        driverAcceptTimeoutSecs: serverSettings.driverAcceptTimeoutSecs ?? 30,
      });
    }
  }, [serverSettings, localSettings]);

  const handleModal = (m) => {
    setModalState((p) => !p);
    setModal(m);
  };

  const toggleField = (key) =>
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setNumber = (key, val) =>
    setLocalSettings((prev) => ({ ...prev, [key]: Number(val) || 0 }));

  const handleSave = async () => {
    try {
      await updateSettings(localSettings).unwrap();
      toast({ title: "Settings saved", status: "success", duration: 3000 });
      refetch();
    } catch (e) {
      toast({ title: "Failed to save", description: e?.data?.message || "Error", status: "error", duration: 4000 });
    }
  };

  return (
    <>
      {modalState && modal === "updateAccount" && <UpdateAccount closeModal={setModalState} />}
      {modalState && modal === "changePassword" && <ChangePassword closeModal={setModalState} />}

      <Box>
        <VStack align="stretch" spacing={6}>

          {/* App Settings */}
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Icon as={Settings2} boxSize={7} color="green.600" />
              <Heading size="lg">Platform Settings</Heading>
            </HStack>
            <Button
              onClick={handleSave}
              disabled={saving || !localSettings}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? <Spinner size="xs" mr={2} /> : <Save size={15} className="mr-2" />}
              Save Settings
            </Button>
          </HStack>

          {loadingSettings || !localSettings ? (
            <Center py={8}><Spinner color="green.500" /></Center>
          ) : (
            <Card>
              <CardHeader pb={2}>
                <HStack spacing={2}>
                  <Icon as={Settings2} color="green.500" />
                  <Text fontWeight="700">Automation & Order Settings</Text>
                </HStack>
                {serverSettings?.updatedAt && (
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    Last updated: {new Date(serverSettings.updatedAt).toLocaleString()}
                  </Text>
                )}
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={5} divider={<Box h="1px" bg="gray.100" />}>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel mb={0} fontWeight="600" fontSize="sm">Auto-confirm paid orders</FormLabel>
                      <Text fontSize="xs" color="gray.500">Automatically confirm orders once payment is verified</Text>
                    </Box>
                    <Switch
                      colorScheme="green"
                      isChecked={localSettings.autoConfirmPaidOrders}
                      onChange={() => toggleField("autoConfirmPaidOrders")}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel mb={0} fontWeight="600" fontSize="sm">Auto-assign driver</FormLabel>
                      <Text fontSize="xs" color="gray.500">Automatically find and assign the nearest available driver</Text>
                    </Box>
                    <Switch
                      colorScheme="green"
                      isChecked={localSettings.autoAssignDriver}
                      onChange={() => toggleField("autoAssignDriver")}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel mb={0} fontWeight="600" fontSize="sm">COD requires approval</FormLabel>
                      <Text fontSize="xs" color="gray.500">Cash-on-delivery orders need manual admin approval before dispatch</Text>
                    </Box>
                    <Switch
                      colorScheme="orange"
                      isChecked={localSettings.codRequiresApproval}
                      onChange={() => toggleField("codRequiresApproval")}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm">Driver search radius (km)</FormLabel>
                    <Text fontSize="xs" color="gray.500" mb={2}>Initial radius to search for nearby drivers</Text>
                    <NumberInput
                      size="sm"
                      min={1}
                      max={100}
                      value={localSettings.driverSearchRadiusKm}
                      onChange={(val) => setNumber("driverSearchRadiusKm", val)}
                      maxW="160px"
                    >
                      <NumberInputField borderRadius="lg" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm">Expanded search radius (km)</FormLabel>
                    <Text fontSize="xs" color="gray.500" mb={2}>Fallback radius if no driver found in initial search</Text>
                    <NumberInput
                      size="sm"
                      min={1}
                      max={200}
                      value={localSettings.driverExpandedRadiusKm}
                      onChange={(val) => setNumber("driverExpandedRadiusKm", val)}
                      maxW="160px"
                    >
                      <NumberInputField borderRadius="lg" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm">Driver accept timeout (seconds)</FormLabel>
                    <Text fontSize="xs" color="gray.500" mb={2}>Time driver has to accept an assigned order before reassignment</Text>
                    <NumberInput
                      size="sm"
                      min={10}
                      max={300}
                      value={localSettings.driverAcceptTimeoutSecs}
                      onChange={(val) => setNumber("driverAcceptTimeoutSecs", val)}
                      maxW="160px"
                    >
                      <NumberInputField borderRadius="lg" />
                    </NumberInput>
                  </FormControl>

                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Account Settings (preserved) */}
          <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
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
                <Button onClick={() => handleModal("changePassword")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
                  <KeyRound size={18} className="mr-2" />Change Password
                </Button>
                <Button onClick={() => handleModal("updateAccount")} className="bg-green-500 hover:bg-green-600 text-white shadow-sm">
                  <Edit size={18} className="mr-2" />Update Details
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div className="bg-blue-100 rounded-lg p-2"><UserCircle size={20} className="text-blue-600" /></div>
                  <h3 className="font-semibold text-gray-800">Personal Info</h3>
                </div>
                {[
                  { label: "First Name", value: userInfo?.firstname },
                  { label: "Last Name",  value: userInfo?.lastname },
                  { label: "Gender",     value: userInfo?.gender },
                ].map((r) => (
                  <div key={r.label} className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{r.label}</p>
                    <p className="mt-0.5 text-base font-semibold text-gray-800">{r.value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <div className="bg-purple-100 rounded-lg p-2"><Mail size={20} className="text-purple-600" /></div>
                  <h3 className="font-semibold text-gray-800">Contact</h3>
                </div>
                {[
                  { Icon: Mail,  label: "Email",  value: userInfo?.email },
                  { Icon: Phone, label: "Phone",  value: userInfo?.phone },
                ].map((r) => (
                  <div key={r.label} className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><r.Icon size={11} />{r.label}</p>
                    <p className="mt-0.5 text-base font-semibold text-gray-800 break-all">{r.value || "—"}</p>
                  </div>
                ))}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Type</p>
                  <p className="mt-0.5 text-base font-semibold text-gray-800 capitalize">{userInfo?.account || "—"}</p>
                </div>
              </div>
            </div>
          </div>

        </VStack>
      </Box>
    </>
  );
};

export default Settings;
