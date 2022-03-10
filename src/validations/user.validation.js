const joi = require('joi');

const newUserSchema = joi.object({
    email: joi.string()
        .max(64)
        .email()
        .required(),

    password: joi
        .min(8)
        .max(64)

        .regex(/[0-9]/)
        .rule({ message: '{#label} requires at least a number' })

        .regex(/[a-z]/)
        .rule({ message: '{#label} requires at least a lowercase character' })

        .regex(/[A-Z]/)
        .rule({ message: '{#label} requires at least an uppercase character' })

        .regex(/[^a-zA-Z0-9]/)
        .rule({ message: '{#label} requires at least a special character' })

        .required(),

    displayName: joi.string()
        .min(3)
        .max(64)

        .regex(/[a-zA-Z ]+/)
        .rule({ message: '{#label} must only be string' })

        .required(),

    phoneNumber: joi.string()
        .max(64)

        .regex(/[0-9]+/)
        .rule({ message: '{#label} must be numbers' })

        .required()
});

module.exports = { newUserSchema };