import { Server } from '@grpc/grpc-js'
import { IServerReflectionServer, ServerReflectionService } from '../../../dist/test/api/v1/reflection_grpc_pb'
import { FileDescriptorResponse, ListServiceResponse, ServerReflectionRequest, ServerReflectionResponse, ServiceResponse } from '../../../dist/test/api/v1/reflection_pb'
import { FileDescriptorSet, FileDescriptorProto, ServiceDescriptorProto, IFileDescriptorProto } from 'protobufjs/ext/descriptor'
import { readFile, readFileSync } from 'fs'
import { loadSync, Root } from 'protobufjs'


// const processMessage = (fd: IFileDescriptorProto, prefix: string,)

// // const processFileDescriptor = (fd: IFileDescriptorProto) => {
// //     fd.package
// // }

const bindata = Buffer.from(`
/examples/helloworld/helloworld/helloworld.proto
helloworld""

HelloRequest
name (	Rname"&

HelloReply
message (	Rmessage2I
Greeter>
SayHello.helloworld.HelloRequest.helloworld.HelloReply"Bg
o.grpc.examples.helloworldBHelloWorldProtoPZ5google.golang.org/grpc/examples/helloworld/helloworldbproto3`)

export const addReflection = (server: Server) => {
    const root = loadSync('/home/smolijar/Projects/grpc-go/examples/helloworld/helloworld/helloworld.proto')
    const descriptor = (root as any).toDescriptor("proto3")
    const file = descriptor.file[0] as any
    const fo = FileDescriptorProto.encode(file.messageType[0])
    const mts = file.messageType.map((mt: any) => FileDescriptorProto.encode(mt).finish())
    const fields = file.messageType.map((mt: any) => FileDescriptorProto.encode(mt).finish())
    const ss = file.service.map((s: any) => FileDescriptorProto.encode(s).finish())
    const fs = FileDescriptorProto.encode(file).finish()
    console.log(Root)
    console.log(JSON.stringify(file.toJSON()))
    // console.log(
    //     FileDescriptorSet.decode(contents)
    // )
    const impl: IServerReflectionServer = {
        serverReflectionInfo: call => {
            call.on('data', (data: ServerReflectionRequest) => {
                const cs = data.getMessageRequestCase()
                // console.log(data.toObject())
                root
                // console.log({f: FileDescriptorSet.encode(root).finish().toString() })
                const res = new ServerReflectionResponse()
                const x = new FileDescriptorResponse()
                x.setFileDescriptorProtoList([fs])
                console.log("-------")
                console.log(fs.toString())
                console.log("-------")

                res.setFileDescriptorResponse(x)
                switch(cs) {
                    case ServerReflectionRequest.MessageRequestCase.LIST_SERVICES:
                        console.log('LIST_SERVICES')
                        const listServiceResponse = new ListServiceResponse()
                        listServiceResponse.setServiceList(['grpc.reflection.v1alpha.ServerReflection', 'helloworld.Greeter'].map(n => {
                            const response = new ServiceResponse()
                            response.setName(n)
                            return response
                        }))
                        res.setListServicesResponse(listServiceResponse)
                        break;
                    case ServerReflectionRequest.MessageRequestCase.ALL_EXTENSION_NUMBERS_OF_TYPE:
                        console.log('ALL_EXTENSION_NUMBERS_OF_TYPE')
                        break;
                    case ServerReflectionRequest.MessageRequestCase.FILE_BY_FILENAME:
                        console.log('FILE_BY_FILENAME')
                        break;
                    case ServerReflectionRequest.MessageRequestCase.FILE_CONTAINING_EXTENSION:
                        console.log('FILE_CONTAINING_EXTENSION')
                        break;
                    case ServerReflectionRequest.MessageRequestCase.FILE_CONTAINING_SYMBOL:
                        console.log('FILE_CONTAINING_SYMBOL')
                        break;
                    }
                // console.log({type: res.getMessageResponseCase()})
                call.write(res)
                call.end()
            })
        }
    }
  server.addService(ServerReflectionService, impl)
}
