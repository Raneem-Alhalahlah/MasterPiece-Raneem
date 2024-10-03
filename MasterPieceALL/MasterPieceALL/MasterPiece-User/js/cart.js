const token = localStorage.Token;
const url = "https://localhost:44361";
const apiUrl = url + "/api/Cart/getCartItems";

async function removeCartItem(cartItemId) {
  let removeUrl = `https://localhost:44361/api/Cart/deleteFromCart/${cartItemId}`;
  let response = await fetch(removeUrl, {
    method: "delete",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response);

  if (response.ok) {
    iziToast.success({
      title: "Item Removed",
      message: "Your item has been removed successfully",
      position: "topCenter",
      timeout: 3000,
    });
    getCartItems();
  } else {
    iziToast.error({
      title: "Error",
      message: "Something went wrong",
      position: "topCenter",
      timeout: 3000,
    });
  }
}

async function updateCartItem(cartItemId, quantity) {
  let updateUrl = url + "/api/Cart/updateCartItem/" + cartItemId;
  let response = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: quantity,
    }),
  });
  if (response.ok) {
    iziToast.success({
      title: "Quantity Updated",
      message: "Your quantity has been updated successfully",
      position: "topCenter",
      timeout: 3000,
    });
    getCartItems();
  } else {
    iziToast.error({
      title: "Error",
      message: "Something went wrong",
      position: "topCenter",
      timeout: 3000,
    });
  }
}

//promocode
// Function to apply promo code and update price
document
  .getElementById("promoCodeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    let promoCode = document.getElementById("promoCodeInput").value;

    // الحصول على السعر الديناميكي من الصفحة
    let originalPriceText = document.getElementById("totalPriceSpan").innerText;
    let originalPrice = parseFloat(originalPriceText.replace("$", "")); // إزالة رمز الدولار وتحويل النص إلى رقم

    let discount = 0; // القيمة الأولية للخصم

    // تحقق من أن كود القسيمة ليس فارغًا
    if (promoCode.length === 0) {
      iziToast.error({
        title: "خطأ",
        message: "يرجى إدخال كود القسيمة.",
        position: "topCenter",
        timeout: 3000,
      });
      return;
    }

    try {
      let response = await fetch(
        `https://localhost:44361/api/Vouchers/GetVoucherByVoucherCode${promoCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorText = await response.text();
        throw new Error(
          errorText || "Invalid promo code or something went wrong."
        );
      }

      let data = await response.json();
      console.log("Response data:", data);
      if (data && data.discountPercentage) {
        discount = data.discountPercentage * 100;
        // throw new Error("No discount returned.");
      }

      // تحديث الأسعار بناءً على الخصم كنسبة مئوية
      let discountedPrice = originalPrice - (originalPrice * discount) / 100;
      // document.getElementById(
      //   "totalPriceSpan"
      // ).innerText = `$${originalPrice.toFixed(2)}`;

      document.getElementById("code").innerText = `-${discount}%`;

      document.getElementById(
        "cartTotaSpan"
      ).innerText = `$${discountedPrice.toFixed(2)}`;

      // إظهار رسالة نجاح
      iziToast.success({
        title: "نجاح",
        message: `تم تطبيق الخصم بنسبة ${discount}%!`,
        position: "topCenter",
        timeout: 3000,
      });
      localStorage.setItem("discountedTotalPrice", discountedPrice.toFixed(2));
    } catch (error) {
      iziToast.error({
        title: "خطأ",
        message: error.message,
        position: "topCenter",
        timeout: 3000,
      });
    }
  });

// Get all cart items
async function getCartItems() {
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  let cartItems = data.cartItems;
  let cart = data.cart;

  console.log(cart);

  // الحصول على كود الخصم
  let promoCodeInput = document.getElementById("promoCodeInput");
  if (cart.voucher) {
    promoCodeInput.value = cart.voucher.voucherCode;
  }

  console.log("Data fetched successfully:", data);
  let cartItemsDiv = document.getElementById("cartItemsList");
  // حساب السعر الإجمالي بدون خصم
  let totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity; // حساب السعر لكل عنصر
  }, 0); // بدء المجموع من 0
  localStorage.setItem("totalPrice", totalPrice);

  // تحديث السعر الإجمالي في الصفحة
  document.getElementById("totalPriceSpan").innerText = "$" + totalPrice;
  document.getElementById("cartTotaSpan").innerText = "$" + totalPrice;
  cartItemsDiv.innerHTML = "";

  // تطبيق كود الخصم إذا كان موجودًا
  let discount = 0;
  if (cart.voucher && cart.voucher.discountPercentage) {
    discount = cart.voucher.discountPercentage;
    const discountedPrice =
      totalPrice - ((totalPrice * discount) / 100).toFixed(2);

    // تحديث السعر بعد الخصم
    document.getElementById("totalPriceSpan").innerText = "$" + discountedPrice;
    document.getElementById("cartTotaSpan").innerText = "$" + discountedPrice;
    document.getElementById("code").innerText = `-${discount}%`; // عرض نسبة الخصم
  }
  // عرض العناصر في سلة التسوق
  cartItems.forEach((item) => {
    const itemTotalPrice = item.price * item.quantity;
    cartItemsDiv.innerHTML += `
     <div class="row gy-3">
        <div class="col-lg-5">
          <div class="me-lg-5">
            <div class="d-flex align-items-center">
              <img
                src="${url + "/" + item.product.productImage1}"
                class="border rounded me-3"
                style="width: 96px; height: 96px"
              />
              <h4 class="mb-0">${item.product.productName}</h4>
            </div>
          </div>
        </div>
        <div class="col-lg-2 col-sm-6 col-6 d-flex flex-row align-items-center">
          <!-- جزء الكمية -->
          <div class="me-3">
            <label class="mb-2 d-block">Quantity</label>
            <div class="input-group" style="width: 170px">
              <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon1" onclick="reduceToQuantity(${
                item.product.productId
              }, ${item.cartItemId})">
                <i class="fas fa-minus"></i>
              </button>
              <input type="text" class="form-control text-center border border-secondary" value="${
                item.quantity
              }" id="quantity-${item.product.productId}" />
              <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon2" onclick="addToQuantity(${
                item.product.productId
              }, ${item.cartItemId})">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="d-flex flex-column align-items-start">
            <!-- السعر الأصلي بحجم أكبر -->
            <span class="h5">${item.product.price} JOD</span>

            <!-- السعر الإجمالي بحجم أصغر -->
            <span class="h6 text-muted">Total: ${item.price.toFixed(
              2
            )} JOD</span>
          </div>
        </div>

        <div class="col-lg col-sm-6 d-flex justify-content-sm-center justify-content-md-start justify-content-lg-center justify-content-xl-end mb-2">
          <div class="float-md-end">
            <a href="#" class="btn btn-light border text-danger icon-hover-danger" onclick="removeCartItem(${
              item.cartItemId
            })">
              Remove
            </a>
          </div>
        </div>
      </div>`;
  });
}

getCartItems();

// document
//   .getElementById("checkoutButton")
//   .addEventListener("click", openPaymentWindow);

// Function to open the payment link and close the window when it navigates to a specific page
// async function openPaymentWindow() {
//   let response = await fetch("https://localhost:44339/api/Cart/checkout", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });

//   let data = await response.json();
//   console.log(data);

//   // Open the payment window
//   let paymentWindow = window.open(
//     data.approvalUrl,
//     "PaymentWindow",
//     "width=800,height=600"
//   );

//   // Set an interval to periodically check the URL of the payment window
//   let checkInterval = setInterval(function () {
//     try {
//       // Check if the window is still open and the URL contains the target string
//       console.log("tec");
//       if (
//         paymentWindow &&
//         paymentWindow.location.href.includes("api/Cart/success")
//       ) {
//         // Close the payment window
//         paymentWindow.close();
//         // Clear the interval to stop checking
//         clearInterval(checkInterval);
//         window.location.href = "index.html";
//       }
//     } catch (e) {
//       // Ignore any cross-origin access errors
//     }

//     // Close the interval if the window is closed manually
//     if (paymentWindow && paymentWindow.closed) {
//       clearInterval(checkInterval);
//       window.location.href = "index.html";
//     }
//   }, 1000); // Check every second (1000 milliseconds)
// }

//update
const urlBatool = "https://localhost:44361/api/Cart/updateCartItem";
async function updateData(cartItemId, quantity) {
  const token = localStorage.getItem("Token");

  var response = await fetch(`${urlBatool}/${cartItemId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: quantity, // استخدام الكمية التي يتم تمريرها للدالة
    }),
  });

  if (response.ok) {
    var result = await response.json();
    console.log("Updated cart item:", result);
  } else {
    console.error("Error updating cart item:", await response.text());
  }
}

function addToQuantity(productId, cartItemId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  quantityInput.value = +quantityInput.value + 1;
  updateData(cartItemId, quantityInput.value);
}

function reduceToQuantity(productId, cartItemId) {
  const quantityInput = document.getElementById(`quantity-${productId}`);
  if (quantityInput.value > 1) {
    quantityInput.value = +quantityInput.value - 1;
    updateData(cartItemId, quantityInput.value);
  }
}

//for checkout
async function checkout() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("User ID not found in local storage.");
    return;
  }

  try {
    // إرسال طلب POST باستخدام async/await
    const response = await fetch(
      `https://localhost:44361/api/Order/checkout?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to complete the checkout process.");
    }

    // استرجاع البيانات بصيغة JSON
    const data = await response.json();

    if (data && data.orderId) {
      localStorage.setItem("orderId", data.orderId);
      alert(`Checkout successful! `);
    } else {
      alert("Order ID not found in response.");
    }

    // تحويل المستخدم إلى صفحة التأكيد أو صفحة أخرى
    window.location.href = "Checkout.html"; // استبدل بالصفحة التي تريد توجيه المستخدم إليها
  } catch (error) {
    // معالجة الأخطاء
    alert("There was an error during checkout: " + error.message);
    console.error("Error:", error);
  }
}
