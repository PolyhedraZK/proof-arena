module github.com/PolyhedraZK/proof-arena/problems/keccak256_hash/SPJ

go 1.22.5

toolchain go1.22.6

require (
	github.com/PolyhedraZK/proof-arena/SPJ v0.0.0-00010101000000-000000000000
	golang.org/x/crypto v0.26.0
)

require (
	github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils v0.0.0-00010101000000-000000000000 // indirect
	golang.org/x/sys v0.23.0 // indirect
)

replace github.com/PolyhedraZK/proof-arena/SPJ => ../../../SPJ

replace github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils => ../../../SPJ/IPCUtils
