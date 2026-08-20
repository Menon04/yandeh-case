import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
