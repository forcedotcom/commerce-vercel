'use server';

import { getCartIdFromCookie, setCartIdInCookie } from 'app/api/auth/cookieUtils';
import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, removeFromCart, updateCart, Cart } from 'lib/sfdc';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCookie } from 'lib/server-cookies';

export async function addItem(prevState: any, selectedVariantId: string | undefined) {
  try {
    await addToCart({ productId: selectedVariantId!, quantity: 1, type: 'Product' });
    revalidateTag(TAGS.cart);
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();
    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);
    if (lineItem && lineItem.id) {
      await removeFromCart(lineItem.id);
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
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart(lineItem.id);
      } else {
        await updateCart(lineItem.id, quantity);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart({ productId: merchandiseId, quantity, type: 'Product' });
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return 'Error updating item quantity';
  }
}

export async function redirectToCheckout() {
  let cart = await getCart();
  redirect(cart!.checkoutUrl);
}

export async function createCartAndSetCookie() {
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
