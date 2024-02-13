const randomPassword = () => {
    const randomString = "*@!=&$";
    const passwordSecure = `${Math.random().toString(36).slice(-4)}${
      randomString[Math.floor(Math.random() * 5)]
    }${randomString[Math.floor(Math.random() * 5)]}${Math.random()
      .toString(36)
      .slice(-4)
      .toUpperCase()}${randomString[Math.floor(Math.random() * 5)]}${
      randomString[Math.floor(Math.random() * 5)]
    }`;
  
    return passwordSecure;
  };
  
  module.exports = randomPassword;