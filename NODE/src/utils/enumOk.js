const enumOk = (enumType, word) => {
  const enumGender = ["hombre", "mujer", "otros"];
  const enumTags = ["Paneles solares", "Energía eólica", "otros"];
  const enumServices = [
    "Presupuesto de instalación",
    "Presupuesto de placas fotovoltáicas",
    "Estudio energético",
    "Mantenimiento",
    "Dimensionado y modelado de la instalación",
    "Estudio de seguridad",
  ];
  switch (enumType) {
    case "enumGender":
      if (enumGender.includes(word)) {
        console.log("Entra en el true");
        return { check: true, word };
      } else {
        return {
          check: false,
        };
      }
    case "enumTags":
      if (enumTags.includes(word)) {
        console.log("Entra en el true");
        return { check: true, word };
      } else {
        return {
          check: false,
        };
      }
    case "enumServices":
      if (enumServices.includes(word)) {
        console.log("Entra en el true");
        return { check: true, word };
      } else {
        return {
          check: false,
        };
      }
  }
};

module.exports = enumOk;
