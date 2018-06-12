module.exports = {
    dev: { publicPath: '/dist/' },
    add: (_, middlewares) => { middlewares.webpack(); },
};
