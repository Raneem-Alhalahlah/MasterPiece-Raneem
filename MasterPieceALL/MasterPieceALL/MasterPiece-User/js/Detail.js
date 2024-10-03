debugger;
async function showProductDetail() {
  debugger;
  const x = localStorage.getItem("selectedProductId");
  let min = localStorage.getItem("minnPrice");
  let response;
  if (min != null || min != undefined) {
    const productDetails = {
      productName: localStorage.getItem("ProductName"),
      color: localStorage.getItem("colorName"),
      minPrice: localStorage.getItem("minnPrice"),
      maxPrice: localStorage.getItem("maxxPrice"),
    };

    response = await fetch(`https://localhost:44361/api/Products/visible`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productDetails),
    });
  } else {
    let url = `https://localhost:44361/api/Products/GetProductsById/${x}`;
    response = await fetch(url);
  }
  debugger;
  let result = await response.json();
  localStorage.setItem("selectedProductId", result.productId);
  var container = document.getElementById("productdetails");

  container.innerHTML = `
      <div class="container">
        <div class="row gx-5">
          <aside class="col-lg-6">
            <div class="border rounded-4 mb-3 d-flex justify-content-center">
              <img 
                style="max-width: 100%; max-height: 100vh; margin: auto" 
                class="rounded-4 fit" 
                src="https://localhost:44361/${result.productImage1}" 
              />
            </div>
          </aside>
          
          <main class="col-lg-6">
            <div class="ps-lg-3">
              <h4 class="title text-dark">${result.productName}</h4>
              <div class="d-flex flex-row my-3">
                <div class="text-success ms-2">In stock</div>
              </div>
  
              <div class="mb-3">
                <span class="h5">$${result.price}</span>
                <span class="text-muted">/per box</span>
              </div>
  
              <p>${result.description}</p>
  
              <div class="row">
                <dt class="col-3">Color:</dt>
                <dd class="col-9">${result.color}</dd>
              </div>
  
              <hr />
  
              <div class="row mb-4">
  <div class="col-md-4 col-6 mb-3">
    <label class="mb-2 d-block">Quantity</label>
    <div class="input-group mb-3" style="width: 170px">
      <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon1" onclick="reduceToQuantity()">
        <i class="fas fa-minus"></i> 
      </button>
      <input type="text" class="form-control text-center border border-secondary" value="1" id="quantity" />
      <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon2" onclick="addToQuantity()">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
</div>
  
             
              <a  class="btn btn-primary shadow-0" onclick="addToCart(${localStorage.selectedProductId})" >
                <i class="me-1 fa fa-shopping-basket"></i> Add to cart
              </a>
             
            </div>
          </main>
        </div>
      </div>`;
}

showProductDetail();
async function addToCart(productId) {
  debugger;
  const token = localStorage.getItem("Token");
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  if (token) {
    try {
      const response = await fetch(
        "https://localhost:44361/api/Cart/addToCart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            quantity: quantity,
          }),
        }
      );

      const data = await response.json();
      console.log("Product added to cart:", data);
      Toastify({
        text: `Your product has been added to the cart. Quantity: ${quantity}`,
        duration: 3000,
      }).showToast();
    } catch (error) {
      console.error("Error:", error);
      Toastify({
        text: "Error adding product to the cart",
        duration: 3000,
        backgroundColor: "red",
      }).showToast();
    }
  } else {
    // إذا لم يكن هناك توكين، احفظ المنتج والكمية في localStorage
    let cartItems = localStorage.getItem("cartItems");
    if (cartItems) cartItems = JSON.parse(cartItems);
    else cartItems = [];

    if (cartItems.find((c) => c.productId == productId)) {
      // إذا كان المنتج موجودًا، قم بتحديث الكمية
      cartItems.find((c) => c.productId == productId).quantity += quantity;
    } else {
      // إذا لم يكن موجودًا، أضف المنتج
      cartItems.push({ productId: productId, quantity: quantity });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    Toastify({
      text: `Product added to local cart. Quantity: ${quantity}`,
      duration: 3000,
    }).showToast();
  }
}
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
      quantity: quantity,
    }),
  });

  if (response.ok) {
    var result = await response.json();
    console.log("Updated cart item:", result);
  } else {
    console.error("Error updating cart item:", await response.text());
  }
}
function addToQuantity() {
  document.getElementById("quantity").value =
    +document.getElementById("quantity").value + 1;
  updateData(cartItemId, quantityInput.value);
}
function reduceToQuantity() {
  if (document.getElementById("quantity").value > 1)
    document.getElementById("quantity").value =
      +document.getElementById("quantity").value - 1;
  updateData(cartItemId, quantityInput.value);
}

// async function productByfilter() {
//   debugger;
//   const productDetails = {
//     productName: localStorage.getItem("ProductName"),
//     color: localStorage.getItem("colorName"),
//     minPrice: localStorage.getItem("minnPrice"),
//     maxPrice: localStorage.getItem("maxxPrice"),
//   };

//   try {
//     const response = await fetch(
//       `https://localhost:44361/api/Products/visible`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(productDetails),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Error fetching filtered products");
//     }

//     const result = await response.json();
//     console.log("Data from API:", data);
//     var container = document.getElementById("productdetails");

//     container.innerHTML = `
//         <div class="container">
//           <div class="row gx-5">
//             <aside class="col-lg-6">
//               <div class="border rounded-4 mb-3 d-flex justify-content-center">
//                 <img
//                   style="max-width: 100%; max-height: 100vh; margin: auto"
//                   class="rounded-4 fit"
//                   src="https://localhost:44361/${result.productImage1}"
//                 />
//               </div>
//             </aside>

//             <main class="col-lg-6">
//               <div class="ps-lg-3">
//                 <h4 class="title text-dark">${result.productName}</h4>
//                 <div class="d-flex flex-row my-3">
//                   <div class="text-success ms-2">In stock</div>
//                 </div>

//                 <div class="mb-3">
//                   <span class="h5">$${result.price}</span>
//                   <span class="text-muted">/per box</span>
//                 </div>

//                 <p>${result.description}</p>

//                 <div class="row">
//                   <dt class="col-3">Color:</dt>
//                   <dd class="col-9">${result.color}</dd>
//                 </div>

//                 <hr />

//                 <div class="row mb-4">
//     <div class="col-md-4 col-6 mb-3">
//       <label class="mb-2 d-block">Quantity</label>
//       <div class="input-group mb-3" style="width: 170px">
//         <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon1" onclick="reduceToQuantity()">
//           <i class="fas fa-minus"></i>
//         </button>
//         <input type="text" class="form-control text-center border border-secondary" value="1" id="quantity" />
//         <button class="btn btn-white border border-secondary px-3" type="button" id="button-addon2" onclick="addToQuantity()">
//           <i class="fas fa-plus"></i>
//         </button>
//       </div>
//     </div>
//   </div>

//                 <a  class="btn btn-primary shadow-0" onclick="addToCart(${localStorage.selectedProductId})" >
//                   <i class="me-1 fa fa-shopping-basket"></i> Add to cart
//                 </a>

//               </div>
//             </main>
//           </div>
//         </div>`;
//     if (data.length > 0) {
//       renderProductDetail(data[0]); // Assuming you want to show details of the first matching product
//       window.location.href = "Detail.html";
//     } else {
//       console.warn("No products found");
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }
// debugger;
// if (!localStorage.getItem("minnPrice") && !localStorage.getItem("maxxPrice")) {
//   debugger;
//   showProductDetail();
// } else {
//   debugger;
//   productByfilter();
// }
