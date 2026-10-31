export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type Paginated<T> = {
  data: T[];
  links: Record<string, string | null>;
  meta: PaginationMeta;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export type PaymentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "processing"
  | "succeeded"
  | "failed";

export type Payment = {
  id: number;
  order_id: number;
  order_reference?: string | null;
  gateway: string;
  stripe_payment_intent_id: string;
  stripe_client_secret: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string | null;
};

export type Order = {
  id: number;
  reference: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  items: OrderItem[];
  payment: Payment | null;
  created_at: string | null;
  updated_at: string | null;
};
