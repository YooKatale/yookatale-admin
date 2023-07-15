// import React from 'react'

import Image from "next/image";
import Link from "next/link";

const ProductCard = ({ product }) => {
  return (
    <>
      <div className="border border-slate-100 rounded-md mx-2 my-2">
        <div className="flex justify-center items-center">
          <div className="m-auto text-center h-40 py-2">
            <Link href={`/product?id=${product._id}`}>
              <img
                src={product?.images[0]}
                alt="image"
                className="object-contain w-auto h-full"
              />
            </Link>
            {/* <Image
              src={`${product?.images}`}
              width={130}
              height={120}
              alt="image"
              className="object-contain w-full h-auto"
            /> */}
          </div>
        </div>
        <div className="pt-2 pb-4">
          <p className="text-lg text-center font-extralight">{product?.name}</p>
          <h3 className="mx-2 text-lg text-center font-bold">
            UGX {product?.price}
          </h3>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
