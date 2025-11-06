#!/bin/bash
export NODE_ENV=test
npx jest tests/document-upload-api.test.js --verbose --maxWorkers=1 --forceExit --testTimeout=30000
