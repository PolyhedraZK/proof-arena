module github.com/PolyhedraZK/proof-arena/problems/keccak/spj

go 1.22.5

require golang.org/x/crypto v0.26.0

require (
	github.com/PolyhedraZK/proof-arena/problems/IPCUtils v0.0.0
	go.uber.org/zap v1.27.0
)

replace github.com/PolyhedraZK/proof-arena/problems/IPCUtils => ../../IPCUtils

require (
	go.uber.org/multierr v1.10.0 // indirect
	golang.org/x/sys v0.23.0 // indirect
)
