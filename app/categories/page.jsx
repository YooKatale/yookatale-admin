"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, Grid, GridItem, Heading, Text, Input, Stack, useToast, useDisclosure } from "@chakra-ui/react";
import { PlusIcon, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useCategoriesGetMutation, useCategoryCreateMutation, useCategoryUpdateMutation, useCategoryDeleteMutation } from "@Slices/categoryApiSlice";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [fetchCategories] = useCategoriesGetMutation();
  const [createCategory] = useCategoryCreateMutation();
  const [updateCategory] = useCategoryUpdateMutation();
  const [deleteCategory] = useCategoryDeleteMutation();
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editName.trim()) return;
    setIsLoading(true);
    try {
      const res = await updateCategory({ id: editingCategory._id, name: editName.trim() }).unwrap();
      if (res?.success) {
        toast({ title: "Success", description: "Category updated", status: "success", duration: 3000 });
        setEditingCategory(null);
        setEditName("");
        handleFetchCategories();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update category",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteTarget(category);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await deleteCategory(deleteTarget._id).unwrap();
      if (res?.success) {
        toast({ title: "Success", description: "Category deleted", status: "success", duration: 3000 });
        setDeleteTarget(null);
        onDeleteClose();
        handleFetchCategories();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete category",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
                    _hover={{ borderColor: "blue.400", shadow: "sm" }}
                  >
                    {editingCategory?._id === category._id ? (
                      <Flex gap={2} align="center" wrap="wrap">
                        <Input
                          size="sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          flex="1"
                          minW="120px"
                        />
                        <Button size="sm" colorScheme="blue" onClick={handleSaveEdit} isLoading={isLoading} leftIcon={<Loader2 size={14} />}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(null); setEditName(""); }}>
                          <X size={14} />
                        </Button>
                      </Flex>
                    ) : (
                      <Flex justify="space-between" align="center" gap={2}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {category.name}
                        </Text>
                        <Flex gap={1}>
                          <Button size="xs" variant="ghost" aria-label="Edit" onClick={() => handleEdit(category)}>
                            <Pencil size={14} />
                          </Button>
                          <Button size="xs" variant="ghost" colorScheme="red" aria-label="Delete" onClick={() => handleDeleteClick(category)}>
                            <Trash2 size={14} />
                          </Button>
                        </Flex>
                      </Flex>
                    )}
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

      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose} leastDestructiveRef={undefined}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete category</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} isLoading={isLoading} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default Categories;

