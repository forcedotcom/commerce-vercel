'use server';

import { getCartIdFromCookie, setCartIdInCookie } from 'app/api/auth/authUtil';
import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from 'lib/sfdc';
import { Cart } from 'lib/sfdc/types';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCookie } from 'lib/server-cookies';

export async function addItem(prevState: any, selectedVariantId: string | undefined) {
  const cartId = await getCartIdFromCookie();

  // if (!cartId || !selectedVariantId) {
  //   return 'Error adding item to cart';
  // }

  try {
    await addToCart(cartId!, { productId: selectedVariantId!, quantity: 1, type: 'Product' });
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  const cartId = await getCartIdFromCookie();

  // if (!cartId) {
  //   return 'Missing cart ID';
  // }

  try {
    const cart = await getCart(cartId!);

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      await removeFromCart(cartId!, lineItem.id);
      revalidateTag(TAGS.cart);
    } else {
      return 'Item not found in cart';
    }
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const cartId = await getCartIdFromCookie();

  // if (!cartId) {
  //   return 'Missing cart ID';
  // }

  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart(cartId!);

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart(cartId!, lineItem.id);
      } else {
        await updateCart(lineItem.id, quantity);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart(cartId!, { productId: merchandiseId, quantity, type: 'Product' });
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return 'Error updating item quantity';
  }
}

export async function redirectToCheckout() {
  const cartId = await getCartIdFromCookie();
  let cart = await getCart(cartId!);
  redirect(cart!.checkoutUrl);
}

export async function createCartAndSetCookie(cart: Cart) {
  try {
    const cartId = await getCookie('cartId');
    if (cartId) {
      return cartId;
    }

    const response = await createCart();
    if (response?.id) {
      setCartIdInCookie(response.id);
      return response.id;
    }
    return null;
  } catch (error) {
    console.error('Error creating cart:', error);
    return null;
  }
}
