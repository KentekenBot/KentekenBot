module.exports = {
    presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
        // The models declare their columns with `declare`, which babel refuses to
        // parse without this. It is also the only correct setting for sequelize:
        // emitting those fields would shadow the getters the ORM puts on the
        // prototype. Until now no test could import a model, which is why the
        // queries had no coverage at all.
        ['@babel/preset-typescript', {allowDeclareFields: true}],
    ],
};
