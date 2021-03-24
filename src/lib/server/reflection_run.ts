import { Server, ServerCredentials } from "@grpc/grpc-js";
import { addReflection } from "./reflection";

const server = new Server()
addReflection(server)
server.bindAsync('localhost:3000', ServerCredentials.createInsecure(), (e, port) => {
    console.log({e, port})
    server.start()
    console.log('started')
})