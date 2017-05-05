import { Application, Router } from "express";
import { Annotation, RestMethod } from "@artifacter/common";

import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as cors from "cors";
import * as fs from "fs";

import { RestApi } from "./rest.api";

/**
 * @class WorkerHttpApiServer
 * @see npm @artifacter/worker
 * @author arthmoeros (Arturo Saavedra) artu.saavedra@gmail.com
 * 
 * This singleton class starts up a nodejs express server, serving the REST api available
 * to request artifact generation to the Worker
 * 
 */
export class RestExpressServer {

    /**
     * Singleton instance
     */
    private static readonly instance: RestExpressServer = new RestExpressServer();

    public static start() {
    }

    /**
     * Express.js reference
     */
    private expressApp: Application;

    /**
     * Node server reference
     */
    private server: http.Server;

    /**
     * Server config JSON @see ./config/server-config.json
     */
    private config: any;

    /**
     * Server port
     */
    private port: number;

    /**
     * Creates the singleton
     */
    private constructor() {
        console.info("Starting REST express server")
        console.info("Reading configuration located at " + __dirname + "/../config/server-config.json");
        this.config = JSON.parse(fs.readFileSync(__dirname + "/../config/server-config.json").toString());

        console.info("Setting up express.js");
        this.expressApp = express();
        console.info("Setting up Middleware");
        this.setupMiddleware();
        console.info("Setting up routes");
        this.setupRoutes();
        this.port = this.config.listenPort;
        this.expressApp.set("port", this.port);
        console.info("Creating node.js HTTP Server");
        this.server = http.createServer(this.expressApp);
        this.server.listen(this.port);
        this.server.on("error", (error) => this.onError(error));
        this.server.on("listening", () => this.onListening());
        console.info("Server started");
    }

    /**
     * Setups de Middleware, CORS uses allowed hosts to invoke this API
     */
    private setupMiddleware() {
        console.info("Setting up CORS to accept only XHR requests from " + this.config.corsOptions.origin)
        this.expressApp.use(cors(this.config.corsOptions));
        this.expressApp.use(logger("dev"));
    }

    /**
     * Sets the routes using the decorator @RestService
     * on the methods contained into the RestApi class
     */
    private setupRoutes() {
        let router: Router = express.Router();
        let restApi: RestApi = new RestApi();
        let members: string[] = Object.getOwnPropertyNames(RestApi.prototype);

        members.forEach(member => {
            if (typeof restApi[member] == "function") {
                let restMetadata = Annotation.getRestServiceMetadata(restApi, member);
                if (restMetadata) {
                    let routeFunction = this.resolveRouteFunction(router, restMetadata.method);
                    routeFunction(restMetadata.resource, this.resolveBodyParser(restMetadata.requestContentType.value), (req, res, next) => {
                        res.contentType(restMetadata.responseContentType.value);
                        let restMethod = restApi[member];
                        restMethod(req, res, next);
                    });
                    console.info("Setup route for method RestApi#" + member + " on path '" + restMetadata.resource + "', expects a '" + restMetadata.requestContentType.value + "' on request and a '" + restMetadata.responseContentType.value + "' on response");
                }
            }
        });
        this.expressApp.use(router);
    }

    private resolveRouteFunction(router: Router, method: RestMethod) {
        if (method == RestMethod.POST) {
            return router.post;
        } else if (method == RestMethod.GET) {
            return router.get;
        } else if (method == RestMethod.PUT) {
            return router.put;
        } else if (method == RestMethod.DELETE) {
            return router.delete;
        } else {
            throw Error("Undefined RestMethod");
        }
    }

    private resolveBodyParser(contentType: string): express.RequestHandler {
        if (contentType == "application/json") {
            return bodyParser.json();
        } else if (contentType == "text/plain") {
            return bodyParser.text();
        } else if (contentType == "application/x-www-form-urlencoded") {
            return bodyParser.urlencoded();
        } else {
            return bodyParser.raw();
        }
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    private onError(error) {
        if (error.syscall !== "listen") {
            throw error;
        }

        var bind = typeof this.port === "string"
            ? "Pipe " + this.port
            : "Port " + this.port;

        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */
    private onListening() {
        var addr = this.server.address()
        var bind = typeof addr === "string"
            ? "pipe " + addr
            : "port " + addr.port;
        console.info("Listening on " + bind);
    }

}