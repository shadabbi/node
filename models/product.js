const ObjectId = require("mongodb").ObjectId;

const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id = null, user) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.user = user;
    this._id = new ObjectId(id);
  }

  save(id) {
    const db = getDb();
    if (id) {
      return db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      return db.collection("products").insertOne(this);
    }
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }
  static findById(id) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new ObjectId(id) })
      .toArray();
  }

  static delete(id) {
    const db = getDb();
    return db.collection("products").deleteOne({ _id: new ObjectId(id) });
  }
}

// const Product = sequelize.define("product", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
//   title: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false,
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
// });

module.exports = Product;
