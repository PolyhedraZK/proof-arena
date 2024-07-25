import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock({
  url: '/api/v1/prover/1812781047763439616',
  method: 'GET',
  response(req, res, next) {
    res.end(
      JSON.stringify({
        id: '1812781047763439616',
        account: '101701927354447676431',
        prover_name: 'keccak256',
        internal_name: 'keccak256',
        prover_type: 1,
        api_key: 'hjkadhkaskdhaksdnkasndklansldnasldsadad',
        description: 'test_description keccak256',
        binary_path: 'https://storage.googleapis.com/proof-cloud-dev/keccak256',
        data_directory_path: 'https://storage.googleapis.com/proof-cloud-dev/output',
        pk_size: 100020202,
        r1cs_size: 10299332,
        circuit_name: 'keccak256',
        visibility: 1,
        createTime: 0,
        status: 3,
        cpu: 1,
        memory: 1024,
      })
    );
  },
});
