var db=require('../config/connection')
var collection=require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports={

  doAdminSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {


        adminData.Password = await bcrypt.hash(adminData.Password, 10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
            resolve(data.insertedId)
        })
    })

},
doAdminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
        let loginStatus = false
        let response = {}
        let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: userData.Email })
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

    addProduct:(product,callback)=>{
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
           callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
      return new Promise(async(resolve,reject)=>{
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        
      })
    },
    deleteProduct:(proId)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new ObjectId(proId)}).then((response)=>{
          console.log(response);
          
          resolve(response)
        })
      })
    },
    getProductDetailes:(proId)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId (proId)}).then((product)=>{
          console.log(product);
          
      resolve(product)
        })
      })
    },
    UpdateProduct:(proId,proDetailes)=>{
      return new  Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new  ObjectId (proId)},
        {$set:{
               Name:proDetailes.Name,
               Category:proDetailes.Category,
               Description:proDetailes.Description,
               Price:proDetailes.Price
        }}
        ).then((response)=>{
          resolve()
        })
      })
    },
    getOrdersCount: (proId) => {
      return new Promise(async (resolve, reject) => {
          try {
              let result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                  { $match: { 'products.item': new ObjectId(proId) } }, // Match the specific product
                  { $unwind: '$products' }, // Deconstruct the products array
                  { $match: { 'products.item': new ObjectId(proId) } }, // Match again after unwind
                  { $group: { _id: null, totalQuantity: { $sum: '$products.quantity' } } } // Sum the quantity
              ]).toArray();
  
              let totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
              resolve(totalQuantity);
          } catch (error) {
              reject(error);
          }
      });
  }
  
  
}