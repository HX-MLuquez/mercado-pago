// CODE

// npm install mercadopago

const mercadopago = require("mercadopago");
// Agrega credenciales

const PROD_ACCESS_TOKEN =
  "TEST-919204976846897-020212-10319e6bacd88c552de7db0855b041c4-43204632";

mercadopago.configure({
  sandbox: true,
  access_token: PROD_ACCESS_TOKEN,
});

const pagar = (req, res) => {
  const { monto, description } = req.body;
  const preference = {
    items: [
      {
        title: description,
        unit_price: parseFloat(monto),
        quantity: 1,
      },
    ],
    back_urls: {
      success: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/success
      failure: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/failure
      pending: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/pending
    },
    auto_return: "approved",
  };

  mercadopago.preferences
    .create(preference)
    .then((response) => {
      console.log("------response---->", response);
      res.json({ init_point: response.body.init_point });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error al crear preferencia de pago" });
    });
};

//------------------------------------------------------------------------------------------------
/*
mercadopago.configure()

mercadopago.preferences { create }
*/

/*

*/
module.exports = { pagar };
