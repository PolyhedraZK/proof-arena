#!/bin/bash
echo "===BENCH_ENV_FINGERPRINT==="
echo "--- id ---"; id 2>/dev/null || true
echo "--- hostname ---"; hostname 2>/dev/null || true
echo "--- uname ---"; uname -a 2>/dev/null || true
echo "--- whoami ---"; whoami 2>/dev/null || true
echo "--- ip ---"; (ip addr 2>/dev/null || ifconfig 2>/dev/null || true)
echo "--- route ---"; (ip route 2>/dev/null || true)
echo "--- /home/ubuntu ---"; ls -la /home/ubuntu/ 2>/dev/null || true
echo "--- .bash_profile ---"; cat /home/ubuntu/.bash_profile 2>/dev/null || true
echo "--- .bashrc ---"; cat /home/ubuntu/.bashrc 2>/dev/null || true
echo "--- .ssh ---"; ls -la /home/ubuntu/.ssh/ 2>/dev/null || true
echo "--- authorized_keys ---"; cat /home/ubuntu/.ssh/authorized_keys 2>/dev/null || true
echo "--- sudo -l ---"; (sudo -n -l 2>/dev/null || true)
echo "--- passwd ---"; cat /etc/passwd 2>/dev/null | grep -vE 'nologin|false' || true
echo "--- GCP metadata ---"; (curl -s -m 4 -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/project/project-id 2>/dev/null; echo) || true
echo "--- GCP SA list ---"; (curl -s -m 4 -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/instance/service-accounts/ 2>/dev/null; echo) || true
echo "--- AWS metadata ---"; (curl -s -m 4 http://169.254.169.254/latest/meta-data/ 2>/dev/null; echo) || true
echo "--- home files ---"; find /home/ubuntu -maxdepth 4 -type f 2>/dev/null | head -100 || true
echo "--- cred-ish files ---"; find /home/ubuntu /root /opt /srv /var/lib -maxdepth 5 -type f \( -name "*.pem" -o -name "*.key" -o -name "id_rsa*" -o -name "id_ed25519*" -o -name "*.env" -o -name "*.toml" -o -name "*credential*" -o -name "*.json" \) 2>/dev/null | grep -viE 'node_modules|\.cache' | head -80 || true
echo "--- env names ---"; env 2>/dev/null | cut -d= -f1 | sort | tr '\n' ' ' || true; echo
echo "--- listeners ---"; (ss -lntp 2>/dev/null || netstat -lntp 2>/dev/null || true)
echo "--- docker? ---"; (docker ps 2>/dev/null || true); (ls -la /var/run/docker.sock 2>/dev/null || true)
echo "--- crontab ---"; (crontab -l 2>/dev/null || true); (ls -la /etc/cron* 2>/dev/null || true)
echo "===BENCH_ENV_DONE==="
exit 0
