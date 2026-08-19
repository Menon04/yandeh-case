import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as orderService from "../services/orderService.js";

const router = Router();

const FIXED_BUYER_ID = "11111111-1111-4111-8111-111111111111";
const FIXED_SUPPLIER_ID = "22222222-2222-4222-8222-222222222222";

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

    const order = await orderService.createOrder({
      buyerId: FIXED_BUYER_ID,
      supplierId: FIXED_SUPPLIER_ID,
      items: input.items,
      idempotencyKey,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const from = _req.query.from
      ? new Date(_req.query.from as string)
      : undefined;
    const to = _req.query.to ? new Date(_req.query.to as string) : undefined;

    const orders = await orderService.listOrders({
      buyerId: FIXED_BUYER_ID,
      supplierId: FIXED_SUPPLIER_ID,
      from,
      to,
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrder(req.params.id as string);
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
