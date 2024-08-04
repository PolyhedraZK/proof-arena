module github.com/PolyhedraZK/proof-arena/problems/keccak/spj

go 1.22.5

require golang.org/x/crypto v0.25.0
require github.com/PolyhedraZK/proof-arena/problems/IPCUtils v0.0.0

replace github.com/PolyhedraZK/proof-arena/problems/IPCUtils => ../../IPCUtils

require (
	github.com/seccomp/libseccomp-golang v0.10.0
	golang.org/x/sys v0.22.0 // indirect
)
