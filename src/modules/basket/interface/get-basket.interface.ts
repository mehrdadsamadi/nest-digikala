import { DiscountType } from '../../discount/type.enum';

export interface ReturnProduct {
  id: number;
  slug: string;
  title: string;
  active_discount: boolean;
  discount: number;
  price: number;
  count: number;
  size?: string;
  sizeId?: number;
  color_name?: string;
  color_code?: string;
  colorId?: number;
}

export interface ReturnDiscount {
  percent: number;
  amount: number;
  code: string;
  type: DiscountType;
  productId: number;
}
