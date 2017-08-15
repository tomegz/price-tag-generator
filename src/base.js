import Rebase from "re-base";
import firebase from "firebase";

const app = firebase.initializeApp({
  apiKey: "AIzaSyD5tC1uiQ0_1y0Bo44bHC8MHEuibnpStMM",
  authDomain: "pricetag-generator.firebaseapp.com",
  databaseURL: "https://pricetag-generator.firebaseio.com"
});
const base = Rebase.createClass(app.database());

export default base;