import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as productService from "../services/productService.js";

const router = Router();

const FIXED_SUPPLIER_ID = "22222222-2222-4222-8222-222222222222";

const priceTierSchema = z.object({
  minQty: z.number().int().min(1),
  maxQty: z.number().int().min(1).nullable(),
  price: z.number().positive(),
});

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  priceTiers: z.array(priceTierSchema).min(1),
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.listProducts(FIXED_SUPPLIER_ID);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProduct(req.params.id as string);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productService.createProduct(FIXED_SUPPLIER_ID, input);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id as string, input);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productService.deleteProduct(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
