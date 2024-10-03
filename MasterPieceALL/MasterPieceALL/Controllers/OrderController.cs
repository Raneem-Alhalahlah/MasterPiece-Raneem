using MasterPieceALL.DTOs;
using MasterPieceALL.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MasterPieceALL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly MyDbContext _db;

        public OrderController(MyDbContext db)
        {
            _db = db;
        }

        [HttpPost("checkout")]
        public IActionResult Checkout(int userId)
        {
            // البحث عن السلة الخاصة بالمستخدم
            var cart = _db.Carts
                .Include(c => c.CartItems)
                .FirstOrDefault(c => c.UserId == userId);

            // التحقق من وجود السلة وأنها تحتوي على عناصر
            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest("The cart is empty or does not exist.");
            }

            // حساب المبلغ الإجمالي للعناصر في السلة
            decimal totalAmount = cart.CartItems.Sum(ci => ci.Quantity * ci.Price);

            // التحقق من وجود خصم على السلة
            if (cart.VoucherId.HasValue)
            {
                var voucher = _db.Vouchers.Find(cart.VoucherId);
                if (voucher != null && voucher.DiscountPercentage > 0)
                {
                    decimal discountAmount = totalAmount * (voucher.DiscountPercentage / 100);
                    totalAmount -= discountAmount;

                    // التأكد من أن المبلغ الإجمالي لا يصبح أقل من الصفر
                    totalAmount = totalAmount < 0 ? 0 : totalAmount;
                }
            }

            using (var transaction = _db.Database.BeginTransaction())
            {
                try
                {
                    // إنشاء طلب جديد
                    var order = new Order
                    {
                        UserId = cart.UserId,
                        CartId = cart.CartId,
                        TotalAmount = totalAmount, // السعر الإجمالي بعد الخصم
                        OrderDate = DateTime.Now,
                        CreatedAt = DateTime.Now,
                        ShippingStatus = "Pending", // حالة الشحن المبدئية
                        VoucherId = cart.VoucherId // إضافة الـ VoucherId إذا كان موجوداً
                    };

                    _db.Orders.Add(order);
                    _db.SaveChanges(); // حفظ الطلب للحصول على OrderId

                    // نقل عناصر السلة إلى عناصر الطلب
                    foreach (var cartItem in cart.CartItems)
                    {
                        var orderItem = new OrderItem
                        {
                            OrderId = order.OrderId, // الربط مع الطلب
                            Quantity = cartItem.Quantity,
                            TotalPrice = cartItem.Quantity * cartItem.Price
                        };

                        _db.OrderItems.Add(orderItem);
                    }

                    // حفظ عناصر الطلب
                    _db.SaveChanges();

                    // حذف عناصر السلة بعد نقلها
                    _db.CartItems.RemoveRange(cart.CartItems);
                    _db.SaveChanges(); // حفظ التغييرات لحذف العناصر

                    // حذف السلة بعد إتمام الشراء (اختياري)
                    _db.Carts.Remove(cart);
                    _db.SaveChanges(); // حفظ التغييرات النهائية

                    // إنهاء المعاملة بنجاح
                    transaction.Commit();

                    // إرجاع OrderId في الرد
                    return Ok(new { Message = "Checkout completed successfully", OrderId = order.OrderId });
                }
                catch (Exception ex)
                {
                    // التراجع عن جميع التغييرات في حال حدوث خطأ
                    transaction.Rollback();
                    return StatusCode(500, $"An error occurred during checkout: {ex.Message}");
                }
            }
        }


        [HttpGet("GetAllOrder")]
        public IActionResult GetAllOrders()
        {
            // جلب الطلبات من قاعدة البيانات بشكل متزامن
            var orders = _db.Orders
                .Select(o => new OrderRequestDTO
                {
                    UserId=o.UserId,
                    OrderDate = o.OrderDate,
                    ShippingStatus = o.ShippingStatus,
                    TotalAmount = o.TotalAmount
                })
                .ToList(); // استخدام ToList لجلب البيانات بشكل متزامن

            // التحقق من وجود بيانات
            if (orders == null || !orders.Any())
            {
                return NotFound("No orders found."); // إذا لم توجد طلبات
            }

            // إرجاع الطلبات كـ JSON
            return Ok(orders); // إرجاع البيانات
        }


    }
}
