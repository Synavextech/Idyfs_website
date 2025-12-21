module.exports = {
    apps: [
        {
            name: "idyfs-website",
            script: "dist/index.js",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
