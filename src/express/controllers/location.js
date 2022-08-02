const { Location } = require("../../models/Location");
const { point, nearestPoint, featureCollection } = require("@turf/turf");

module.exports = {
  async getAll(req, res) {
    const locations = await Location.find();

    res.json({
      data: locations,
    });
  },

  async search(req, res) {
    const { address } = req.query;
    const locations = Location.find({
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

    const locations = await this.getAll();

    const features = locations.map((location) => {
      return point([location.longitude, location.latitude]);
    });

    const nearest = nearestPoint(target, featureCollection(features));

    res.json({
      data: nearest,
    });
  },
};
