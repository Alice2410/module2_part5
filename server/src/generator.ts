import * as rfs from "rotating-file-stream";
import * as config from "./config";

const generator = () => {
    let ISOTime = (new Date(Date.now())).toISOString().slice(0, -5).replace( /[T]/, '_');

    return ISOTime;
};

export let accessLogStream = rfs.createStream( generator, {
    interval: '1h',
    path: config.LOG_PATH,
});