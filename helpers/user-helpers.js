var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const e = require('express')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {


            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('Login success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }

                })

            } else {
                console.log('No user failed');
                resolve({ statu: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let prodObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': new ObjectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userId) },
                        {

                            $push: { products: prodObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
                }

            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()


            resolve(cartItems)
        })
    },
    getcartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.quantity = parseInt(details.count);
        details.count = parseInt(details.count);

        return new Promise((resolve, reject) => {
            // Find the current quantity of the product in the cart
            db.get().collection(collection.CART_COLLECTION).findOne(
                { _id: new ObjectId(details.cart), 'products.item': new ObjectId(details.product) },
                { projection: { 'products.$': 1 } }
            ).then((cart) => {
                if (cart) {
                    const currentQuantity = cart.products[0].quantity;

                    if (currentQuantity + details.count <= 0) {
                        // Remove the product if the resulting quantity is 0 or less
                        db.get().collection(collection.CART_COLLECTION).updateOne(
                            { _id: new ObjectId(details.cart) },
                            {
                                $pull: { products: { item: new ObjectId(details.product) } }
                            }
                        ).then((response) => {
                            resolve({ removeProduct: true });
                        });
                    } else {
                        // Update the quantity if it's more than 0
                        db.get().collection(collection.CART_COLLECTION).updateOne(
                            { _id: new ObjectId(details.cart), 'products.item': new ObjectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }
                        ).then((response) => {
                            resolve({ status: true });
                        });
                    }
                } else {
                    reject('Product not found in cart');
                }
            }).catch((err) => {
                reject(err);
            });
        });
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        price: { $toDouble: '$product.Price' } // Convert the Price field to a double
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$price'] } }
                    }
                }
            ]).toArray();

            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (Array.isArray(total) && total.length > 0) {
                resolve(total[0].total);
            } else {
                // Handle the case where total is not an array or is empty
                resolve(0); // Or some other default value
            }

        });
    },
    placeOrder: (order, products, totalPrice) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, totalPrice);
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                dliveryDeatails: {
                    name: order.Name,
                    mobile: order.Mobile,
                    address: order.Address,


                },
                userId: new ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: totalPrice,
                status: status,
                date: new Date
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new ObjectId(order.userId) })
                resolve()
            })
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            console.log(cart);

            if (cart && cart.products) {
                resolve(cart.products);
            } else {
                // Handle the case where cart is null or does not have products
                console.error('Cart is null or does not have products');
                resolve([]); // or handle as appropriate
            }



        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: new ObjectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)

        })
    },
    getOrderedProducts: async (orderId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()


            resolve(cartItems)
        })

    }

   
}


