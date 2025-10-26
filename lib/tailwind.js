// lib/tailwind.js


import { Dimensions } from "react-native";
import { create } from "twrnc";

// create the customized version...
const tw = create(require(`@/tailwind.config`)); // <- your path may differ

// ... and then this becomes the main function your app uses
export default tw;

// tablete for 
const { width } = Dimensions.get("window");
export const isTablet = width >= 768;
