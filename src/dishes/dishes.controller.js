const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
    res.json({ data: dishes });
}

function checkNewDish(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body
    
    const requiredFields = {
        name, 
        description,
        price,
        image_url,
    }
    
    for (let field in requiredFields) {
        if (!requiredFields[field]) {
            return next({ status: 400, message: `Dish must include a ${field}` });
        }
    }

    const prices = requiredFields.price;
    if (typeof prices !== "number" || prices <= 0) {
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        });
    }
    next();
}

function read(req, res, next) {
    const dish = res.locals.dish;
    res.json({ data: dish });
}

function create(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };

    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const doesExist = dishes.find((dish) => dish.id === dishId);

    if (doesExist) {
        res.locals.dish = doesExist;
        next()
    }

    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    })
}

function update(req, res, next) {
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body

    if (id && dishId !== id) {
        next({
            status: 400,
            message: `Dish id does not match route id. DIsh: ${id}, Route: ${dishId}`,
        });
    }

    const updatedDish = {
        name,
        description,
        price,
        image_url,
    }

    Object.assign(res.locals.dish, updatedDish);
    res.json({ data: res.locals.dish });
}
 
module.exports = {
    list, 
    create: [checkNewDish, create],
    read: [dishExists, read],
    update: [dishExists, checkNewDish, update],
}