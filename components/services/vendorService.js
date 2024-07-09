import axios from 'axios';

export const getVendors = async () => {
  const response = await axios.get('/api/vendors');
  return response.data;
};

export const activateVendor = async (vendorId) => {
  await axios.post(`/api/vendors/activate/${vendorId}`);
};
