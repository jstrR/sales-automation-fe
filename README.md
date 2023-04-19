# sales-automation-fe

## Docker build image

1. `docker build --tag sales-automation-fe .`
1. `docker run --restart unless-stopped -p 3000:3000 -d sales-automation-fe`

## Local run

1. `npm i`
2. `npm start` or `npm run dev`

## ENV VARS

`PUBLIC_API_URL=`

`PUBLIC_VACANCIES_TG_CHANNELS=` - Telegram channels ids to parse from (ex: `it_outstaff, BoardOutsource, IT_REMOTE_PROJECTS`)
