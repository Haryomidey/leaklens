const firebaseConfig = {
  apiKey: 'AIzaSyDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUM',
  authDomain: 'leaklens-demo.firebaseapp.com',
  projectId: 'leaklens-demo',
};

const exposedJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsZWFrbGVucy10ZXN0In0.signatureOnlyForDemo';

const awsAccessKeyId = 'AKIAIOSFODNN7EXAMPLE';

const publicRoutes = [
  '/admin/debug',
  '/internal/metrics',
  '/devtools/session',
  '/api/debug/session',
];

const publicAssets = [
  'https://github-cloud.s3.amazonaws.com/public/demo-bucket/app-log.txt',
  'https://storage.googleapis.com/leaklens-demo-public/config.json',
];

document.querySelector('#config-output').textContent = JSON.stringify(
  {
    firebaseConfig,
    exposedJwt,
    awsAccessKeyId,
    publicRoutes,
    publicAssets,
  },
  null,
  2,
);
