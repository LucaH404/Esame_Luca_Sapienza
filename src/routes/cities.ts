import express from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { City } from "../models/City";
const router = express.Router();

router.get("/:id", param("id").isMongoId(), checkErrors, async (req, res) => {
    const { id } = req.params;
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(city);
});
  router.get( // if it's only "/" prints every single city in the database
    "/",
    query("name").optional().isString(),
    query("population").optional().isNumeric(),
    query("men").optional().isNumeric(),
    query("women").optional().isNumeric(),
    query("capital").optional().isBoolean(),
    checkErrors,
    async (req, res) => {
      const cities = await City.find({ ...req.query });
      res.json(cities);
    }
);

router.post( // Creates a new city
    "/",
    body("name").exists().isString(),
    body("population").exists().isNumeric(),
    body("men").exists().isNumeric(),
    body("women").exists().isNumeric(),
    body("capital").exists().isBoolean(),
    checkErrors,
    async (req, res) => {
      const { name, population, men, women, capital } = req.body;
      const cities = new City({ name, population, men, women, capital });
      const citySaved = await cities.save();
      res.status(201).json(citySaved);
    }
);

router.put( // Edits city info
    "/:id",
    param("id").isMongoId(),
    body("name").exists().isString(),
    body("population").exists().isNumeric(),
    body("men").exists().isNumeric(),
    body("women").exists().isNumeric(),
    body("capital").exists().isNumeric(),
    checkErrors,
    async (req, res) => {
      const { id } = req.params;
      const { name, population, men, women, capital } = req.body;
      try {
        const cities = await City.findById(id);
        if (!cities) {
          return res.status(404).json({ message: "city not found" });
        }
        cities.name = name;
        cities.population = population;
        cities.men = men;
        cities.women = women;
        cities.capital = capital;
        const citiesSaved = await cities.save();
        res.json(citiesSaved);
      } catch (err) {
        res.status(500).json({ err });
      }
    }
);
router.delete( // Deletes a City
    "/:id",
    param("id").isMongoId(),
    checkErrors,
    async (req, res) => {
      const { id } = req.params;
      const cities = await City.findById(id);
      if (!cities) {
        return res.status(404).json({ message: "product not found" });
      }
      await City.findByIdAndDelete(id);
      res.json({ message: "City deleted" });
    }
);
router.post(
    "/merge",
    body("c").exists().isMongoId(),
    body("c1").exists().isMongoId(),
    checkErrors,
    async (req, res) => {
      const { c1, c2 } = req.body;
      try {
        const cOne = await City.findById(c1);
        const cTwo = await City.findById(c2);
  
        if (!cOne || !cTwo) {
          return res.status(404).json({ message: "one or both cities haven't been found" });
        }
        const newPop = cOne.population + cTwo.population;
        const newMen = cOne.men + cTwo.men;
        const newWomen = cOne.women + cTwo.women;
        const mergedCity = new City({
          name: `${cOne.name} ${cTwo.name}`,
          population: newPop,
          men: newMen,
          women: newWomen,
          capital: cOne.capital || cTwo.capital,
        });
        const citySaved = await mergedCity.save();
        await City.findByIdAndDelete(c1);
        await City.findByIdAndDelete(c2);
  
        res.status(201).json(citySaved);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
        }
    }
);
export default router;