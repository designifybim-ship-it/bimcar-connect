/* BimCar Connect shared configuration. Live listings, companies, bookings and messages
   come from the database (see js/live.js). This file holds no sample listings. */
window.DB = {
  pickups: ["GAIA airport","Bridgetown cruise port","Bridgetown","Holetown","Speightstown","Oistins","Hotel or villa delivery"],
  parishes: ["Christ Church","St. Michael","St. James","St. Peter","St. Philip","St. Joseph","St. Lucy","St. Thomas","St. George","St. John","St. Andrew"],
  types: [
    {id:"Compact", blurb:"Easy to park, great on gas"},
    {id:"Sedan", blurb:"Comfy with a big boot"},
    {id:"SUV", blurb:"Room for family and beach gear"},
    {id:"Van", blurb:"Groups, luggage and day trips"}
  ],
  extras: [
    {id:"seat", name:"Child seat", price:15, per:"day"},
    {id:"driver", name:"Second driver", price:20, per:"day"},
    {id:"beach", name:"Cooler and 2 beach chairs", price:12, per:"day"},
    {id:"cdw", name:"Collision damage waiver", price:35, per:"day"},
    {id:"deliver", name:"Hotel or villa delivery", price:40, per:"trip"}
  ],
  companies: [],
  vehicles: [],
  specials: [],
  reviews: [],
  bookings: [],
  payMethods: [
    {id:"Cash", label:"Cash", icon:"cash"},
    {id:"Card", label:"Credit or debit card", icon:"card"},
    {id:"Bank transfer", label:"Bank transfer", icon:"bank"},
    {id:"Online link", label:"Online payment link", icon:"link"}
  ],
  payWhen: {pickup:"Pay in full at pickup", deposit:"Deposit to confirm, the rest at pickup", full:"Pay in full before pickup"},
  cancelRules: {"24h":"Free cancellation up to 24 hours before pickup", "48h":"Free cancellation up to 48 hours before pickup", "72h":"Free cancellation up to 72 hours before pickup", "7d":"Free cancellation up to 7 days before pickup", "none":"Deposits are non-refundable"},
  boostTypes: [
    {id:"search", name:"Top of search", price:60, icon:"search", desc:"Your vehicle shows first in search results for its type, with a Featured label."},
    {id:"home", name:"Home page spotlight", price:120, icon:"home", desc:"Your vehicle appears in the Featured row near the top of the home page."},
    {id:"special", name:"Highlighted special", price:40, icon:"tag", desc:"Your special is pinned to the top of the Specials page and the home page."}
  ],
  boosts: [],
  adSpots: [
    {id:"home", name:"Home page partner row", price:250, desc:"Three sponsored cards below the reviews on the home page."},
    {id:"guide", name:"Driving guide", price:150, desc:"Shown next to the scenic drives, where visitors plan their day trips."},
    {id:"confirm", name:"After a booking request", price:200, desc:"Shown to renters right after they send a booking request."}
  ],
  partners: [],
  pendingCompanies: []
};

DB.payMethods.find(m=>m.id==="Card").label="Credit card";
DB.payMethods.push({id:"Debit card",label:"Debit card",icon:"card"});

DB.featurePresets={
 "Comfort":["Air conditioning","Rear air conditioning","Tinted windows","Keyless entry","Leather seats","Heated seats"],
 "Technology":["Bluetooth","Bluetooth and USB","Apple CarPlay","Android Auto","Apple CarPlay and Android Auto","USB charging","Built-in navigation"],
 "Safety and driving":["Reverse camera","Parking sensors","Cruise control","Lane assist","Child seat ready","Four-wheel drive"],
 "Space and extras":["Large boot","Roof rails","Fold-flat rear seats","High roof","Sliding door","Cooler included","Free child seat","Beach chairs included"]
};
/* WhatsApp number (country code + number, digits only) used for boost payments and the contact form. */
DB.boostWhatsApp="12462301679";
DB.contactWhatsApp=DB.boostWhatsApp;
