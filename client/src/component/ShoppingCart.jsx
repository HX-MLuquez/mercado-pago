import React, { useEffect, useState } from "react";
import "./ShoppingCart.css";
import axios from "axios";

const insufficient_stock = "product not sealed or insufficient stock";

export default function ShoppingCart({ userId }) {
  const [cartProducts, setCartProducts] = useState();
  const [amount, setamount] = useState(true);
  const [cartCode, setCartCode] = useState();
  var amountProduct = 1;
  let total = 0;

  const [initPoint, setInitPoint] = useState(null); // bandera para cartel de aviso de redirect a app de mercado pago

  useEffect(() => {
    axios
      .get(`http://localhost:8001/electronic/cart/all/${userId}`)
      .then((productsId) => {
        console.log("::products::in::cart::", productsId);
        setCartCode(productsId.data);
        axios
          .get(`http://localhost:8001/electronic/product`)
          .then((products) => {
            const productsCart = products.data.filter((product) => {
              if (
                !productsId.data.message &&
                productsId.data.some(
                  (objeto) => objeto.productId === product.id
                )
              ) {
                return product;
              }
            });
            // console.log(productsCart);
            setCartProducts(productsCart);
            return productsCart;
          });
      });
  }, [amount]);

  const increment = (productId, increment) => {
    const data = {
      productId,
      userId,
      increment,
    };
    axios
      .put(`http://localhost:8001/electronic/cart/stock`, data)
      .then((products) => {
        console.log(products);
        if (products.data.message === insufficient_stock) {
          return alert(insufficient_stock);
        }
        setamount(!amount);
      });
    //router.put("/stock", amountStockCart);
    // { userId, productId, increment }
  };

  //----------------------------------------------------------------------------------------------------------------
  // AQUÍ CODE ***
  const pagar = async () => {
    const description = cartProducts.map((e) => e.title).toString();

    const response = await axios.post(
      "http://localhost:8001/electronic/pagar",
      {
        monto: total,
        description,
      }
    );
    const { init_point } = response.data;
    setInitPoint(init_point);

    // userId, cartCode, total
    axios.post("http://localhost:8001/electronic/cart/buy", {
      userId,
      cartCode,
      total,
    }).then((products)=>{
      console.log(products)
    })
  };

  return (
    <div className="shopping-cart">
      <ul>
        {cartProducts &&
          cartProducts.map((product) => (
            <li className="cart_product" key={product.id}>
              <div>
                <h2>{product.title}</h2>
                <p className="total-price">Price: ${product.price}</p>
                <p className="total-price">Stock: {product.stock}</p>
              </div>
              <div className="amount">
                <button onClick={() => increment(product.id, true)}>+</button>
                {cartCode
                  ?.filter((e) => product.id === e.productId)
                  .map((e) => {
                    amountProduct = e.amount;
                    total = total + product.price * amountProduct;
                    return <p key={e.productId}>Amount: {amountProduct}</p>;
                  })}
                <button onClick={() => increment(product.id, false)}>-</button>
                <h2 className="total-price">
                  SubTotal: ${product.price * amountProduct}
                </h2>
              </div>
            </li>
          ))}
      </ul>
      {initPoint && (
        <div>
          <h2 style={{ color: "green" }}>Redirigiendo a Mercado Pago...</h2>
          {(window.location.href = initPoint)}
        </div>
      )}
      {total != 0 ? (
        <div>
          <h1 className="total-price">Total Price: ${total}</h1>
          <button onClick={pagar} className="checkout-button">
            Pagar
          </button>
        </div>
      ) : (
        <h1 className="total-price">empty Shopping Cart</h1>
      )}
    </div>
  );
}

/*
Aumentar o decrementar stock
const { userId, productId, increment } = req.body;
http://localhost:8001/electronic/cart/stock
router.put("/stock", amountStockCart);
*/

/*
Trae todos los productos del carrito
http://localhost:8001/electronic/cart/all
router.get("/all", getAllCart);
*/

/*
Hacer Compra de los productos ya seleccionados dentro del carrito
const { userId, productsId, total } = req.body;
http://localhost:8001/electronic/cart/buy
router.post("/buy", buyProducts);
*/

/*
cartCode = [{userId, productId ,amount}, {etc}] // data tipo tabla intermedia. Manejo de relaciones
cartProducts = [{product1},{product2},{etc.}]
*/

/*
PLANTEAR QUE: SE PUEDE MEJORAR LA LOGICA PARA EL RENDERIZADO DE LOS PRODUCTOS EN EL CARRITO
Y EL MANEJO CORRECTO DEL STOCK (amount) MODIFICANDO LA ESTRUCTURA DE NUESTRO MODELO 
DE NUESTRA DB.
SIEMPRE VA A DEPENDER DEL MODELO DE RELACIONES CON EL QUE HAYAMOS ESTRUCTURADO NUESTRA DB
*/
