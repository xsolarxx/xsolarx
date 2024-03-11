const enumOk = (enumType, word) => {
  let acc;
  const enumGender = ["Male", "Female", "Others"];
  const enumTags = ["Solar panels", "Wind power", "Others"];
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
      acc = 0;
      console.log("ENTRO EN ENUM", word, word.length);
      if (word.length > 0) {
        word.forEach((element) => {
          console.log(enumTags.includes(element));
          enumTags.forEach((item) => {
            if (item === element) {
              acc++;
            }
          });
          // if (enumTags.includes(element)) {
          //   console.log(enumTags.includes(element));
          //   acc++;
          // }
        });
        console.log(acc == word.length ? { check: true } : { check: false });
        return acc == word.length ? { check: true } : { check: false };
      }
    case "enumServices":
      acc = 0;
      console.log("ENTRO EN ENUM", word, word.length);
      if (word.length > 0) {
        word.forEach((element) => {
          console.log(enumServices.includes(element));
          enumServices.forEach((item) => {
            if (item === element) {
              acc++;
            }
          });
          // if (enumTags.includes(element)) {
          //   console.log(enumTags.includes(element));
          //   acc++;
          // }
        });
        console.log(acc == word.length ? { check: true } : { check: false });
        return acc == word.length ? { check: true } : { check: false };
      }
  }
};

//-----------------------------------------------------------------------------

module.exports = enumOk;

//Ok
