export type StaticFilter = {
  id: string;
  name: string;
  type: "category" | "size" | "color" | "brand" | "price_range" | "custom";
  values: string[];
};

// Adjust values as you like
export const STATIC_FILTERS: StaticFilter[] = [
  {
    id: "price",
    name: "Price Range",
    type: "price_range",
    values: ["0-200"],
  },
  {
    id: "size",
    name: "Size",
    type: "size",
    values: ["S", "M", "L", "XL", "XXL", "XXXL"],
  },
  {
    id: "fit",
    name: "Fit",
    type: "custom",
    values: ["Slim", "Regular", "Oversized"],
  },
  {
    id: "style",
    name: "Style",
    type: "custom",
    values: ["Anime", "Moon", "Girls", "Qoutes", "Basic"],
  },
  {
    id: "color",
    name: "Color",
    type: "color",
    values: [
      "Black",
      "Dark blue",
      "Blue",
      "Brown",
      "Dark Red",
      "Green",
      "Pink",
      "Purple",
      "Fuchsia",
      "White",
      "Gray",
      "Dark gray",
      "Mint Green",
      "Kashmir",
      "Petroleum",
      "Baby blue",
      "Red",
    ],
  },
  {
    id: "category",
    name: "Category",
    type: "category",
    values: ["Hoodies", "Sweetpants"],
  },
];
