"use client";

import { useEffect, useState } from "react";
import {
  Box, Flex, Heading, Text, SimpleGrid, Input, InputGroup,
  InputLeftElement, Select, HStack, VStack, Badge, Button,
  Skeleton, Icon, Stat, StatLabel, StatNumber,
} from "@chakra-ui/react";
import { PlusIcon, Search, Package, Tag, Percent, RefreshCw } from "lucide-react";
import { useProductsGetMutation } from "@Slices/productApiSlice";
import { useCategoriesGetMutation } from "@Slices/categoryApiSlice";
import ProductCard from "@components/ProductCard";
import AddProduct from "@components/modals/AddProduct";

const PRIMARY = "#185f2d";

function StatCard({ icon: IconComp, label, value, color = "gray.800" }) {
  return (
    <Box bg="white" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100" boxShadow="0 2px 8px rgba(0,0,0,0.05)">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="gray.400" mb={1}>{label}</Text>
          <Text fontSize="2xl" fontWeight="800" color={color}>{value}</Text>
        </Box>
        <Box p={3} borderRadius="xl" bg="gray.50">
          <IconComp size={20} color="#9ca3af" />
        </Box>
      </Flex>
    </Box>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const [fetchProducts] = useProductsGetMutation();
  const [fetchCategories] = useCategoriesGetMutation();

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([fetchProducts().unwrap(), fetchCategories().unwrap()]);
      if (pRes?.status === "Success") setProducts(pRes.data);
      if (cRes?.success && cRes?.categories) setCategories(cRes.categories);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const withDiscount = products.filter((p) => Number(p.discountPercentage || 0) > 0).length;
  const categoryNames = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <Box maxW="full" pb={10}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color="gray.800" fontWeight="800">Products</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>Manage your product catalogue</Text>
        </Box>
        <HStack spacing={2}>
          <Button leftIcon={<RefreshCw size={14} />} variant="outline" size="sm" borderRadius="xl"
            borderColor="gray.200" color="gray.600" onClick={load} isLoading={loading}>
            Refresh
          </Button>
          <Button leftIcon={<PlusIcon size={14} />} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }}
            size="sm" borderRadius="xl" px={5} fontWeight="700" onClick={() => setShowAdd(true)}>
            Add Product
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={6}>
        <StatCard icon={Package} label="Total Products" value={products.length} />
        <StatCard icon={Percent} label="On Discount" value={withDiscount} color="orange.500" />
        <StatCard icon={Tag} label="Categories" value={categoryNames.length} color={PRIMARY} />
      </SimpleGrid>

      {/* Search + Filter */}
      <Flex gap={3} mb={6} flexWrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none" h="40px">
            <Search size={14} color="#9ca3af" />
          </InputLeftElement>
          <Input h="40px" pl="2.5rem" fontSize="sm" bg="white" borderRadius="xl"
            border="1px solid" borderColor="gray.200" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }} />
        </InputGroup>
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          maxW="200px" h="40px" fontSize="sm" bg="white" borderRadius="xl"
          border="1px solid" borderColor="gray.200" _focus={{ borderColor: PRIMARY }}>
          <option value="all">All Categories</option>
          {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        {(search || filterCategory !== "all") && (
          <Text fontSize="xs" color="gray.400" alignSelf="center">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Text>
        )}
      </Flex>

      {/* Products Grid */}
      {loading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
          {[...Array(10)].map((_, i) => (
            <Box key={i} borderRadius="xl" overflow="hidden" bg="white" border="1px solid" borderColor="gray.100">
              <Skeleton h="160px" />
              <Box p={3}><Skeleton h="14px" mb={2} /><Skeleton h="14px" w="60%" mb={3} /><Skeleton h="28px" /></Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={20} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Box mb={3} display="flex" justifyContent="center"><Package size={40} color="#CBD5E0" /></Box>
          <Heading size="sm" color="gray.600" mb={2}>{search || filterCategory !== "all" ? "No products match your search" : "No products yet"}</Heading>
          <Text color="gray.400" fontSize="sm" mb={4}>{!search && filterCategory === "all" && "Add your first product to get started"}</Text>
          {!search && filterCategory === "all" && (
            <Button leftIcon={<PlusIcon size={14} />} bg={PRIMARY} color="white" _hover={{ bg: "#1f793a" }} size="sm" borderRadius="xl" onClick={() => setShowAdd(true)}>
              Add Product
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} handleProductFetch={load} />
          ))}
        </SimpleGrid>
      )}

      {/* Add Product modal */}
      {showAdd && <AddProduct closeModal={() => { setShowAdd(false); load(); }} />}
    </Box>
  );
}
