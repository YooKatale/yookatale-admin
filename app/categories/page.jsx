"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, Grid, GridItem, Heading, Text, Input, Stack, useToast } from "@chakra-ui/react";
import { PlusIcon, Trash2 } from "lucide-react";
import { useCategoriesGetMutation, useCategoryCreateMutation } from "@Slices/categoryApiSlice";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fetchCategories] = useCategoriesGetMutation();
  const [createCategory] = useCategoryCreateMutation();
  const toast = useToast();

  const handleFetchCategories = async () => {
    try {
      const res = await fetchCategories().unwrap();
      if (res?.success && res?.categories) {
        setCategories(res.categories);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    handleFetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await createCategory({ name: newCategoryName }).unwrap();
      if (res?.success) {
        toast({
          title: "Success",
          description: "Category added successfully",
          status: "success",
          duration: 3000,
        });
        setNewCategoryName("");
        handleFetchCategories();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to add category",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    const defaultCategories = [
      "Bulk Products",
      "Popular Products",
      "Discover Products",
      "Promotional Products",
      "Recommended Products",
      "Fruits",
      "Meats",
      "Dairy",
      "Vegetables",
      "Fats & Oils",
      "Roughages",
      "Root Tubers",
      "Grains & Flour",
      "Spices & Herbs",
      "Juice",
      "Cuisines",
      "Breakfast",
      "Lunch Meals",
      "Supper Meals",
      "Supplements"
    ];

    setIsLoading(true);
    let added = 0;
    let failed = 0;

    for (const categoryName of defaultCategories) {
      try {
        await createCategory({ name: categoryName }).unwrap();
        added++;
      } catch (error) {
        failed++;
      }
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    toast({
      title: "Bulk Add Complete",
      description: `${added} categories added, ${failed} failed (may already exist)`,
      status: "success",
      duration: 5000,
    });

    setIsLoading(false);
    handleFetchCategories();
  };

  return (
    <Flex minH={'100vh'} style={{ marginTop: '4em' }}>
      <Stack mx={'auto'} width={'100%'} py={4} px={1}>
        <div className="p-2 flex justify-between" style={{
          backgroundColor: 'white',
          padding: 8,
        }}>
          <div className="flex" style={{ padding: 10 }}>
            <Heading size={'lg'} style={{ fontSize: 20, fontWeight: '500' }}>
              Category Management
            </Heading>
          </div>
        </div>

        {/* Add New Category Form */}
        <Box bg="white" p={6} borderRadius="md" shadow="sm">
          <Heading size="md" mb={4}>Add New Category</Heading>
          <form onSubmit={handleAddCategory}>
            <Flex gap={2}>
              <Input
                placeholder="Category name (e.g., Organic Foods)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                size="md"
              />
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                leftIcon={<PlusIcon size={16} />}
              >
                Add Category
              </Button>
            </Flex>
          </form>

          <Box mt={4}>
            <Button
              onClick={handleBulkAdd}
              colorScheme="green"
              variant="outline"
              isLoading={isLoading}
              size="sm"
            >
              Add All Default Categories (Bulk)
            </Button>
            <Text fontSize="xs" color="gray.500" mt={1}>
              This will add all 20 default categories at once
            </Text>
          </Box>
        </Box>

        {/* Categories List */}
        <Box bg="white" p={6} borderRadius="md" shadow="sm" mt={4}>
          <Heading size="md" mb={4}>
            Existing Categories ({categories.length})
          </Heading>
          
          {categories.length > 0 ? (
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={3}
            >
              {categories.map((category) => (
                <GridItem key={category._id}>
                  <Box
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    _hover={{ borderColor: 'blue.400', shadow: 'sm' }}
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" fontWeight="medium">
                        {category.name}
                      </Text>
                      {/* Add delete functionality later if needed */}
                    </Flex>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box py={8} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                No categories yet. Add your first category above!
              </Text>
            </Box>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default Categories;

