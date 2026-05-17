export const orderStatus = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export type OrderStatus = (typeof orderStatus)[number];
