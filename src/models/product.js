const Product = class Product {
    constructor (id, name, price, description, quantityPurchased) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.quantityPurchased = quantityPurchased;
    }
}

module.exports = Product;