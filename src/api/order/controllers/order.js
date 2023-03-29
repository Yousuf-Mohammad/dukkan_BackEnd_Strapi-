const stripe = require('stripe')(process.env.STRIPE_KEY);
'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
    async create(ctx) {
        const { products } = ctx.request.body;
        const lineItems = await Promise.all()
        products.map(async (item) => {
            items = await strapi
                .service("api::product.product")
                .findOne(item.id)

            return {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: items.title,
                    },
                    unit_amount: items.price * 100
                },
                quantity: items.quantity
            };
        })
        try {
            const session = await stripe.checkout.session.create({
                mode: "payment",
                success_url: `${process.env.CLIENT_URL}?success=true`,
                cancel_url: `${process.env.CLIENT_URL}?success=false`,
                line_items: lineItems,
                shipping_address_collection: { allowed_countries: ["US", "BD"] },
                payment_method_types: ["card"],
            })

            await strapi.service("api::order:order").create({
                data: {
                    products,
                    stripeID: session.id,
                }
            });
            return { stripeSession: session };
        } catch (error) {
            ctx.response.status = 500;
            return error;
        }
    }
}));
