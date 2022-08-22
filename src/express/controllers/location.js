const { Location } = require("../../models/Location");
const { point, nearestPoint, featureCollection } = require("@turf/turf");

module.exports = {
  async getAll(req, res) {
    const { geojson } = req.query;

    const locations = await Location.find();

    if (!geojson) {
      return res.json({
        data: locations,
      });
    }

    const features = locations.map((location) => {
      return point([location.longitude, location.latitude], {
        addresse: location.address,
      });
    });

    res.json({
      locations: features,
    });
  },

  async search(req, res) {
    const { address } = req.query;
    const locations = await Location.find({
      address: {
        $regex: address || "",
        $options: "i",
      },
    }).exec();

    res.json({
      data: locations,
    });
  },

  async findNearest(req, res) {
    const { latitude, longitude } = req.query;
    const target = point([longitude, latitude]);

    const locations = await Location.find();

    const features = locations.map((location) => {
      return point([location.longitude, location.latitude]);
    });

    const nearest = nearestPoint(target, featureCollection(features));

    res.json({
      data: nearest,
    });
  },

  async create(req, res) {
    const { latitude, longitude, address } = req.body;

    res.json({
      location: await Location.create({
        address,
        latitude,
        longitude,
      }),
    });
  },

  async find(req, res) {
    const { id } = req.params;

    res.json({
      location: await Location.findById(id),
    });
  },

  async update(req, res) {
    const { id } = req.params;
    const { address, latitude, longitude } = req.body;
    res.json({
      location: await Location.findByIdAndUpdate(id, {
        address,
        latitude,
        longitude,
      }),
    });
  },

  async delete(req, res) {
    const { id } = req.params;

    res.json({
      location: await Location.findByIdAndDelete(id),
    });
  },
};
