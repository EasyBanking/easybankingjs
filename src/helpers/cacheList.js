const { Cluster } = require("ioredis");

class CacheList {
  collectionName = "";

  list = [];

  /**
   *
   * @param {Cluster} client
   */
  constructor(client) {
    this.client = client;
  }

  async sync() {
    let list = [];
    
    const exists = await this.client.exists(this.collectionName);

    if (exists) {
      list = JSON.parse(await this.client.get(this.collectionName));
    }

    this.list = list;
  }

  async save() {
    let list = JSON.stringify(this.list);
    await this.client.set(this.collectionName, list);
  }

  async drop() {
    this.list = [];
    await this.client.del(this.collectionName);
  }

  deleteOne(id) {
    const index = this.list.findIndex((i) => i.id == id);

    if (!index) {
      throw new Error(`${obj} not found`);
    }

    this.list.splice(index, 1);
  }

  updateOne(id, obj) {
    const index = this.list.findIndex((i) => i.id == id);

    if (!index) {
      throw new Error(`${obj} not found`);
    }

    this.list[index] = { ...obj };
  }

  findOne(id) {
    const index = this.list.findIndex((i) => i.id == id);

    if (!index) {
      throw new Error(`${obj} not found`);
    }

    return this.list[index];
  }

  exists(id) {
    return this.list.findIndex((i) => i.id == id);
  }

  add(obj) {
    this.list.push(obj);
    return obj;
  }
}

exports.CacheList = CacheList;
