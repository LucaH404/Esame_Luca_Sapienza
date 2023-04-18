import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    population: { type: Number, required: true },
    men: { type: Number, required: true },
    women: { type: Number, required: true },
    capital: {type: Boolean, required: true}
});
    
export const City = mongoose.model("City", CitySchema);