const randomCode = () => {
    let code = Math.floor(Math.random() * (999999 - 100000) + 1000000); // coge el numero entero anterior, si no tiene decimales se queda con lo que tiene
    return code;
  };
  
  module.exports = randomCode;