﻿using System.ComponentModel.DataAnnotations;
using MasterPieceALL.Models;

namespace MasterPieceALL.DTOs.CartDtos
{
    public class CartItemDto
    {

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        public int? ProductId { get; set; }

        public CartItem CreateCartItem(MyDbContext db, Cart cart)
        {
            // Make sure the given product id has a corresponding
            var product = db.Products.Find(ProductId);
            if (product == null)
                throw new ArgumentException("The given ProductId has no corresponding product on the database");

            // Make sure the product has a price.
            if (product.Price == null)
                throw new ArgumentException("The Product Must have a Price!!");
            var productPrice = (product.Price ?? 0) - (product.Price ?? 0) * (product.DiscountPercentage ?? 0);
            var cartItem = db.CartItems.FirstOrDefault(cItem => cItem.CartId == cart.CartId && cItem.ProductId == ProductId);

            // Apply the discount if there is a voucher on the cart
            var voucher = db.Vouchers.Find(cart.VoucherId);
            decimal discount = 0;
            if (voucher != null)
                discount = voucher.DiscountPercentage;

            // Create a cart item if not exist and add the quantity
            if (cartItem == null)
            {
                cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = ProductId,
                    Price = (productPrice - productPrice * discount) * Quantity,
                    Quantity = Quantity
                };
                db.CartItems.Add(cartItem);
            }
            else
            {
                cartItem.Quantity += Quantity;
                cartItem.Price = (productPrice - productPrice * discount) * cartItem.Quantity;
                db.CartItems.Update(cartItem);
            }
            db.SaveChanges();
            return cartItem;
        }
    }

}
