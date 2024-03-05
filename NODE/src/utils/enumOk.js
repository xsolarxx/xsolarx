const enumOk = (enumType, word) => {
  const enumGender = ["Hombre", "Mujer", "Otros"];
  const enumTags = ["Paneles solares", "Energía eólica", "Otros"];
  const enumServices = [
    "Installation budget",
    "Photovoltaic panel budget",
    "Energy study",
    "Maintenance",
    "Sizing and modeling of the installation",
    "Safety study",
    "Others",
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
