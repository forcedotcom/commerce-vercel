export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<SfdcCart, 'lines'> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = SfdcCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<SfdcProduct, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type SEO = {
  title: string;
  description: string;
};

export type SfdcCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type SfdcCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};

export type SfdcProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type SfdcCartOperation = {
  data: {
    cart: SfdcCart;
  };
  variables: {
    cartId: string;
  };
};

export type SfdcCreateCartOperation = {
  data: { cartCreate: { cart: SfdcCart } };
};

export type SfdcAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: SfdcCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type SfdcRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: SfdcCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type SfdcUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: SfdcCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type SfdcCollectionOperation = {
  data: {
    collection: SfdcCollection;
  };
  variables: {
    handle: string;
  };
};

export type SfdcCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<SfdcProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type SfdcCollectionsOperation = {
  data: {
    collections: Connection<SfdcCollection>;
  };
};

export type SfdcMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type SfdcPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type SfdcPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type SfdcProductOperation = {
  data: { product: SfdcProduct };
  variables: {
    handle: string;
  };
};

export type SfdcProductRecommendationsOperation = {
  data: {
    productRecommendations: SfdcProduct[];
  };
  variables: {
    productId: string;
  };
};

export type SfdcProductsOperation = {
  data: {
    products: Connection<SfdcProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type Category = {
  parentCategoryName?: string;
  parentCategoryId?: string;
  categoryName: string;
  categoryId: string;
  numberOfProducts?: number;
  path?: string;
  updatedAt?: string;
}

export type PricingApiResponse = {
  unitPrice: string,
  listPrice: string
  currencyIsoCode: string,
};

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const defaultCookieOptions: CookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax'
};
