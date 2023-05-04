# MERCADO PAGO

## Para TEST ir a:

https://www.mercadopago.com.ar/developers/panel/app/919204976846897/test-cards

## Para probar la integración con Mercado Pago con sandbox

En una app creada con React y Express, se puede utilizar el modo sandbox que ofrece la plataforma. El modo sandbox es una herramienta que permite realizar pruebas de pago sin realizar transacciones reales ni cobros, por lo que puedes utilizarlo para probar la integración sin tener que hacer gastos reales.

Probar desde un navegador diferente al de la cuenta de vendedor anexada de mercado pago ya que no se puede simular una compra desde la misma cuenta anexada como vendedor

### Para habilitar el modo sandbox, debes seguir los siguientes pasos:

1. Ingresa a tu cuenta de Mercado Pago buscando en el navegador: mercado pago sandbox o al link https://www.mercadopago.com.ar/developers/es/docs/prestashop/sales-processing/integration-test y accede a la sección "Integraciones".

2. En la sección "Testeo", activa la opción "Modo de prueba" para poder utilizar el sandbox.

3. Una vez habilitado el modo de prueba, podrás generar credenciales de prueba para utilizar en tu aplicación. Para hacerlo, selecciona la opción "Credenciales de prueba".

# MERCADO PAGO
## Recordar que el módulo mercadopago ha sido diseñado para ser utilizado en el lado del servidor
## Implementar Mercado Pago a modo real en una aplicación creada con React y Express, se pueden seguir los siguientes pasos:

En tu aplicación de React y Express, utiliza las credenciales de prueba para configurar Mercado Pago en modo sandbox. Puedes utilizar el siguiente código:

1. Crear una cuenta en Mercado Pago y obtener las credenciales de acceso (Client ID y Client Secret).

2. Instalar la librería de Mercado Pago en la aplicación. Para hacerlo, se puede utilizar el siguiente comando en la terminal:

```bash
npm install mercadopago --save
```

3. Configurar las credenciales de acceso en la aplicación. Para ello, se puede crear un archivo de configuración en el servidor de Express y agregar las siguientes líneas de código:

```javascript
const Public_Key = "TEST-a444b3ce-cbb6-4f66-b2d9-4a850880f115"; // no lo estamos usando
const Access_Token =
  "TEST-919204976846897-020212-10319e6bacd88c552de7db0855b041c4-43204632";

const mercadopago = require("mercadopago");

mercadopago.configure({
  sandbox: true,
  access_token: `${Access_Token}`,
  // integrator_id: "dev_24c65fb163bf11ea96500242ac130004", // en nuestro modelo de test no es necesario
});
```

Es importante reemplazar ACCESS_TOKEN con el token de acceso proporcionado por Mercado Pago.

4. Crear un endpoint en el servidor de Express para recibir las solicitudes de pago. Por ejemplo:

```javascript
const pagar = (req, res) => {
  const { monto, descripcion } = req.body;

  const preference = {
    items: [
      {
        title: descripcion,
        unit_price: parseFloat(monto),
        quantity: 1,
      },
    ],
    back_urls: { // para REDIRECCIONAR ***
        success: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/success
        failure: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/failure
        pending: "http://127.0.0.1:3000/", // http://127.0.0.1:3000/pending
      },
      auto_return: "approved",
  };

  mercadopago.preferences
    .create(preference)
    .then((response) => {
      res.json({ init_point: response.body.init_point });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error al crear preferencia de pago" });
    });
};
```

Este endpoint recibe el monto y la descripción del pago a través del cuerpo de la solicitud y crea una preferencia de pago en Mercado Pago. Luego, devuelve el punto de inicio de pago (init_point) generado por Mercado Pago en formato JSON.

De esta manera se puede  realizar pruebas de pago sin generar gastos reales ni cobros. Es importante recordar que el modo sandbox es una herramienta únicamente para pruebas, y que para realizar transacciones reales se debe utilizar las credenciales correspondientes al ambiente de producción de Mercado Pago.

---

## ACCEDIENDO A LOS DATOS

Para acceder a los datos de respuesta de Mercado Pago desde el front-end de tu aplicación de React, puedes utilizar la función fetch para enviar una solicitud al servidor de Express y obtener la respuesta de Mercado Pago.

Cuando Mercado Pago procesa una transacción, devuelve una respuesta en formato JSON con información detallada sobre el pago, incluyendo el estado de la transacción, el ID de la orden de pago y otros datos relevantes.

Para obtener la respuesta de Mercado Pago desde el front-end de tu aplicación de React, puedes utilizar el siguiente código como ejemplo:

```javascript
class App extends React.Component {
  const pagar = async () => {
    const descripcion = cartProducts.map((e) => e.title).toString();
    // console.log(descripcion);
    const response = await axios.post(
      `http://localhost:8001/electronic/pagar`,
      {
        monto: total,
        descripcion: descripcion,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("response:::", response);
    const { init_point } = response.data; // Redirige al usuario a la página de pago de Mercado Pago
    setInitPoint(init_point); // manejar la bandera para mostrar cartel de espera
    axios
      .post(`http://localhost:8001/electronic/cart/buy`, {
        userId: userId,
        cartCode: cartCode,
        total: total,
      })
      .then((products) => {console.log(products)});
    window.location.href = init_point; // sin el href se redirige a la app de mercado pago, pero a modo de seguridad lo aplicamos en esta línea
  };

  consultarPago = async () => {
    const response = await fetch("/consultar-pago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idPago: "ID_DEL_PAGO",
      }),
    });

    const data = await response.json();

    // Aquí puedes utilizar la respuesta de Mercado Pago como desees
    console.log(data);
  };

  render() {
    return (
      <div>
        <button onClick={this.pagar}>Pagar</button>
        <button onClick={this.consultarPago}>Consultar pago</button>
      </div>
    );
  }
}
```

En este ejemplo, la función pagar envía una solicitud POST al servidor de Express para crear una preferencia de pago en Mercado Pago y obtener el punto de inicio de pago (init_point). Luego, redirige al usuario a la página de pago de Mercado Pago utilizando el valor de init_point.

La función consultarPago envía una solicitud POST al servidor de Express para consultar el estado de un pago específico en Mercado Pago. Para hacerlo, se envía el ID del pago como parámetro en el cuerpo de la solicitud. Luego, se utiliza la función response.json() para obtener los datos de respuesta en formato JSON.

Puedes utilizar los datos de respuesta de Mercado Pago como desees en tu aplicación de React, por ejemplo, para mostrar información detallada sobre la transacción o para actualizar el estado de un pedido en tu aplicación.

---

### Versión con FETCH
```javascript
class App extends React.Component {
  pagar = async () => {
    const response = await fetch("/pagar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monto: 10,
        descripcion: "Pago de prueba",
      }),
    });

    const { init_point } = await response.json();

    window.location.href = init_point;
  };

  render() {
    return (
      <div>
        <button onClick={this.pagar}>Pagar</button>
      </div>
    );
  }
}
```

Este ejemplo utiliza el método fetch para enviar una solicitud POST al endpoint /pagar en el servidor de Express y obtener el punto de inicio de pago (init_point). Luego, redirige al usuario a la página de pago de Mercado Pago utilizando el valor de init_point.

---

# EXTRA
# MANEJO DE DATOS DE Checkout DESDE FORMULARIO PROPIO

Para manejar los datos de pago desde tu propio formulario personalizado, debes utilizar la API de Mercado Pago y enviar los datos del formulario a través de una solicitud POST a la API de Mercado Pago.

Los datos que debes enviar a través de la API incluyen:

1. El token de acceso: Este token se utiliza para autenticar tu aplicación y se obtiene al crear una aplicación en la sección de desarrolladores de Mercado Pago.

2. El monto del pago: Debes enviar el monto del pago que deseas procesar. Este valor debe ser un número decimal y debe incluir el valor de la moneda.

3. La información del comprador: Debes enviar la información del comprador, incluyendo su nombre completo, dirección, correo electrónico y número de teléfono.

4. La información del método de pago: Debes enviar la información del método de pago que deseas procesar, incluyendo el tipo de tarjeta de crédito, el número de la tarjeta, la fecha de vencimiento y el código de seguridad.

Una vez que hayas enviado los datos del formulario a través de la API de Mercado Pago, recibirás una respuesta de la API que incluirá información sobre el estado del pago y los detalles de la transacción.

Es importante tener en cuenta que para utilizar la API de Mercado Pago, debes tener conocimientos de programación y estar familiarizado con los conceptos básicos de las solicitudes HTTP y la manipulación de datos JSON. Si no tienes experiencia en programación, puedes considerar utilizar el formulario de pago de Mercado Pago que ofrece una experiencia de pago preconfigurada y fácil de utilizar.

### Ejemplo:

Ejemplo básico de cómo enviar datos de pago a través de la API de Mercado Pago desde tu propio formulario personalizado. En este ejemplo, utilizaremos Node.js con el módulo axios para realizar las solicitudes HTTP.

1. Instalar el módulo axios en tu aplicación:

```bash
npm install axios
```

2. En tu archivo de servidor Node.js, importa el módulo axios:

```javascript
const axios = require("axios");
```

3. Crea una ruta en tu servidor para procesar la solicitud POST que envía los datos de pago a la API de Mercado Pago. Esta ruta debe escuchar las solicitudes POST que llegan a la URL que has elegido, por ejemplo:

```javascript
app.post("/procesar-pago", async (req, res) => {
  // Aquí procesamos los datos del formulario y los enviamos a la API de Mercado Pago
});
```

4. Recopila los datos del formulario y envíalos a través de una solicitud POST a la API de Mercado Pago:

```javascript
app.post("/procesar-pago", async (req, res) => {
  // Recopilamos los datos del formulario
  const nombre = req.body.nombre;
  const correoElectronico = req.body.correoElectronico;
  const direccion = req.body.direccion;
  const monto = req.body.monto;
  const numeroTarjeta = req.body.numeroTarjeta;
  const fechaVencimiento = req.body.fechaVencimiento;
  const codigoSeguridad = req.body.codigoSeguridad;

  // Construimos el objeto de datos para enviar a la API de Mercado Pago
  const data = {
    token: "TU_TOKEN_DE_ACCESO", // Reemplaza esto con tu token de acceso de Mercado Pago
    transaction_amount: parseFloat(monto),
    description: "Descripción del pago",
    payer: {
      email: correoElectronico,
      identification: {
        type: "DNI",
        number: "12345678",
      },
      address: {
        zip_code: "1234",
        street_name: direccion,
      },
    },
    payment_method_id: "visa",
    issuer_id: null,
    token: token,
  };

  // Enviamos la solicitud POST a la API de Mercado Pago
  try {
    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      data
    );
    console.log(response.data);
    res.send("Pago procesado correctamente.");
  } catch (error) {
    console.error(error);
    res.send("Ha ocurrido un error al procesar el pago.");
  }
});
```

En este ejemplo, estamos recopilando los datos del formulario y construyendo un objeto de datos que enviamos a través de una solicitud POST a la API de Mercado Pago. La respuesta de la API se maneja en una promesa try-catch y se envía una respuesta de éxito o error al cliente.

Es importante tener en cuenta que en este ejemplo se utilizan valores estáticos para el token de acceso, el tipo de tarjeta de crédito y otros parámetros. Debes reemplazar estos valores con los correspondientes a tu propia cuenta de Mercado Pago y a los datos específicos de la transacción que deseas procesar.

---

# A CONSIDERAR

CLIENT_ID_TEST y CLIENT_SECRET_TEST en Mercado Pago no son lo mismo que la public key y el token.

CLIENT_ID_TEST y CLIENT_SECRET_TEST son las credenciales de prueba que se utilizan para realizar pruebas en el entorno de desarrollo o sandbox de Mercado Pago, mientras que la public key y el token son las credenciales de producción que se utilizan para realizar transacciones reales en el entorno de producción.

La public key se utiliza para autenticar las solicitudes que se realizan a través del SDK de Mercado Pago desde el lado del cliente, mientras que el token se utiliza para autenticar las solicitudes que se realizan desde el lado del servidor.

Es importante tener en cuenta que las credenciales de prueba no se pueden utilizar en el entorno de producción y viceversa. Por lo tanto, es necesario utilizar las credenciales correspondientes al entorno en el que se esté trabajando.

## Pero

en el entorno de pruebas de Mercado Pago, también se proporcionan una public key y un access_token en lugar de un CLIENT_ID_TEST y un CLIENT_SECRET_TEST.

La public key se utiliza para autenticar las solicitudes que se realizan desde el lado del cliente, mientras que el access_token se utiliza para autenticar las solicitudes que se realizan desde el lado del servidor.

Es importante tener en cuenta que las credenciales de prueba solo deben utilizarse en el entorno de pruebas y no en el entorno de producción. Cuando estés listo para integrar Mercado Pago en tu sitio web o aplicación, deberás obtener tus credenciales de producción a través del portal de desarrolladores de Mercado Pago.

---

## POSIBLES ERRORES

El error "No podés pagarte a vos mismo" en Mercado Pago puede ocurrir cuando intentas realizar una transacción de prueba en el entorno de sandbox utilizando la misma cuenta de Mercado Pago tanto para el comprador como para el vendedor.

Para realizar pruebas en el entorno de sandbox de Mercado Pago, debes crear al menos dos cuentas de prueba, una para el comprador y otra para el vendedor. Asegúrate de que las cuentas de prueba estén configuradas correctamente y de que hayas iniciado sesión con la cuenta correcta para cada rol en tu sitio web o aplicación.

Si estás seguro de que estás utilizando cuentas de prueba diferentes y aún así recibes este mensaje de error, puedes intentar lo siguiente:

Asegúrate de que estás utilizando las credenciales de prueba correctas de Mercado Pago (es decir, la public key y el access_token de sandbox).
Verifica que el monto y los detalles de la transacción de prueba sean válidos y no contengan información incorrecta o faltante.
Intenta realizar la transacción de prueba en un navegador diferente o en una ventana de incógnito para asegurarte de que no hay problemas con la caché del navegador.
Si después de realizar estos pasos sigues teniendo problemas, puedes contactar al soporte de Mercado Pago para obtener ayuda adicional con la integración en el entorno de sandbox.

---

# RESPONSE de mercado pago es:

```js
{
 config:
  adapter: (2) ['xhr', 'http']
  data: "{\"monto\":10,\"descripcion\":\"Pago de prueba\",\"return_url\":\"https://localhost:5173\"}"
  env: {FormData: ƒ, Blob: ƒ}
  headers: AxiosHeaders {Accept: 'application/json, text/plain, */*', Content-Type: 'application/json'}
  maxBodyLength: -1
  maxContentLength: -1
  method: "post"
  timeout: 0
  transformRequest: [ƒ]
  transformResponse: [ƒ]
  transitional: {silentJSONParsing: true, forcedJSONParsing: true, clarifyTimeoutError: false}
  url: "http://localhost:8001/electronic/pagar"
  validateStatus: ƒ validateStatus(status)
  xsrfCookieName: "XSRF-TOKEN"
  xsrfHeaderName: "X-XSRF-TOKEN"
  [[Prototype]]: Object
data:
  init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=43204632-af09378f-285b-41ee-bff9-b82b1f004464"
  [[Prototype]]: Object
headers:
  AxiosHeaders
  content-length: "122"
  content-type: "application/json; charset=utf-8"
  Symbol(Symbol.toStringTag): (...)
  [[Prototype]]: Object
request:
  XMLHttpRequest
  onabort: ƒ handleAbort()
  onerror: ƒ handleError()
  onload: null
  onloadend: ƒ onloadend()
  onloadstart: null
  onprogress: null
  onreadystatechange: null
  ontimeout: ƒ handleTimeout()
  readyState: 4
  response: "{\"init_point\":\"https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=43204632-af09378f-285b-41ee-bff9-b82b1f004464\"}"
  responseText: "{\"init_point\":\"https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=43204632-af09378f-285b-41ee-bff9-b82b1f004464\"}"
  responseType: ""
  responseURL: "http://localhost:8001/electronic/pagar"
  responseXML: null
status: 200
  statusText: "OK"
  timeout: 0
upload:
  XMLHttpRequestUpload
  {onloadstart: null, onprogress: null, onabort: null, onerror: null, onload: null, …}
  withCredentials: false
  [[Prototype]]: XMLHttpRequest
status: 200
statusText: "OK"
}

```
