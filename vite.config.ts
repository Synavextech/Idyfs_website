
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file from project root
    const env = loadEnv(mode, process.cwd(), "");
    const allowedHosts = env.ALLOWED_HOSTS
        ? env.ALLOWED_HOSTS.split(",").map(host => host.trim())
        : ["i-report.info", "www.i-report.info"];

    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "client", "src"),
                "@db": path.resolve(__dirname, "server", "db"),
                "@shared": path.resolve(__dirname, "shared"),
            },
        },
        envDir: path.resolve(__dirname),
        server: {
            port: 3000,
            allowedHosts,
            proxy: {
                "/api": {
                    target: "http://localhost:5000",
                    changeOrigin: true,
                },
            },
        },
        root: path.resolve(__dirname, "client"),
        build: {
            outDir: path.resolve(__dirname, "dist/public"),
            emptyOutDir: true,
        },
    };
});
