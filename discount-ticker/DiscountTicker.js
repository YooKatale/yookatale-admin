import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

const DiscountTicker = () => {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    // Fetch current discounts for products in the promotion category from the server.
    const fetchDiscounts = async () => {
      try {
        const response = await fetch("/api/discounts"); // Replace with  API endpoint.
        if (response.ok) {
          const data = await response.json();
          setDiscounts(data.discounts);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      }
    };

    fetchDiscounts();
  }, []);

  return (
    <ChakraProvider>
      <ThemeProvider>
        <div className="discount-ticker">
          <h2>Current discounts:</h2>
          <ul>
            {discounts.map((discount) => (
              <li key={discount.id}>
                {discount.name}: {discount.percentage}% off
              </li>
            ))}
          </ul>
        </div>
      </ThemeProvider>
    </ChakraProvider>
  );
};

export default DiscountTicker;

