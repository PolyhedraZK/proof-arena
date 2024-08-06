# Inter process communication (prover, verifier <-> SPJ)

We use [named pipe](https://en.wikipedia.org/wiki/Named_pipe) for prover, verifier to interact with SPJ.

An example of IPC written by Polyhedra in golang is located here: [ipc.go](https://github.com/PolyhedraZK/proof-arena/problems/IPCUtils/ipc.go)

# Data transmission format
To transmit a byte array `var b []byte` we use following encoding of the array:

1. Encode the length of the array in little endian: 
```golang
lengthByte := make([]byte, 8)
binary.LittleEndian.PutUint64(lengthByte, len(b))
```

2. Concatenate `lengthByte` with `b`:
```golang
encoded := append(lengthByte[:], b[:])
```

To send `var b []byte` array to SPJ, you simply encode `b` into `encoded` and write it to the pipe.

To receive an array from SPJ, you do as following:

1. Read first 8 bytes as length byte
```golang
lengthByte := make([]byte, 8)
r.read(lengthByte) // here we assume r is the pipe we are going to read
length := binary.LittleEndian.Uint64(lengthByte)
```

2. Read the remaining `length` number of bytes
```golang
receivedByte := make([]byte, length)
r.read(receivedByte) // this is a concept psudeo code, because I omitted error handling
```

We provided the golang library as standard way to communicate, you will need to implement your own handling functions if you are not using golang. Make sure your communication library does the same thing as our golang equivalent do.