import request from "supertest";
require("chai").should();
import { app } from "../app";
import { City } from "../models/City"
const basicUrl = "/v1/cities";

const city = {
    name: "Roma",
    population: 500000,
    men: 70010,
    women: 80012,
    capital: true,
}

describe("create city", () => {
    let id: string;
    after(async () => {
      await City.findByIdAndDelete(id);
    });
    it("success test 200", async () => {
      const { status, body } = await request(app)
        .post(basicUrl)
        .send(city)
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("name").equal(city.name);
      body.should.have.property("population").equal(city.population);
      body.should.have.property("men").equal(city.men);
      body.should.have.property("women").equal(city.women);
      body.should.have.property("capital").equal(city.capital);
      id = body._id;
    });
});

describe("delete city", () => {
    let id: string;
    const newName= "Palla"
    before(async () => {
      const ci = await City.create(city);
      id = ci._id.toString();
    });
    it("Test error 404", async () => {
        const testid = "a" + id.substring(1);
        const { status } = await request(app)
        .delete(`${basicUrl}/${testid}`)
        .send({ ...city, name: newName })
        status.should.be.equal(404);
    });
    it("test success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`)
      status.should.be.equal(200);
    });
});

describe("update city", () => {
    let id: string;
    const newName= "Venezia"
    before(async () => {
      const ci = await City.create(city);
      id = ci._id.toString();
    });
    after(async () => {
      await City.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
        const { status, body } = await request(app)
            .put(`${basicUrl}/${id}`)
            .send({ ...city, name: newName })
        status.should.be.equal(200);
        body.should.have.property("_id");
        body.should.have.property("name").equal(newName);
    });

    it("test unsuccess 404 not valid mongoId", async () => {
        const fakeId = "a" + id.substring(1);
        const { status } = await request(app)
            .put(`${basicUrl}/${fakeId}`)
            .send({ ...city, name: newName })
        status.should.be.equal(404);
    });

    it("test unsuccess 400 missing name", async () => {
      const fakeCity = { ...city } as any;
      delete fakeCity.name;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
      status.should.be.equal(400);
    });

    it("test unsuccess 400 population not number", async () => {
      const fakeCity = { ...city } as any;
      fakeCity.population = "pippo";
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
      status.should.be.equal(400);
    });

    it("test unsuccess 400 men not number", async () => {
        const fakeCity = { ...city } as any;
        fakeCity.men = "pippo";
        const { status } = await request(app)
          .put(`${basicUrl}/${id}`)
          .send(fakeCity)
        status.should.be.equal(400);
      });

    it("test unsuccess 400 women not number", async () => {
    const fakeCity = { ...city } as any;
    fakeCity.women = "pippo";
    const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
    status.should.be.equal(400);
    });
});

describe("get city", () => {
    let id: string;
    before(async () => {
        const ci = await City.create(city);
        id = ci._id.toString();
    });
    after(async () => {
        await City.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
        const { status, body } = await request(app).get(`${basicUrl}/${id}`);
        status.should.be.equal(200);
        body.should.have.property("_id");
        body.should.have.property("name").equal(city.name);
        body.should.have.property("population").equal(city.population);
        body.should.have.property("men").equal(city.men);
        body.should.have.property("women").equal(city.women);
        body.should.have.property("capital").equal(city.capital);
    });
    it("test unsuccess 404 not valid mongoId", async () => {
        const fakeId = "a" + id.substring(1);
        const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
        status.should.be.equal(404);
    });
});
    
describe("get cities", () => {
    let ids: string[] = [];
    const cities = [
        {
            name: "Firenze",
            population: 250000,
            men: 35003,
            women: 40004,
            capital: false,
        },
        {
        name: "Nann",
        population: 25030,
        men: 345003,
        women: 400042,
        capital: true,
        },
        {
        name: "Menze",
        population: 23234,
        men: 5632,
        women: 4204,
        capital: false,
        },
    ];
    before(async () => {
        const response = await Promise.all([
        City.create(cities[0]),
        City.create(cities[1]),
        City.create(cities[2]),
        ]);
        ids = response.map((item) => item._id.toString());
    });
    after(async () => {
        await Promise.all([
        City.findByIdAndDelete(ids[0]),
        City.findByIdAndDelete(ids[1]),
        City.findByIdAndDelete(ids[2]),
        ]);
    });

    it("test success 200", async () => {
        const { status, body } = await request(app).get(basicUrl);
        status.should.be.equal(200);
        body.should.have.property("length").equal(cities.length);
    });

    it("test success 200 with query params", async () => {
        const { status, body } = await request(app).get(
        `${basicUrl}?name=Menze`
        );
        status.should.be.equal(200);
        body.should.have.property("length").equal(1);
    });
});
  
