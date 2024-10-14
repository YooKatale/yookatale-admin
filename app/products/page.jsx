"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Sidenav from "@/components/Sidenav";
import AddProduct from "@/components/modals/AddProduct";

import { useProductsGetMutation } from "@Slices/productApiSlice";
import { Box, Button, Flex, Grid, GridItem, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";


//////
// import {
//   GroupingState,
//     IntegratedGrouping,
//    IntegratedFiltering,
//    PagingState,
//   IntegratedPaging,SearchState,SortingState,
//   IntegratedSorting
// } from '@devexpress/dx-react-grid';
// // import { GridExporter } from '@devexpress/dx-react-grid-export';
// import {
//     DragDropProvider,
//     Grid as DxGrid, GroupingPanel,
//     Table,  TableGroupRow,
//     TableHeaderRow, Toolbar,PagingPanel,SearchPanel,
//     ColumnChooser,TableColumnVisibility, ExportPanel 
//   } from '@devexpress/dx-react-grid-material-ui';
const columns= [
  { name: 'id', title: '#' },
  { name: 'name', title: 'Name' },
  { name: 'arabic', title: 'Arabic' },
  { name: 'lugbar', title: 'Lugbar' },
  { name: 'crop_image', title: 'Crop Image' },
  { name: 'action', title: 'Action (Edit/Delete)' },
  
]
const pageSizes= [5,10,20,50,0]
const Products = () => {
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const [Products, setProducts] = useState([]);

  const [fetchProducts] = useProductsGetMutation();

  const handleProductFetch = async () => {
    try {
      const res = await fetchProducts().unwrap();

      if (res.status == "Success") {
        setProducts(res.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    handleProductFetch();
  }, []);


  const handleModal = (modal) => {
    setModalState((prevState) => (prevState ? false : true));
    setModal(modal);
  };

  const closeModalFromCHild=()=>{
    setModalState()
    handleProductFetch();
  }

  const data1 =Products.map((prop, key)=>{ 
    return{
        id: key+1,
        name: prop.name,
        arabic: prop.name,
        lugbar: prop.name,
        crop_image: (<img src={prop.images[0]} alt="image" style={{width: '100px'}}/>),
        action:(
            <div>
           
                  <Button
                      color="success"
                      simple 
                      size="sm"
                      round
                      //onClick={()=>{this.handleEditCrop(prop.id)}}
                      style={{padding: 2}}
                      //className={classes.firstButton}
                      title="Edit"
                    >
                      {/* <EditIcon className={classes.icon} />  */}
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      round simple
                      style={{padding: 0}}
                      //className={classes.firstButton}
                      //onClick={()=>{this.handleDeleteCrop(prop.id)}}
                      //style={{marginRight: 12}} handleDeleteCrop
                      title="Delete crop"
                    >
                      {/* <DeleteForeverIcon className={classes.icon} />  */}
                      Delete
                    </Button>
                    <Button
                      color="info"
                      size="sm"
                      round simple
                      style={{padding: 3}}
                      //className={classes.firstButton}
                      //onClick={()=>{this.handleViewCropManual(prop)}} 
                      //style={{marginRight: 12}} handleDeleteCrop
                      title="View Manual"
                    >
                      {/* <DescriptionIcon className={classes.icon} /> */}
                       Manual
                    </Button>
                    
                  
        </div>
          )
    }
});
  return (
    // <Flex minH={'100vh'} style={{ marginTop: '4em' }}>
    //   <Stack mx={'auto'} width={'100%'} py={4} px={1}>
    
     
    //   {modalState && modal === "addProduct" ? (
    //     <AddProduct closeModal={closeModalFromCHild} />
    //   ) : (
    //     <></>
    //   )}
    //     <div className="p-2 flex justify-between" style={{
    //       backgroundColor: 'white',
    //       padding: 8,
    //     }}>
    //       <div className="flex" style={{ padding: 10 }}>
    //         <Heading size={'lg'} style={{ fontSize: 20, fontWeight: '500' }}>Add new product</Heading>
    //       </div>
    //       <div className="flex justify-end" >
    //         <Button
    //           type='submit'
    //           size="md"
    //           bg={'blue.400'}
    //           color={'white'}
    //           _hover={{
    //             bg: 'blue.500',
    //           }}
    //           onClick={() => handleModal("addProduct")}
    //         >
    //           <PlusIcon size={15} /> New product
    //         </Button>
    //       </div>
    //     </div>
                

    //     <div className="py-4 px-2">
    //       {Products?.length > 0 ? (
    //         <Grid
    //           templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
    //           gap={4}
    //         >
    //           {Products.map((product, index) => (
    //             <GridItem>
    //               <ProductCard key={product._id} product={product} handleProductFetch={handleProductFetch}/>
    //             </GridItem>
    //           ))}
    //         </Grid>
    //       ) : (
    //         <Box py={14} w="full">
    //           <Text fontSize="2xl" textAlign="center">
    //             No products currently
    //           </Text>
    //         </Box>
    //       )}
    //     </div>

        
          
           
    
    // </Stack>

   
    // </Flex>
    <GridItem>
    {/* <DxGrid rows={data1} columns={columns}>
                      <SearchState defaultValue="" />
                      <IntegratedFiltering />
                      <PagingState defaultCurrentPage={0} defaultPageSize={5} />
                      <IntegratedPaging />
                      <SortingState />
                      <IntegratedSorting />
                      <GroupingState />
                      <IntegratedGrouping />
                      <DragDropProvider />
                      <IntegratedSorting />
                      <Table />
                      <TableHeaderRow showSortingControls />
                      <TableColumnVisibility />
                      <Toolbar />
                      <SearchPanel />
                      <PagingPanel pageSizes={pageSizes} />
                      <GroupingPanel showGroupingControls />
                      <TableGroupRow />
                      <ColumnChooser />
                    </DxGrid> */}
    </GridItem>
  );
};

export default Products;
