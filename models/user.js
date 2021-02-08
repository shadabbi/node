const ObjectId = require("mongodb").ObjectId;

const getDb = require("../util/database").getDb;

class User {
  constructor(email, name, cart, id) {
    this.email = email;
    this.name = name;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    db.collection("users")
      .insertOne({ name: this.name, email: this.email, cart: this.cart })
      .then((res) => {
        console.log("inserted");
      });
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.findIndex((cp) => {
      return cp.productId.toString() == product._id.toString();
    });
    let cartItems = [...this.cart];
    if (cartProductIndex !== -1) {
      cartItems[cartProductIndex].quantity += 1;
    } else {
      cartItems.push({ productId: new ObjectId(product._id), quantity: 1 });
    }
    db.collection("users")
      .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: cartItems } })
      .then((res) => {
        console.log("updated");
      });
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.map((i) => {
      return i.productId;
    });

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.find((prod) => {
              return p._id.toString() === prod.productId.toString();
            }).quantity,
          };
        });
      });
  }

  deleteCartItem(id) {
    const db = getDb();
    console.log(this.cart.filter((i) => i.productId !== id));
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $set: {
          cart: this.cart.filter(
            (i) => i.productId.toString() !== id.toString()
          ),
        },
      }
    );
  }

  addOrder() {
    const db = getDb();
    return db
      .collection("orders")
      .insertOne({ items: this.cart, user: { name: this.name, _id: this._id } })
      .then((result) => {
        this.cart = [];
        return db
          .collection("users")
          .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: [] } });
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find()
      .toArray()
      .then((prods) => {
        const prodIds = prods[0].items.map((item) => {
          return item.productId;
        });

        return db
          .collection("products")
          .find({ _id: { $in: prodIds } })
          .toArray()
          .then((orders) => {
            return orders.map((order) => {
              return {
                ...order,
                quantity: prods[0].items.find((item) => {
                  return item.productId.toString() === order._id.toString();
                }).quantity,
              };
            });
          });
      });
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .find({ _id: new ObjectId(id) })
      .toArray();
  }
}
module.exports = User;
