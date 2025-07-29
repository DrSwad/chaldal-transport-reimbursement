## Setup Instructions

- Create a new Google Cloud project [here](https://console.cloud.google.com/projectcreate).
- Enable the Gmail API in Google Cloud console [here](https://console.cloud.google.com/flows/enableapi?apiid=gmail.googleapis.com).
- Configure OAuth consent screen and add yourself as a test user in Google Cloud console [here](https://console.cloud.google.com/auth/audience).
- Create a Desktop App Client ID in Google Cloud console [here](https://console.cloud.google.com/auth/clients) and save the `credentials.json` file in the root directory of this project.

## Build & Run

1. Copy the contents of the `.env.example` file to a `.env` next to it, and put the microsoft form URL there.
2. Tested with Node v22. Install dependencies with `pnpm i` (or `npm i`).
3. Run `pnpm build && pnpm start` (or `npm run build && npm run start`) to build and run the app.