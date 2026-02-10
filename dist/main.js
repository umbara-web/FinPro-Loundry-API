"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_config_1 = require("./configs/env.config");
const error_middleware_1 = __importDefault(require("./common/middlewares/error.middleware"));
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const order_cron_1 = require("./modules/order/order.cron");
const app = (0, express_1.default)();
// middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: env_config_1.BASE_WEB_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public'))); // Serve public folder
// routers
app.use('/api', routes_1.default);
// error middleware
app.use(error_middleware_1.default);
// start cron jobs
(0, order_cron_1.initOrderCron)();
const logger_1 = require("./lib/logger");
app.listen(env_config_1.PORT, () => {
    logger_1.logger.info(`Server started on port ${env_config_1.PORT}`);
});
