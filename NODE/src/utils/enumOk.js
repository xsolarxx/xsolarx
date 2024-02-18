const enumOk = (enumType, word) => {
  const enumGender = ["Hombre", "Mujer", "Otros"];
  const enumTags = ["Paneles solares", "Energía eólica", "Otros"];
  const enumServices = [
    "Presupuesto de instalación",
    "Presupuesto de placas fotovoltáicas",
    "Estudio energético",
    "Mantenimiento",
    "Dimensionado y modelado de la instalación",
    "Estudio de seguridad",
    "Otros",
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

//-----------------------------------------------------------------------------

module.exports = enumOk;

//Ok
