import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as orderService from "../services/orderService.js";

const router = Router();

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  buyer_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"];
    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      return res.status(400).json({
        error: "Header Idempotency-Key é obrigatório",
      });
    }

    const input = createOrderSchema.parse(req.body);

    const result = await orderService.createOrder({
      buyerId: input.buyer_id,
      supplierId: input.supplier_id,
      items: input.items.map((i) => ({
        productId: i.product_id,
        quantity: i.quantity,
      })),
      idempotencyKey,
    });

    res.status(result.isNew ? 201 : 200).json(result.order);
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
