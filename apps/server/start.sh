#!/bin/sh

set -ex
cd server
npx prisma migrate deploy
npm run start